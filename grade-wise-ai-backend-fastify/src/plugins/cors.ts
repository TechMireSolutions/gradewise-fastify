import fp from "fastify-plugin";
import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";

export default fp(async function corsPlugin(app: FastifyInstance) {
  const origins = (process.env["FRONTEND_URL"] ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const isProd = process.env["NODE_ENV"] === "production";

  await app.register(cors, {
    origin: origins.length > 0 ? origins : isProd ? false : ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  });
});
