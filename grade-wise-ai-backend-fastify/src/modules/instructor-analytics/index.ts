import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "../../hooks/authenticate.js";
import { authorize } from "../../hooks/authorize.js";
import { toHttpError } from "../../utils/errors.js";
import { db } from "../../db/index.js";
import {
  assessments,
  assessmentAttempts,
  users,
  generatedQuestions,
  studentAnswers,
  enrollments,
} from "../../db/schema.js";
import { eq, and, sql, count } from "drizzle-orm";

const INSTRUCTOR_ROLES = ["instructor", "admin", "super_admin"] as const;

export default async function instructorAnalyticsModule(app: FastifyInstance) {
  const f = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/instructor-analytics/  (dashboard overview)
  f.get("/", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number; role: string };
      const instructorId = user.id;

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

      return reply.send({
        success: true,
        data: {
          totalAssessments: totalAssessments?.count ?? 0,
          totalStudents: totalEnrolled?.count ?? 0,
          completedAttempts: completed?.count ?? 0,
          averageScore: Math.round((avgScore?.avg ?? 0) * 100) / 100,
        },
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/instructor-analytics/assessments  (executed assessments)
  f.get("/assessments", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await db
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
        .where(and(eq(assessments.instructorId, user.id), eq(assessments.isExecuted, true)))
        .groupBy(assessments.id)
        .orderBy(sql`${assessments.createdAt} DESC`);

      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/instructor-analytics/assessment/:id/students
  f.get("/assessment/:id/students", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: { params: z.object({ id: z.coerce.number().int().positive() }) },
  }, async (request, reply) => {
    try {
      const data = await db
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
            eq(assessmentAttempts.assessmentId, request.params.id)
          )
        )
        .where(eq(enrollments.assessmentId, request.params.id))
        .orderBy(users.name);

      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/instructor-analytics/assessment/:id/student/:studentId/questions
  f.get("/assessment/:id/student/:studentId/questions", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: {
      params: z.object({
        id: z.coerce.number().int().positive(),
        studentId: z.coerce.number().int().positive(),
      }),
    },
  }, async (request, reply) => {
    try {
      const attempt = await db
        .select()
        .from(assessmentAttempts)
        .where(
          and(
            eq(assessmentAttempts.assessmentId, request.params.id),
            eq(assessmentAttempts.studentId, request.params.studentId),
            eq(assessmentAttempts.status, "completed")
          )
        )
        .limit(1);

      if (!attempt[0]) {
        return reply.code(404).send({ success: false, message: "No completed attempt found." });
      }

      const questions = await db
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
            eq(studentAnswers.attemptId, attempt[0].id)
          )
        )
        .where(eq(generatedQuestions.attemptId, attempt[0].id))
        .orderBy(generatedQuestions.questionOrder);

      return reply.send({
        success: true,
        data: {
          attemptId: attempt[0].id,
          score: attempt[0].score,
          completedAt: attempt[0].completedAt,
          questions,
        },
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });
}
