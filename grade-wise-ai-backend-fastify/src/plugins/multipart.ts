import fp from "fastify-plugin";
import multipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";

const MAX_FILE_SIZE_MB = Number(process.env["MAX_FILE_SIZE_MB"] ?? 20);

export default fp(async function multipartPlugin(app: FastifyInstance) {
  await app.register(multipart, {
    limits: {
      fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
      files: 10,
      fields: 20,
      fieldSize: 1 * 1024 * 1024,
    },
    attachFieldsToBody: false,
  });
});
