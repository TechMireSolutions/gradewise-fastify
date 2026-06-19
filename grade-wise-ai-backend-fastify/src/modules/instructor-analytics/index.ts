import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "../../hooks/authenticate.js";
import { authorize } from "../../hooks/authorize.js";
import { INSTRUCTOR_ROLES } from "../../constants/roles.js";
import { IdParamSchema } from "../../schemas/common.js";
import { toHttpError } from "../../utils/errors.js";
import {
  getInstructorOverview,
  getInstructorExecutedAssessments,
  getAssessmentStudents,
  getStudentAttemptQuestions,
} from "./instructor-analytics.service.js";

export default async function instructorAnalyticsModule(app: FastifyInstance) {
  const f = app.withTypeProvider<ZodTypeProvider>();

  f.get("/", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await getInstructorOverview(user.id);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  f.get("/assessments", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await getInstructorExecutedAssessments(user.id);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  f.get("/assessment/:id/students", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: { params: IdParamSchema },
  }, async (request, reply) => {
    try {
      const data = await getAssessmentStudents(request.params.id);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  f.get("/assessment/:id/student/:studentId/questions", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: {
      params: IdParamSchema.extend({
        studentId: z.coerce.number().int().positive(),
      }),
    },
  }, async (request, reply) => {
    try {
      const data = await getStudentAttemptQuestions(
        request.params.id,
        request.params.studentId
      );
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });
}
