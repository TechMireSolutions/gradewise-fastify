import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import type { FastifyInstance } from "fastify";

export default fp(async function cookiePlugin(app: FastifyInstance) {
  const secret = process.env["COOKIE_SECRET"] ?? process.env["JWT_SECRET"];
  if (!secret) {
    throw new Error("COOKIE_SECRET or JWT_SECRET is required for cookie signing");
  }

  await app.register(cookie, {
    secret,
    parseOptions: {},
  });
});
