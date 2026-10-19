import { db } from "../../db/index.js";
import {
  assessments,
  assessmentAttempts,
  generatedQuestions,
  studentAnswers,
  enrollments,
} from "../../db/schema.js";
import { eq, and } from "drizzle-orm";
import { AppError, NotFoundError, ForbiddenError } from "../../utils/errors.js";
import { enqueueAssessmentGeneration } from "../../queue/index.js";
import {
  generateQuestionsForAttempt,
  getAttemptQuestions,
  countAttemptQuestions,
  type sanitizeQuestion,
} from "./generation.js";
import { evaluateAnswer } from "./student-evaluation.service.js";

const useAsyncJobs = () =>
  process.env["USE_ASYNC_JOBS"] === "true" && Boolean(process.env["REDIS_URL"]);

// ─── Start Assessment ────────────────────────────────────────────────────────

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

// ─── Attempt Generation Status ───────────────────────────────────────────────

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

// ─── Submit Assessment ───────────────────────────────────────────────────────

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
      ? -Math.abs(Number(question.negativeMarks ?? 0))
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
