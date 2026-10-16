import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "./app.js";
import type { FastifyInstance } from "fastify";

describe("Fastify Application Integration", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET / returns 200 with service information", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toEqual({
      name: "GradeWise AI Backend",
      version: "2.1.0",
      status: "live",
    });
  });

  it("GET /non-existent-route returns 404 with standard envelope", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/non-existent-route-12345",
    });

    expect(response.statusCode).toBe(404);
    const body = response.json();
    expect(body).toEqual({
      success: false,
      message: "Route not found",
    });
  });

  it("GET /api/health returns health status payload", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/health",
    });

    // Health is either 200 (if local db reachable) or 503 (if test db not running)
    expect([200, 503]).toContain(response.statusCode);
    const body = response.json();
    expect(body.version).toBe("2.1.0");
    expect(["ok", "degraded"]).toContain(body.status);
    expect(body.checks).toBeDefined();
  });

  it("unauthorized request to protected route returns 401 standard envelope", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/auth/me",
    });

    expect(response.statusCode).toBe(401);
    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.message).toBeDefined();
  });
});
