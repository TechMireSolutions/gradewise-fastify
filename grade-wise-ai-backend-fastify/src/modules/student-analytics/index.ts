import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "../../hooks/authenticate.js";
import { authorize } from "../../hooks/authorize.js";
import { IdParamSchema } from "../../schemas/common.js";
import { toHttpError } from "../../utils/errors.js";
import {
  getStudentOverview,
  getStudentAssessments,
  getStudentPerformance,
  getStudentAssessmentDetail,
  getStudentAssessmentQuestions,
  getStudentReport,
  getStudentRecommendations,
} from "./student-analytics.service.js";

export default async function studentAnalyticsModule(app: FastifyInstance) {
  const f = app.withTypeProvider<ZodTypeProvider>();

  f.get("/overview", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await getStudentOverview(user.id);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  f.get("/assessments", {
    preHandler: [authenticate, authorize("student")],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await getStudentAssessments(user.id);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

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
      const data = await getStudentPerformance(user.id);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  f.get("/assessment/:id", {
    preHandler: [authenticate],
    schema: { params: IdParamSchema },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await getStudentAssessmentDetail(user.id, request.params.id);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  f.get("/assessment/:id/questions", {
    preHandler: [authenticate],
    schema: { params: IdParamSchema },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await getStudentAssessmentQuestions(user.id, request.params.id);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  f.get("/report", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await getStudentReport(user.id);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  f.get("/recommendations", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await getStudentRecommendations(user.id);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });
}
