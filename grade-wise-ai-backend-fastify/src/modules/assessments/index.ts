import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "../../hooks/authenticate.js";
import { authorize } from "../../hooks/authorize.js";
import { toHttpError } from "../../utils/errors.js";
import {
  CreateAssessmentSchema,
  UpdateAssessmentSchema,
  EnrollStudentSchema,
  PhysicalPaperSchema,
} from "./assessments.schema.js";
import {
  createAssessmentService,
  getInstructorAssessmentsService,
  getAssessmentService,
  updateAssessmentService,
  deleteAssessmentService,
  enrollStudentService,
  unenrollStudentService,
  getEnrolledStudentsService,
  previewQuestionsService,
  generatePhysicalPaperService,
} from "./assessments.service.js";

const INSTRUCTOR_ROLES = ["instructor", "admin", "super_admin"] as const;

export default async function assessmentsModule(app: FastifyInstance) {
  const f = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/assessments
  f.post("/", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: { body: CreateAssessmentSchema },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const assessment = await createAssessmentService(request.body, user.id);
      return reply.code(201).send({ success: true, message: "Assessment created.", data: assessment });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/assessments
  f.get("/", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await getInstructorAssessmentsService(user.id);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/assessments/:id
  f.get("/:id", {
    preHandler: [authenticate],
    schema: { params: z.object({ id: z.coerce.number().int().positive() }) },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number; role: string };
      const data = await getAssessmentService(request.params.id, user.id, user.role);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // PUT /api/assessments/:id
  f.put("/:id", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: {
      params: z.object({ id: z.coerce.number().int().positive() }),
      body: UpdateAssessmentSchema,
    },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await updateAssessmentService(request.params.id, request.body, user.id);
      return reply.send({ success: true, message: "Assessment updated.", data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // DELETE /api/assessments/:id
  f.delete("/:id", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: { params: z.object({ id: z.coerce.number().int().positive() }) },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number; role: string };
      await deleteAssessmentService(request.params.id, user.id, user.role);
      return reply.send({ success: true, message: "Assessment deleted." });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // POST /api/assessments/:id/enroll
  f.post("/:id/enroll", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: {
      params: z.object({ id: z.coerce.number().int().positive() }),
      body: EnrollStudentSchema,
    },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      await enrollStudentService(request.params.id, request.body.studentId, user.id);
      return reply.send({ success: true, message: "Student enrolled." });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // DELETE /api/assessments/:id/enroll/:studentId
  f.delete("/:id/enroll/:studentId", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: {
      params: z.object({
        id: z.coerce.number().int().positive(),
        studentId: z.coerce.number().int().positive(),
      }),
    },
  }, async (request, reply) => {
    try {
      await unenrollStudentService(request.params.id, request.params.studentId);
      return reply.send({ success: true, message: "Student unenrolled." });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/assessments/:id/enrolled-students
  f.get("/:id/enrolled-students", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: { params: z.object({ id: z.coerce.number().int().positive() }) },
  }, async (request, reply) => {
    try {
      const data = await getEnrolledStudentsService(request.params.id);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/assessments/:id/preview-questions
  f.get("/:id/preview-questions", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: {
      params: z.object({ id: z.coerce.number().int().positive() }),
      querystring: z.object({ language: z.string().optional().default("en") }),
    },
  }, async (request, reply) => {
    try {
      const questions = await previewQuestionsService(request.params.id, request.query.language);
      return reply.send({ success: true, questions });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // POST /api/assessments/:id/print
  f.post("/:id/print", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: {
      params: z.object({ id: z.coerce.number().int().positive() }),
      body: PhysicalPaperSchema,
    },
  }, async (request, reply) => {
    try {
      const pdfBuffer = await generatePhysicalPaperService(request.params.id, request.body);
      reply.header("Content-Type", "application/pdf");
      reply.header("Content-Disposition", `attachment; filename="assessment-${request.params.id}.pdf"`);
      return reply.send(pdfBuffer);
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });
}
