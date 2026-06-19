import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AUTH_COOKIE_NAME } from "../utils/auth-cookie.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: number; email: string; role: string };
    user: { id: number; email: string; role: string };
  }
}

export default fp(async function jwtPlugin(app: FastifyInstance) {
  if (!process.env["JWT_SECRET"]) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  await app.register(fastifyJwt, {
    secret: process.env["JWT_SECRET"],
    sign: {
      expiresIn: process.env["JWT_EXPIRES_IN"] ?? "24h",
    },
    cookie: {
      cookieName: AUTH_COOKIE_NAME,
      signed: false,
    },
  });

  app.decorate(
    "authenticate",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch {
        reply.code(401).send({ success: false, message: "Unauthorized — invalid or missing token" });
      }
    }
  );
});

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
