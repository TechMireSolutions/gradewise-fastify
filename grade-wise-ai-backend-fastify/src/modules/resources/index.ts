import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authenticate } from "../../hooks/authenticate.js";
import { authorize } from "../../hooks/authorize.js";
import {
  getResourcesService,
  uploadResourceService,
  deleteResourceService,
} from "./resources.service.js";
import { INSTRUCTOR_ROLES } from "../../constants/roles.js";
import { ResourceIdParamSchema } from "../../schemas/common.js";
import { toHttpError } from "../../utils/errors.js";

export default async function resourcesRoutes(app: FastifyInstance) {
  const f = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/resources  (multipart)
  f.post("/", {
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
          const buffer = await part.toBuffer();
          files.push({ buffer, filename: part.filename, mimetype: part.mimetype });
        } else {
          if (part.fieldname === "name") name = part.value as string;
          if (part.fieldname === "url") url = part.value as string;
          if (part.fieldname === "visibility") visibility = part.value as "private" | "public";
        }
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
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await getResourcesService(user.id);
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/resources/all  (alias)
  f.get("/all", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: number };
      const data = await getResourcesService(user.id);
      return reply.send({ success: true, data });
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
}
