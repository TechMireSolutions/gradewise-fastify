import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";

export default fp(async function rateLimitPlugin(app: FastifyInstance) {
  await app.register(rateLimit, {
    global: true,
    max: 200,
    timeWindow: "1 minute",
    ban: 3,
    errorResponseBuilder(_req, context) {
      return {
        success: false,
        message: `Too many requests. Retry after ${Math.ceil(context.ttl / 1000)} seconds.`,
        retryAfter: context.ttl,
      };
    },
  });
});
