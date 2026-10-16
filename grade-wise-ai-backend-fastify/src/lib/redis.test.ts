import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Redis Library", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("isRedisEnabled returns false when REDIS_URL is not set", async () => {
    delete process.env["REDIS_URL"];
    const { isRedisEnabled } = await import("./redis.js");
    expect(isRedisEnabled()).toBe(false);
  });

  it("isRedisEnabled returns true when REDIS_URL is set", async () => {
    process.env["REDIS_URL"] = "redis://localhost:6379";
    const { isRedisEnabled } = await import("./redis.js");
    expect(isRedisEnabled()).toBe(true);
  });

  it("getRedis returns null when REDIS_URL is not set", async () => {
    delete process.env["REDIS_URL"];
    const { getRedis } = await import("./redis.js");
    expect(getRedis()).toBeNull();
  });

  it("pingRedis returns false when client is null", async () => {
    delete process.env["REDIS_URL"];
    const { pingRedis } = await import("./redis.js");
    const result = await pingRedis();
    expect(result).toBe(false);
  });

  it("getRedis initializes Redis and pingRedis returns true on PONG", async () => {
    const mockPing = vi.fn().mockResolvedValue("PONG");
    const mockOn = vi.fn();

    vi.doMock("ioredis", () => {
      return {
        Redis: class {
          ping = mockPing;
          on = mockOn;
        },
      };
    });

    process.env["REDIS_URL"] = "redis://127.0.0.1:6379";
    const { getRedis, pingRedis } = await import("./redis.js");

    const client = getRedis();
    expect(client).toBeDefined();
    expect(client).not.toBeNull();

    const isPong = await pingRedis();
    expect(isPong).toBe(true);
    expect(mockPing).toHaveBeenCalledTimes(1);
  });

  it("pingRedis returns false when ping rejects", async () => {
    const mockPing = vi.fn().mockRejectedValue(new Error("Connection lost"));
    const mockOn = vi.fn();

    vi.doMock("ioredis", () => {
      return {
        Redis: class {
          ping = mockPing;
          on = mockOn;
        },
      };
    });

    process.env["REDIS_URL"] = "redis://127.0.0.1:6379";
    const { pingRedis } = await import("./redis.js");

    const isPong = await pingRedis();
    expect(isPong).toBe(false);
  });
});
