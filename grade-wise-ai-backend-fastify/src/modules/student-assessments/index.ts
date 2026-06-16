import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "../../hooks/authenticate.js";
import { authorize } from "../../hooks/authorize.js";
import { toHttpError } from "../../utils/errors.js";
import {
  startAssessmentService,
  submitAssessmentService,
  getSubmissionDetailsService,
} from "./student-assessments.service.js";

export default async function studentAssessmentsModule(app: FastifyInstance) {
  const f = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/taking/assessments/:assessmentId/start
  f.post("/assessments/:assessmentId/start", {
    preHandler: [authenticate, authorize("student")],
    schema: {
      params: z.object({ assessmentId: z.coerce.number().int().positive() }),
      body: z.object({ language: z.string().optional().default("en") }),
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
      params: z.object({ assessmentId: z.coerce.number().int().positive() }),
      body: z.object({
        attemptId: z.number().int().positive(),
        answers: z.array(
          z.object({
            questionId: z.number().int().positive(),
            answer: z.string(),
          })
        ),
      }),
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

  // GET /api/taking/submissions/:submissionId
  f.get("/submissions/:submissionId", {
    preHandler: [authenticate],
    schema: { params: z.object({ submissionId: z.coerce.number().int().positive() }) },
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
