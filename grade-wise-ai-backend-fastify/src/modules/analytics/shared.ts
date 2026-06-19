import { db } from "../../db/index.js";
import { assessmentAttempts, generatedQuestions, studentAnswers } from "../../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { NotFoundError } from "../../utils/errors.js";

export async function getCompletedAttempt(
  assessmentId: number,
  studentId: number
) {
  const [attempt] = await db
    .select()
    .from(assessmentAttempts)
    .where(
      and(
        eq(assessmentAttempts.assessmentId, assessmentId),
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.status, "completed")
      )
    )
    .orderBy(desc(assessmentAttempts.completedAt))
    .limit(1);

  if (!attempt) throw new NotFoundError("Completed attempt");
  return attempt;
}

export async function getAttemptQuestionsWithAnswers(attemptId: number) {
  return db
    .select({
      questionId: generatedQuestions.id,
      questionText: generatedQuestions.questionText,
      questionType: generatedQuestions.questionType,
      correctAnswer: generatedQuestions.correctAnswer,
      options: generatedQuestions.options,
      studentAnswer: studentAnswers.studentAnswer,
      isCorrect: studentAnswers.isCorrect,
      score: studentAnswers.score,
    })
    .from(generatedQuestions)
    .leftJoin(
      studentAnswers,
      and(
        eq(studentAnswers.questionId, generatedQuestions.id),
        eq(studentAnswers.attemptId, attemptId)
      )
    )
    .where(eq(generatedQuestions.attemptId, attemptId))
    .orderBy(generatedQuestions.questionOrder);
}
