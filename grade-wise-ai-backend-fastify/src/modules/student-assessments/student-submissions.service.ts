import { db } from "../../db/index.js";
import {
  assessments,
  assessmentAttempts,
  generatedQuestions,
  studentAnswers,
} from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { NotFoundError, ForbiddenError } from "../../utils/errors.js";

// ─── Get Submission Details ──────────────────────────────────────────────────

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
  const calculatedScorePercentage =
    totalPossibleMarks > 0
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
