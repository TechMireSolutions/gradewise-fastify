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
  const answerRows: Array<typeof studentAnswers.$inferInsert> = [];

  for (const { questionId, answer } of answers) {
    const question = questionMap.get(questionId);
    if (!question) continue;

    const isCorrect = evaluateAnswer(question, answer);
    const score = isCorrect
      ? Number(question.positiveMarks)
      : answer.trim()
      ? -Number(question.negativeMarks)
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

  if (answerRows.length > 0) {
    await db.insert(studentAnswers).values(answerRows);
  }

  await db
    .update(assessmentAttempts)
    .set({
      status: "completed",
      completedAt: new Date(),
      score: String(Math.max(0, totalScore)),
    })
    .where(eq(assessmentAttempts.id, attemptId));

  return {
    attemptId,
    score: Math.max(0, totalScore),
    totalQuestions: questions.length,
    correctAnswers: answerRows.filter((a) => a.isCorrect).length,
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

  const isStudent = role === "student";
  if (isStudent && attempt[0].studentId !== userId) {
    throw new ForbiddenError("Access denied to this submission");
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

  const results = questions.map((q) => {
    const answer = answerMap.get(q.id);
    return {
      questionId: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      correctAnswer: q.correctAnswer,
      studentAnswer: answer?.studentAnswer ?? null,
      isCorrect: answer?.isCorrect ?? false,
      score: answer?.score ?? "0",
    };
  });

  return {
    attemptId: attempt[0].id,
    score: attempt[0].score,
    status: attempt[0].status,
    startedAt: attempt[0].startedAt,
    completedAt: attempt[0].completedAt,
    language: attempt[0].language,
    results,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function evaluateAnswer(question: GeneratedQuestion, studentAnswer: string): boolean {
  const correct = question.correctAnswer.trim().toLowerCase();
  const given = studentAnswer.trim().toLowerCase();

  if (correct === given) return true;

  if (question.questionType === "true_false") {
    const trueSynonyms = ["true", "yes", "correct", "right"];
    const falseSynonyms = ["false", "no", "incorrect", "wrong"];
    const correctIsTrue = trueSynonyms.includes(correct);
    const givenIsTrue = trueSynonyms.includes(given);
    const givenIsFalse = falseSynonyms.includes(given);
    if (correctIsTrue) return givenIsTrue;
    return givenIsFalse;
  }

  if (question.questionType === "multiple_choice") {
    return false;
  }

  return false;
}
