import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkDatabaseHealth, getHealthStatus } from "./health.js";
import { db } from "./db/index.js";
import * as redisModule from "./lib/redis.js";

describe("Health Check Service", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("checkDatabaseHealth", () => {
    it("returns true when database execute succeeds", async () => {
      vi.spyOn(db, "execute").mockResolvedValueOnce({} as never);

      const isHealthy = await checkDatabaseHealth();
      expect(isHealthy).toBe(true);
    });

    it("returns false when database execute throws an error", async () => {
      vi.spyOn(db, "execute").mockRejectedValueOnce(new Error("Connection refused"));

      const isHealthy = await checkDatabaseHealth();
      expect(isHealthy).toBe(false);
    });
  });

  describe("getHealthStatus", () => {
    it("returns ok status when database is healthy", async () => {
      vi.spyOn(db, "execute").mockResolvedValueOnce({} as never);
      delete process.env["REDIS_URL"];
      delete process.env["S3_ENDPOINT"];
      process.env["USE_ASYNC_JOBS"] = "false";

      const health = await getHealthStatus();

      expect(health.status).toBe("ok");
      expect(health.version).toBe("2.1.0");
      expect(health.checks.database).toBe(true);
      expect(health.checks.redis).toBe("disabled");
      expect(health.checks.storage).toBe("disabled");
      expect(health.checks.asyncJobs).toBe("disabled");
      expect(health.timestamp).toBeDefined();
    });

    it("returns degraded status when database check fails", async () => {
      vi.spyOn(db, "execute").mockRejectedValueOnce(new Error("DB Down"));

      const health = await getHealthStatus();

      expect(health.status).toBe("degraded");
      expect(health.checks.database).toBe(false);
    });

    it("reports redis ping and feature flags when configured", async () => {
      vi.spyOn(db, "execute").mockResolvedValueOnce({} as never);
      vi.spyOn(redisModule, "pingRedis").mockResolvedValueOnce(true);

      process.env["REDIS_URL"] = "redis://localhost:6379";
      process.env["S3_ENDPOINT"] = "https://s3.example.com";
      process.env["USE_ASYNC_JOBS"] = "true";

      const health = await getHealthStatus();

      expect(health.status).toBe("ok");
      expect(health.checks.redis).toBe(true);
      expect(health.checks.storage).toBe("configured");
      expect(health.checks.asyncJobs).toBe("enabled");
    });
  });
});
