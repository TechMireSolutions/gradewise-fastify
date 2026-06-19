import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "../../hooks/authenticate.js";
import { authorize } from "../../hooks/authorize.js";
import { toHttpError } from "../../utils/errors.js";
import {
  uploadResourceService,
  getInstructorResourcesService,
  getAllResourcesService,
  getResourceByIdService,
  updateResourceService,
  deleteResourceService,
  linkResourceToAssessmentService,
  unlinkResourceFromAssessmentService,
  getAssessmentResourcesService,
} from "./resources.service.js";

import { INSTRUCTOR_ROLES } from "../../constants/roles.js";
import {
  AssessmentIdParamSchema,
  ResourceIdParamSchema,
} from "../../schemas/common.js";

const ALLOWED_MIMETYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export default async function resourcesModule(app: FastifyInstance) {
  const f = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/resources  (multipart)
  app.post("/", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const files: Array<{ buffer: Buffer; filename: string; mimetype: string }> = [];
      let name: string | undefined;
      let url: string | undefined;
      let visibility: "private" | "public" = "private";

      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === "file") {
          if (!ALLOWED_MIMETYPES.has(part.mimetype)) continue;
          const buffer = await part.toBuffer();
          files.push({ buffer, filename: part.filename, mimetype: part.mimetype });
        } else {
          if (part.fieldname === "name") name = part.value as string;
          if (part.fieldname === "url") url = part.value as string;
          if (part.fieldname === "visibility") visibility = part.value as "private" | "public";
        }
      }

      if (!files.length && !url) {
        return reply.code(400).send({ success: false, message: "Provide at least one file or URL." });
      }

      const { uploaded, skipped } = await uploadResourceService(files, user.id, name, url, visibility);
      return reply.code(201).send({
        success: true,
        message: `Uploaded ${uploaded.length} resource(s).`,
        resources: uploaded,
        skipped,
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/resources
  f.get("/", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: { querystring: z.object({ visibility: z.string().optional() }) },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await getInstructorResourcesService(user.id, request.query.visibility);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/resources/all
  f.get("/all", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
  }, async (_request, reply) => {
    try {
      const data = await getAllResourcesService();
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/resources/assessments/:assessmentId
  f.get("/assessments/:assessmentId", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: { params: AssessmentIdParamSchema },
  }, async (request, reply) => {
    try {
      const data = await getAssessmentResourcesService(request.params.assessmentId);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/resources/:resourceId
  f.get("/:resourceId", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: { params: ResourceIdParamSchema },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number; role: string };
      const data = await getResourceByIdService(request.params.resourceId, user.id, user.role);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // PUT /api/resources/:resourceId
  f.put("/:resourceId", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: {
      params: ResourceIdParamSchema,
      body: z.object({
        name: z.string().optional(),
        visibility: z.enum(["private", "public"]).optional(),
      }),
    },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await updateResourceService(request.params.resourceId, user.id, request.body);
      return reply.send({ success: true, message: "Resource updated.", data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // DELETE /api/resources/:resourceId
  f.delete("/:resourceId", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: { params: ResourceIdParamSchema },
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number; role: string };
      await deleteResourceService(request.params.resourceId, user.id, user.role);
      return reply.send({ success: true, message: "Resource deleted." });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // POST /api/resources/:resourceId/assessments/:assessmentId
  f.post("/:resourceId/assessments/:assessmentId", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: {
      params: ResourceIdParamSchema.extend({
        assessmentId: z.coerce.number().int().positive(),
      }),
    },
  }, async (request, reply) => {
    try {
      await linkResourceToAssessmentService(request.params.resourceId, request.params.assessmentId);
      return reply.send({ success: true, message: "Resource linked to assessment." });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // DELETE /api/resources/:resourceId/assessments/:assessmentId
  f.delete("/:resourceId/assessments/:assessmentId", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
    schema: {
      params: ResourceIdParamSchema.extend({
        assessmentId: z.coerce.number().int().positive(),
      }),
    },
  }, async (request, reply) => {
    try {
      await unlinkResourceFromAssessmentService(request.params.resourceId, request.params.assessmentId);
      return reply.send({ success: true, message: "Resource unlinked from assessment." });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });
}
