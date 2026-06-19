import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import { getRedis } from "../lib/redis.js";

export default fp(async function rateLimitPlugin(app: FastifyInstance) {
  const redis = getRedis();

  await app.register(rateLimit, {
    global: true,
    max: 200,
    timeWindow: "1 minute",
    ban: 3,
    ...(redis ? { redis: redis as never } : {}),
    errorResponseBuilder(_req, context) {
      return {
        success: false,
        message: `Too many requests. Retry after ${Math.ceil(context.ttl / 1000)} seconds.`,
        retryAfter: context.ttl,
      };
    },
  });
});
