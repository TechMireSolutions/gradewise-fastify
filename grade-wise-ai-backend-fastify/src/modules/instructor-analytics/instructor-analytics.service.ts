import { db } from "../../db/index.js";
import {
  assessments,
  assessmentAttempts,
  users,
  enrollments,
  resources,
} from "../../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { ForbiddenError, NotFoundError } from "../../utils/errors.js";
import { getCompletedAttempt, getAttemptQuestionsWithAnswers, roundScore } from "../analytics/shared.js";

async function assertCanViewAssessment(
  assessmentId: number,
  userId: number,
  role: string
): Promise<void> {
  const [assessment] = await db
    .select({ id: assessments.id, instructorId: assessments.instructorId })
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);
  if (!assessment) throw new NotFoundError("Assessment");
  if (!["admin", "super_admin"].includes(role) && assessment.instructorId !== userId) {
    throw new ForbiddenError("Access denied to this assessment");
  }
}

export async function getInstructorOverview(instructorId: number) {
  const [assessmentCounts] = await db
    .select({
      total: sql<number>`count(*)`,
      executed: sql<number>`count(case when ${assessments.isExecuted} = true then 1 end)`,
    })
    .from(assessments)
    .where(eq(assessments.instructorId, instructorId));

  const [totalRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(resources)
    .where(eq(resources.uploadedBy, instructorId));

  const [totalEnrolled] = await db
    .select({ count: sql<number>`count(distinct ${enrollments.studentId})` })
    .from(enrollments)
    .innerJoin(assessments, eq(enrollments.assessmentId, assessments.id))
    .where(eq(assessments.instructorId, instructorId));

  const [attemptMetrics] = await db
    .select({
      completed: sql<number>`count(*)`,
      avgScore: sql<number>`avg(cast(${assessmentAttempts.score} as float))`,
    })
    .from(assessmentAttempts)
    .innerJoin(assessments, eq(assessmentAttempts.assessmentId, assessments.id))
    .where(
      and(
        eq(assessments.instructorId, instructorId),
        eq(assessmentAttempts.status, "completed")
      )
    );

  return {
    totalAssessments: Number(assessmentCounts?.total ?? 0),
    executedAssessments: Number(assessmentCounts?.executed ?? 0),
    totalResources: Number(totalRes?.count ?? 0),
    totalStudents: Number(totalEnrolled?.count ?? 0),
    completedAttempts: Number(attemptMetrics?.completed ?? 0),
    averageScore: roundScore(attemptMetrics?.avgScore),
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

export async function getAssessmentStudents(
  assessmentId: number,
  userId: number,
  role: string
) {
  await assertCanViewAssessment(assessmentId, userId, role);
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
  studentId: number,
  userId: number,
  role: string
) {
  await assertCanViewAssessment(assessmentId, userId, role);
  const attempt = await getCompletedAttempt(assessmentId, studentId);
  const questions = await getAttemptQuestionsWithAnswers(attempt.id);

  return {
    attemptId: attempt.id,
    score: attempt.score,
    completedAt: attempt.completedAt,
    questions,
  };
}
