import type { FastifyReply, FastifyRequest } from "fastify";
import { toHttpError } from "./errors.js";

type RouteHandlerFn = (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<unknown>;

export function routeHandler(handler: RouteHandlerFn): RouteHandlerFn {
  return async (request, reply) => {
    try {
      return await handler(request, reply);
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  };
}
