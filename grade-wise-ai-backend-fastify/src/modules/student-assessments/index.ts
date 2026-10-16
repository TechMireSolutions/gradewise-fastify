import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authenticate } from "../../hooks/authenticate.js";
import { authorize } from "../../hooks/authorize.js";
import { toHttpError } from "../../utils/errors.js";
import {
  AssessmentIdParamSchema,
  SubmissionIdParamSchema,
} from "../../schemas/common.js";
import {
  StartAssessmentSchema,
  SubmitAssessmentSchema,
  AttemptStatusParamSchema,
} from "./student-assessments.schema.js";
import {
  startAssessmentService,
  submitAssessmentService,
  getSubmissionDetailsService,
  getAssessmentGenerationStatusService,
} from "./student-assessments.service.js";

export default async function studentAssessmentsModule(app: FastifyInstance) {
  const f = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/taking/assessments/:assessmentId/start
  f.post("/assessments/:assessmentId/start", {
    preHandler: [authenticate, authorize("student")],
    schema: {
      params: AssessmentIdParamSchema,
      body: StartAssessmentSchema,
    },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await startAssessmentService(
        user.id,
        request.params.assessmentId,
        request.body.language
      );
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // POST /api/taking/assessments/:assessmentId/submit
  f.post("/assessments/:assessmentId/submit", {
    preHandler: [authenticate, authorize("student")],
    schema: {
      params: AssessmentIdParamSchema,
      body: SubmitAssessmentSchema,
    },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await submitAssessmentService(
        user.id,
        request.params.assessmentId,
        request.body.attemptId,
        request.body.answers
      );
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/taking/assessments/:assessmentId/attempts/:attemptId/status
  f.get("/assessments/:assessmentId/attempts/:attemptId/status", {
    preHandler: [authenticate, authorize("student")],
    schema: {
      params: AttemptStatusParamSchema,
    },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await getAssessmentGenerationStatusService(
        user.id,
        request.params.assessmentId,
        request.params.attemptId
      );
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/taking/submissions/:submissionId
  f.get("/submissions/:submissionId", {
    preHandler: [authenticate],
    schema: { params: SubmissionIdParamSchema },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number; role: string };
      const data = await getSubmissionDetailsService(
        user.id,
        request.params.submissionId,
        user.role
      );
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });
}
