import { db } from "../../db/index.js";
import {
  assessments,
  assessmentAttempts,
  enrollments,
  generatedQuestions,
  studentAnswers,
} from "../../db/schema.js";
import { eq, and, sql, desc } from "drizzle-orm";
import { getCompletedAttempt, getAttemptQuestionsWithAnswers } from "../analytics/shared.js";

export async function getStudentOverview(studentId: number) {
  const [enrolled] = await db
    .select({ count: sql<number>`count(distinct ${enrollments.assessmentId})` })
    .from(enrollments)
    .where(eq(enrollments.studentId, studentId));

  const [completed] = await db
    .select({ count: sql<number>`count(*)` })
    .from(assessmentAttempts)
    .where(
      and(
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.status, "completed")
      )
    );

  const [avg] = await db
    .select({ avg: sql<number>`avg(cast(${assessmentAttempts.score} as float))` })
    .from(assessmentAttempts)
    .where(
      and(
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.status, "completed")
      )
    );

  const recentAttempts = await db
    .select({
      assessmentId: assessments.id,
      title: assessments.title,
      score: assessmentAttempts.score,
      completedAt: assessmentAttempts.completedAt,
      status: assessmentAttempts.status,
    })
    .from(assessmentAttempts)
    .innerJoin(assessments, eq(assessmentAttempts.assessmentId, assessments.id))
    .where(
      and(
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.status, "completed")
      )
    )
    .orderBy(desc(assessmentAttempts.completedAt))
    .limit(5);

  return {
    totalEnrolled: enrolled?.count ?? 0,
    completedAssessments: completed?.count ?? 0,
    averageScore: Math.round((avg?.avg ?? 0) * 100) / 100,
    recentAttempts,
  };
}

export async function getStudentAssessments(studentId: number) {
  return db
    .select({
      id: assessments.id,
      title: assessments.title,
      enrolledAt: enrollments.enrolledAt,
      status: assessmentAttempts.status,
      score: assessmentAttempts.score,
      completedAt: assessmentAttempts.completedAt,
      attemptId: assessmentAttempts.id,
    })
    .from(enrollments)
    .innerJoin(assessments, eq(enrollments.assessmentId, assessments.id))
    .leftJoin(
      assessmentAttempts,
      and(
        eq(assessmentAttempts.assessmentId, assessments.id),
        eq(assessmentAttempts.studentId, studentId)
      )
    )
    .where(eq(enrollments.studentId, studentId))
    .orderBy(desc(enrollments.enrolledAt));
}

export async function getStudentPerformance(studentId: number) {
  return db
    .select({
      title: assessments.title,
      score: assessmentAttempts.score,
      completedAt: assessmentAttempts.completedAt,
    })
    .from(assessmentAttempts)
    .innerJoin(assessments, eq(assessmentAttempts.assessmentId, assessments.id))
    .where(
      and(
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.status, "completed")
      )
    )
    .orderBy(assessmentAttempts.completedAt)
    .limit(50);
}

export async function getStudentAssessmentDetail(studentId: number, assessmentId: number) {
  const attempt = await getCompletedAttempt(assessmentId, studentId);
  const [assessment] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);

  return { assessment: assessment ?? null, attempt };
}

export async function getStudentAssessmentQuestions(studentId: number, assessmentId: number) {
  const attempt = await getCompletedAttempt(assessmentId, studentId);
  return getAttemptQuestionsWithAnswers(attempt.id);
}

export async function getStudentReport(studentId: number) {
  const attempts = await db
    .select({
      title: assessments.title,
      score: assessmentAttempts.score,
      completedAt: assessmentAttempts.completedAt,
    })
    .from(assessmentAttempts)
    .innerJoin(assessments, eq(assessmentAttempts.assessmentId, assessments.id))
    .where(
      and(
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.status, "completed")
      )
    )
    .orderBy(desc(assessmentAttempts.completedAt));

  const totalScore = attempts.reduce((sum, a) => sum + Number(a.score ?? 0), 0);
  const avgScore = attempts.length > 0 ? totalScore / attempts.length : 0;

  return {
    totalAttempts: attempts.length,
    averageScore: Math.round(avgScore * 100) / 100,
    attempts,
  };
}

export async function getStudentRecommendations(studentId: number) {
  const weakTopics = await db
    .select({
      title: assessments.title,
      score: assessmentAttempts.score,
    })
    .from(assessmentAttempts)
    .innerJoin(assessments, eq(assessmentAttempts.assessmentId, assessments.id))
    .where(
      and(
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.status, "completed"),
        sql`cast(${assessmentAttempts.score} as float) < 60`
      )
    )
    .orderBy(assessmentAttempts.score)
    .limit(5);

  return weakTopics.map((t) => ({
    assessmentTitle: t.title,
    score: t.score,
    recommendation: `Review the material for "${t.title}" — your score was below passing threshold.`,
  }));
}
