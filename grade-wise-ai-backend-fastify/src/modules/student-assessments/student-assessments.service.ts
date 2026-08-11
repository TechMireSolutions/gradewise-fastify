import { db } from "../../db/index.js";
import {
  assessments,
  assessmentAttempts,
  generatedQuestions,
  studentAnswers,
  enrollments,
  type GeneratedQuestion,
} from "../../db/schema.js";
import { eq, and } from "drizzle-orm";
import { AppError, NotFoundError, ForbiddenError } from "../../utils/errors.js";
import { enqueueAssessmentGeneration } from "../../queue/index.js";
import {
  generateQuestionsForAttempt,
  getAttemptQuestions,
  countAttemptQuestions,
  sanitizeQuestion,
} from "./generation.js";

const useAsyncJobs = () =>
  process.env["USE_ASYNC_JOBS"] === "true" && Boolean(process.env["REDIS_URL"]);

// ─── Start assessment ─────────────────────────────────────────────────────────

export async function startAssessmentService(
  studentId: number,
  assessmentId: number,
  language = "en"
) {
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.assessmentId, assessmentId), eq(enrollments.studentId, studentId)))
    .limit(1);

  if (!enrollment[0]) {
    throw new ForbiddenError("You are not enrolled in this assessment.");
  }

  const pending = await db
    .select()
    .from(assessmentAttempts)
    .where(
      and(
        eq(assessmentAttempts.assessmentId, assessmentId),
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.status, "pending")
      )
    )
    .limit(1);

  if (pending[0]) {
    const questionCount = await countAttemptQuestions(pending[0].id);
    if (questionCount > 0) {
      return {
        attemptId: pending[0].id,
        questions: await getAttemptQuestions(pending[0].id),
        status: "pending",
        language,
      };
    }

    if (useAsyncJobs()) {
      return {
        attemptId: pending[0].id,
        questions: [],
        status: "generating",
        language,
      };
    }

    await generateQuestionsForAttempt({
      attemptId: pending[0].id,
      assessmentId,
      language,
    });

    return {
      attemptId: pending[0].id,
      questions: await getAttemptQuestions(pending[0].id),
      status: "pending",
      language,
    };
  }

  const [attempt] = await db
    .insert(assessmentAttempts)
    .values({ assessmentId, studentId, language, status: "pending" })
    .returning();

  if (!attempt) throw new AppError("CREATE_FAILED", "Failed to start assessment", 500);

  const assessment = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);
  if (!assessment[0]) throw new NotFoundError("Assessment");

  if (useAsyncJobs()) {
    const queued = await enqueueAssessmentGeneration({
      attemptId: attempt.id,
      assessmentId,
      studentId,
      language,
    });

    if (queued) {
      return {
        attemptId: attempt.id,
        questions: [],
        status: "generating",
        language,
      };
    }
  }

  await generateQuestionsForAttempt({
    attemptId: attempt.id,
    assessmentId,
    language,
  });

  return {
    attemptId: attempt.id,
    questions: await getAttemptQuestions(attempt.id),
    status: "pending",
    language,
  };
}

export async function getAssessmentGenerationStatusService(
  studentId: number,
  assessmentId: number,
  attemptId: number
) {
  const attempt = await db
    .select()
    .from(assessmentAttempts)
    .where(
      and(
        eq(assessmentAttempts.id, attemptId),
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.assessmentId, assessmentId)
      )
    )
    .limit(1);

  if (!attempt[0]) throw new NotFoundError("Attempt");

  const questionCount = await countAttemptQuestions(attemptId);
  if (questionCount === 0) {
    return { attemptId, status: "generating", questions: [] as ReturnType<typeof sanitizeQuestion>[] };
  }

  return {
    attemptId,
    status: "ready",
    questions: await getAttemptQuestions(attemptId),
  };
}

// ─── Submit assessment ────────────────────────────────────────────────────────

export async function submitAssessmentService(
  studentId: number,
  assessmentId: number,
  attemptId: number,
  answers: Array<{ questionId: number; answer: string }>
) {
  const attempt = await db
    .select()
    .from(assessmentAttempts)
    .where(
      and(
        eq(assessmentAttempts.id, attemptId),
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.assessmentId, assessmentId)
      )
    )
    .limit(1);

  if (!attempt[0]) throw new AppError("INVALID_ATTEMPT", "Assessment attempt not found", 404);
  if (attempt[0].status === "completed") {
    throw new AppError("ALREADY_SUBMITTED", "This attempt has already been submitted", 400);
  }

  const questions = await db
    .select()
    .from(generatedQuestions)
    .where(eq(generatedQuestions.attemptId, attemptId));

  if (questions.length === 0) {
    throw new AppError("NO_QUESTIONS", "No questions found for this attempt", 400);
  }

  const questionMap = new Map(questions.map((q) => [q.id, q]));
  let totalScore = 0;
  let correctCount = 0;
  const answerRows: Array<typeof studentAnswers.$inferInsert> = [];

  // Fallback map processing to protect metrics if frontend parameters array structural layout variation happens
  const incomingAnswers = Array.isArray(answers) ? answers : [];

  for (const { questionId, answer } of incomingAnswers) {
    const question = questionMap.get(questionId);
    if (!question) continue;

    const isCorrect = evaluateAnswer(question, answer);
    if (isCorrect) correctCount++;

    const score = isCorrect
      ? Number(question.positiveMarks ?? 1)
      : answer.trim()
      ? -Number(question.negativeMarks ?? 0)
      : 0;

    totalScore += score;

    answerRows.push({
      attemptId,
      questionId,
      studentAnswer: answer,
      isCorrect,
      score: String(score),
    });
  }

  // If student skipped or variant array payload was passed, sync remaining elements securely
  if (answerRows.length > 0) {
    await db.insert(studentAnswers).values(answerRows);
  }

  const finalScore = Math.max(0, totalScore);

  await db
    .update(assessmentAttempts)
    .set({
      status: "completed",
      completedAt: new Date(),
      score: String(finalScore),
    })
    .where(eq(assessmentAttempts.id, attemptId));

  return {
    attemptId,
    score: finalScore,
    totalQuestions: questions.length,
    correctAnswers: correctCount,
    status: "completed",
  };
}

// ─── Get submission details ───────────────────────────────────────────────────

export async function getSubmissionDetailsService(
  userId: number,
  submissionId: number,
  role: string
) {
  const attempt = await db
    .select()
    .from(assessmentAttempts)
    .where(eq(assessmentAttempts.id, submissionId))
    .limit(1);

  if (!attempt[0]) throw new NotFoundError("Submission");

  if (role === "student") {
    if (attempt[0].studentId !== userId) {
      throw new ForbiddenError("Access denied to this submission");
    }
  } else if (!["admin", "super_admin"].includes(role)) {
    const [assessment] = await db
      .select({ instructorId: assessments.instructorId })
      .from(assessments)
      .where(eq(assessments.id, attempt[0].assessmentId))
      .limit(1);
    if (!assessment || assessment.instructorId !== userId) {
      throw new ForbiddenError("Access denied to this submission");
    }
  }

  const questions = await db
    .select()
    .from(generatedQuestions)
    .where(eq(generatedQuestions.attemptId, submissionId))
    .orderBy(generatedQuestions.questionOrder);

  const answers = await db
    .select()
    .from(studentAnswers)
    .where(eq(studentAnswers.attemptId, submissionId));

  const answerMap = new Map(answers.map((a) => [a.questionId, a]));
  
  let correctAnswersCount = 0;
  let totalPossibleMarks = 0;

  const results = questions.map((q) => {
    const answer = answerMap.get(q.id);
    const isCorrect = answer?.isCorrect ?? false;
    if (isCorrect) correctAnswersCount++;
    
    totalPossibleMarks += Number(q.positiveMarks ?? 1);

    return {
      questionId: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      correctAnswer: q.correctAnswer,
      studentAnswer: answer?.studentAnswer ?? null,
      isCorrect,
      score: answer?.score ?? "0",
    };
  });

  const numericScore = Number(attempt[0].score ?? 0);
  // Prevent zero structural division bugs
  const calculatedScorePercentage = totalPossibleMarks > 0 
    ? Number(((numericScore / totalPossibleMarks) * 100).toFixed(2)) 
    : 0;

  return {
    attemptId: attempt[0].id,
    score: attempt[0].score,
    scorePercentage: calculatedScorePercentage,
    totalQuestionsCount: questions.length,
    correctAnswersCount,
    totalPossibleMarks,
    status: attempt[0].status,
    startedAt: attempt[0].startedAt,
    completedAt: attempt[0].completedAt,
    language: attempt[0].language,
    results,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeMatchPairs(value: string): Array<[string, string]> | null {
  if (!value || typeof value !== "string") return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }

  const pairs: Array<[string, string]> = [];
  const push = (left: unknown, right: unknown) => {
    const l = String(left ?? "").trim().toLowerCase();
    const r = String(right ?? "").trim().toLowerCase();
    if (l && r) pairs.push([l, r]);
  };

  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      if (Array.isArray(item)) {
        if (item.length >= 2) push(item[0], item[1]);
      } else if (item && typeof item === "object") {
        const entries = Object.entries(item as Record<string, unknown>);
        const first = entries[0];
        if (first) push(first[0], first[1]);
      }
    }
  } else if (parsed && typeof parsed === "object") {
    for (const [left, right] of Object.entries(parsed as Record<string, unknown>)) {
      push(left, right);
    }
  }

  return pairs.length > 0 ? pairs : null;
}

function evaluateAnswer(question: GeneratedQuestion, studentAnswer: string): boolean {
  if (!studentAnswer || !question.correctAnswer) return false;
  
  const correct = question.correctAnswer.trim().toLowerCase();
  const given = studentAnswer.trim().toLowerCase();

  if (correct === given) return true;

  if (question.questionType === "matching") {
    const correctPairs = normalizeMatchPairs(question.correctAnswer);
    const givenPairs = normalizeMatchPairs(studentAnswer);
    if (!correctPairs || !givenPairs) return false;

    const correctMap = new Map(correctPairs);
    const givenMap = new Map(givenPairs);
    if (correctMap.size === 0 || givenMap.size === 0) return false;

    for (const [left, right] of correctMap) {
      if (givenMap.get(left) !== right) return false;
    }
    return true;
  }

  if (question.questionType === "true_false") {
    const trueSynonyms = ["true", "yes", "correct", "right", "ا"];
    const falseSynonyms = ["false", "no", "incorrect", "wrong", "ب"];
    const correctIsTrue = trueSynonyms.includes(correct);
    const givenIsTrue = trueSynonyms.includes(given);
    const givenIsFalse = falseSynonyms.includes(given);
    if (correctIsTrue) return givenIsTrue;
    return givenIsFalse;
  }

  return false;
}