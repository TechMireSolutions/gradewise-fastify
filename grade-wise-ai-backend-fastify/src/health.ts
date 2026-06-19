import { db } from "./db/index.js";
import { sql } from "drizzle-orm";

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}

export async function getHealthStatus() {
  const [database, redis] = await Promise.all([
    checkDatabaseHealth(),
    import("./lib/redis.js").then((m) => m.pingRedis()),
  ]);

  const status = database ? "ok" : "degraded";

  return {
    status,
    timestamp: new Date().toISOString(),
    version: "2.1.0",
    checks: {
      database,
      redis: process.env["REDIS_URL"] ? redis : "disabled",
      storage: process.env["S3_ENDPOINT"] ? "configured" : "disabled",
      asyncJobs: process.env["USE_ASYNC_JOBS"] === "true" ? "enabled" : "disabled",
    },
  };
}
