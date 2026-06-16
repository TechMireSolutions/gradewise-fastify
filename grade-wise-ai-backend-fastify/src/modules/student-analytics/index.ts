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
  enrollments,
  generatedQuestions,
  studentAnswers,
} from "../../db/schema.js";
import { eq, and, sql, desc } from "drizzle-orm";

export default async function studentAnalyticsModule(app: FastifyInstance) {
  const f = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/student-analytics/overview
  f.get("/overview", {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };

      const [enrolled] = await db
        .select({ count: sql<number>`count(distinct ${enrollments.assessmentId})` })
        .from(enrollments)
        .where(eq(enrollments.studentId, user.id));

      const [completed] = await db
        .select({ count: sql<number>`count(*)` })
        .from(assessmentAttempts)
        .where(
          and(
            eq(assessmentAttempts.studentId, user.id),
            eq(assessmentAttempts.status, "completed")
          )
        );

      const [avg] = await db
        .select({ avg: sql<number>`avg(cast(${assessmentAttempts.score} as float))` })
        .from(assessmentAttempts)
        .where(
          and(
            eq(assessmentAttempts.studentId, user.id),
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
            eq(assessmentAttempts.studentId, user.id),
            eq(assessmentAttempts.status, "completed")
          )
        )
        .orderBy(desc(assessmentAttempts.completedAt))
        .limit(5);

      return reply.send({
        success: true,
        data: {
          totalEnrolled: enrolled?.count ?? 0,
          completedAssessments: completed?.count ?? 0,
          averageScore: Math.round((avg?.avg ?? 0) * 100) / 100,
          recentAttempts,
        },
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/student-analytics/assessments
  f.get("/assessments", {
    preHandler: [authenticate, authorize("student")],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await db
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
            eq(assessmentAttempts.studentId, user.id)
          )
        )
        .where(eq(enrollments.studentId, user.id))
        .orderBy(desc(enrollments.enrolledAt));

      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/student-analytics/performance
  f.get("/performance", {
    preHandler: [authenticate],
    schema: {
      querystring: z.object({
        timeRange: z.enum(["7d", "30d", "90d", "all"]).optional().default("30d"),
      }),
    },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await db
        .select({
          title: assessments.title,
          score: assessmentAttempts.score,
          completedAt: assessmentAttempts.completedAt,
        })
        .from(assessmentAttempts)
        .innerJoin(assessments, eq(assessmentAttempts.assessmentId, assessments.id))
        .where(
          and(
            eq(assessmentAttempts.studentId, user.id),
            eq(assessmentAttempts.status, "completed")
          )
        )
        .orderBy(assessmentAttempts.completedAt)
        .limit(50);

      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/student-analytics/assessment/:id
  f.get("/assessment/:id", {
    preHandler: [authenticate],
    schema: { params: z.object({ id: z.coerce.number().int().positive() }) },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const attempt = await db
        .select()
        .from(assessmentAttempts)
        .where(
          and(
            eq(assessmentAttempts.assessmentId, request.params.id),
            eq(assessmentAttempts.studentId, user.id),
            eq(assessmentAttempts.status, "completed")
          )
        )
        .orderBy(desc(assessmentAttempts.completedAt))
        .limit(1);

      if (!attempt[0]) {
        return reply.code(404).send({ success: false, message: "No completed attempt found." });
      }

      const assessment = await db
        .select()
        .from(assessments)
        .where(eq(assessments.id, request.params.id))
        .limit(1);

      return reply.send({
        success: true,
        data: {
          assessment: assessment[0],
          attempt: attempt[0],
        },
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/student-analytics/assessment/:id/questions
  f.get("/assessment/:id/questions", {
    preHandler: [authenticate],
    schema: { params: z.object({ id: z.coerce.number().int().positive() }) },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const attempt = await db
        .select()
        .from(assessmentAttempts)
        .where(
          and(
            eq(assessmentAttempts.assessmentId, request.params.id),
            eq(assessmentAttempts.studentId, user.id),
            eq(assessmentAttempts.status, "completed")
          )
        )
        .orderBy(desc(assessmentAttempts.completedAt))
        .limit(1);

      if (!attempt[0]) {
        return reply.code(404).send({ success: false, message: "No completed attempt found." });
      }

      const questions = await db
        .select({
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

      return reply.send({ success: true, data: questions });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/student-analytics/report
  f.get("/report", {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
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
            eq(assessmentAttempts.studentId, user.id),
            eq(assessmentAttempts.status, "completed")
          )
        )
        .orderBy(desc(assessmentAttempts.completedAt));

      const totalScore = attempts.reduce((sum, a) => sum + Number(a.score ?? 0), 0);
      const avgScore = attempts.length > 0 ? totalScore / attempts.length : 0;

      return reply.send({
        success: true,
        data: {
          totalAttempts: attempts.length,
          averageScore: Math.round(avgScore * 100) / 100,
          attempts,
        },
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/student-analytics/recommendations
  f.get("/recommendations", {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      // Find topics where student scored < 60%
      const weakTopics = await db
        .select({
          title: assessments.title,
          score: assessmentAttempts.score,
        })
        .from(assessmentAttempts)
        .innerJoin(assessments, eq(assessmentAttempts.assessmentId, assessments.id))
        .where(
          and(
            eq(assessmentAttempts.studentId, user.id),
            eq(assessmentAttempts.status, "completed"),
            sql`cast(${assessmentAttempts.score} as float) < 60`
          )
        )
        .orderBy(assessmentAttempts.score)
        .limit(5);

      const recommendations = weakTopics.map((t) => ({
        assessmentTitle: t.title,
        score: t.score,
        recommendation: `Review the material for "${t.title}" — your score was below passing threshold.`,
      }));

      return reply.send({ success: true, data: recommendations });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });
}
