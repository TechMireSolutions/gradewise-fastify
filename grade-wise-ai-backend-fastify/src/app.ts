import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import fp from "fastify-plugin";

// Plugins
import corsPlugin from "./plugins/cors.js";
import helmetPlugin from "./plugins/helmet.js";
import cookiePlugin from "./plugins/cookie.js";
import jwtPlugin from "./plugins/jwt.js";
import rateLimitPlugin from "./plugins/rate-limit.js";
import multipartPlugin from "./plugins/multipart.js";
import { getHealthStatus } from "./health.js";

// Modules
import authModule from "./modules/auth/index.js";
import assessmentsModule from "./modules/assessments/index.js";
import resourcesModule from "./modules/resources/index.js";
import configModule from "./modules/config/index.js";
import studentAssessmentsModule from "./modules/student-assessments/index.js";
import instructorAnalyticsModule from "./modules/instructor-analytics/index.js";
import studentAnalyticsModule from "./modules/student-analytics/index.js";

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env["NODE_ENV"] === "production" ? "warn" : "info",
      transport:
        process.env["NODE_ENV"] !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
    trustProxy: true,
    bodyLimit: 50 * 1024 * 1024,
  });

  // Zod type provider
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Global error handler
  app.setErrorHandler((error: Error & { statusCode?: number }, _request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode ?? 500;
    const message = error.message ?? "An unexpected error occurred";
    return reply.code(statusCode).send({ success: false, message });
  });

  // Not found handler
  app.setNotFoundHandler((_request, reply) => {
    return reply.code(404).send({ success: false, message: "Route not found" });
  });

  // Register plugins (order matters: helmet → cors → cookie → rate-limit → multipart → jwt)
  app.register(helmetPlugin);
  app.register(corsPlugin);
  app.register(cookiePlugin);
  app.register(rateLimitPlugin);
  app.register(multipartPlugin);
  app.register(jwtPlugin);

  // Health checks
  app.get("/", async () => ({
    name: "GradeWise AI Backend",
    version: "2.0.0",
    status: "live",
  }));

  app.get("/api/health", async (_request, reply) => {
    const health = await getHealthStatus();
    const statusCode = health.status === "ok" ? 200 : 503;
    return reply.code(statusCode).send(health);
  });

  // API routes
  app.register(authModule, { prefix: "/api/auth" });
  app.register(assessmentsModule, { prefix: "/api/assessments" });
  app.register(resourcesModule, { prefix: "/api/resources" });
  app.register(configModule, { prefix: "/api/config" });
  app.register(studentAssessmentsModule, { prefix: "/api/taking" });
  app.register(instructorAnalyticsModule, { prefix: "/api/instructor-analytics" });
  app.register(studentAnalyticsModule, { prefix: "/api/student-analytics" });

  return app;
}
