import "dotenv/config";
import { buildApp } from "./app.js";

const PORT = Number(process.env["PORT"] ?? 5005);
const HOST = process.env["HOST"] ?? "0.0.0.0";
const NODE_ENV = process.env["NODE_ENV"] ?? "development";

// ─── Environment validation ───────────────────────────────────────────────────

function validateEnv() {
  const required = ["DATABASE_URL", "JWT_SECRET"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`[Boot] Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  if (process.env["JWT_SECRET"] === "change_me_to_a_64_char_random_string_in_production" && NODE_ENV === "production") {
    console.error("[Boot] FATAL: JWT_SECRET is still the default value in production!");
    process.exit(1);
  }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function start() {
  validateEnv();

  const app = buildApp();

  try {
    const address = await app.listen({ port: PORT, host: HOST });
    console.log(`\n  GradeWise AI Backend v2.0`);
    console.log(`  Environment : ${NODE_ENV}`);
    console.log(`  Listening   : ${address}`);
    console.log(`  Health      : ${address}/api/health\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason) => {
  console.error("[UnhandledRejection]", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("[UncaughtException]", err);
  process.exit(1);
});

start();
