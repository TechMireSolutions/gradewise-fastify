import { db } from "../../db/index.js";
import {
  assessments,
  assessmentAttempts,
  users,
  enrollments,
} from "../../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { getCompletedAttempt, getAttemptQuestionsWithAnswers } from "../analytics/shared.js";

export async function getInstructorOverview(instructorId: number) {
  const [totalAssessments] = await db
    .select({ count: sql<number>`count(*)` })
    .from(assessments)
    .where(eq(assessments.instructorId, instructorId));

  const [totalEnrolled] = await db
    .select({ count: sql<number>`count(distinct ${enrollments.studentId})` })
    .from(enrollments)
    .innerJoin(assessments, eq(enrollments.assessmentId, assessments.id))
    .where(eq(assessments.instructorId, instructorId));

  const [completed] = await db
    .select({ count: sql<number>`count(*)` })
    .from(assessmentAttempts)
    .innerJoin(assessments, eq(assessmentAttempts.assessmentId, assessments.id))
    .where(
      and(
        eq(assessments.instructorId, instructorId),
        eq(assessmentAttempts.status, "completed")
      )
    );

  const [avgScore] = await db
    .select({ avg: sql<number>`avg(cast(${assessmentAttempts.score} as float))` })
    .from(assessmentAttempts)
    .innerJoin(assessments, eq(assessmentAttempts.assessmentId, assessments.id))
    .where(
      and(
        eq(assessments.instructorId, instructorId),
        eq(assessmentAttempts.status, "completed")
      )
    );

  return {
    totalAssessments: totalAssessments?.count ?? 0,
    totalStudents: totalEnrolled?.count ?? 0,
    completedAttempts: completed?.count ?? 0,
    averageScore: Math.round((avgScore?.avg ?? 0) * 100) / 100,
  };
}

export async function getInstructorExecutedAssessments(instructorId: number) {
  return db
    .select({
      id: assessments.id,
      title: assessments.title,
      isExecuted: assessments.isExecuted,
      createdAt: assessments.createdAt,
      attemptCount: sql<number>`count(distinct ${assessmentAttempts.id})`,
      completedCount: sql<number>`count(distinct case when ${assessmentAttempts.status} = 'completed' then ${assessmentAttempts.id} end)`,
      avgScore: sql<number>`avg(cast(${assessmentAttempts.score} as float))`,
    })
    .from(assessments)
    .leftJoin(assessmentAttempts, eq(assessmentAttempts.assessmentId, assessments.id))
    .where(and(eq(assessments.instructorId, instructorId), eq(assessments.isExecuted, true)))
    .groupBy(assessments.id)
    .orderBy(sql`${assessments.createdAt} DESC`);
}

export async function getAssessmentStudents(assessmentId: number) {
  return db
    .select({
      studentId: users.id,
      name: users.name,
      email: users.email,
      status: assessmentAttempts.status,
      score: assessmentAttempts.score,
      startedAt: assessmentAttempts.startedAt,
      completedAt: assessmentAttempts.completedAt,
      attemptId: assessmentAttempts.id,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .leftJoin(
      assessmentAttempts,
      and(
        eq(assessmentAttempts.studentId, users.id),
        eq(assessmentAttempts.assessmentId, assessmentId)
      )
    )
    .where(eq(enrollments.assessmentId, assessmentId))
    .orderBy(users.name);
}

export async function getStudentAttemptQuestions(
  assessmentId: number,
  studentId: number
) {
  const attempt = await getCompletedAttempt(assessmentId, studentId);
  const questions = await getAttemptQuestionsWithAnswers(attempt.id);

  return {
    attemptId: attempt.id,
    score: attempt.score,
    completedAt: attempt.completedAt,
    questions,
  };
}
