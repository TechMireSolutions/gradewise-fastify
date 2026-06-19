import { Redis } from "ioredis";

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env["REDIS_URL"];
  if (!url) return null;

  redis = new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

  redis.on("error", (err: Error) => {
    console.error("[Redis]", err.message);
  });

  return redis;
}

export async function pingRedis(): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;
  try {
    const result = await client.ping();
    return result === "PONG";
  } catch {
    return false;
  }
}

export function isRedisEnabled(): boolean {
  return Boolean(process.env["REDIS_URL"]);
}
