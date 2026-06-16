import "dotenv/config";
import bcrypt from "bcrypt";
import { db, users, systemConfigs } from "./index.js";
import { eq } from "drizzle-orm";

const SUPER_ADMIN_EMAIL = "superadmin@gmail.com";
const SUPER_ADMIN_PASSWORD = "superadmin123";

async function seedSuperAdmin() {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, SUPER_ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    console.log("Super admin already exists — skipping.");
    return;
  }

  const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
  await db.insert(users).values({
    name: "Super Admin",
    email: SUPER_ADMIN_EMAIL,
    password: hashedPassword,
    role: "super_admin",
    verified: true,
    provider: "manual",
  });
  console.log("✓ Super admin created:", SUPER_ADMIN_EMAIL);
}

async function seedSystemConfigs() {
  const defaults: Array<{ configKey: string; configValue: string | null }> = [
    { configKey: "TEXT_GEMINI_KEYS", configValue: process.env["TEXT_GEMINI_KEYS"] ?? null },
    { configKey: "TEXT_GEMINI_MODEL", configValue: process.env["TEXT_GEMINI_MODEL"] ?? "gemini-2.5-flash" },
    { configKey: "PDF_GEMINI_KEYS", configValue: process.env["PDF_GEMINI_KEYS"] ?? null },
    { configKey: "PDF_GEMINI_MODEL", configValue: process.env["PDF_GEMINI_MODEL"] ?? "gemini-2.5-flash" },
    { configKey: "TEXT_GROQ_KEYS", configValue: process.env["TEXT_GROQ_KEYS"] ?? null },
    { configKey: "TEXT_GROQ_MODEL", configValue: process.env["TEXT_GROQ_MODEL"] ?? "llama-3.3-70b-versatile" },
    { configKey: "TEXT_OPENAI_KEYS", configValue: process.env["TEXT_OPENAI_KEYS"] ?? null },
    { configKey: "TEXT_OPENAI_MODEL", configValue: process.env["TEXT_OPENAI_MODEL"] ?? "gpt-4o-mini" },
    { configKey: "TEXT_CLAUDE_KEYS", configValue: process.env["TEXT_CLAUDE_KEYS"] ?? null },
    { configKey: "TEXT_CLAUDE_MODEL", configValue: process.env["TEXT_CLAUDE_MODEL"] ?? "claude-sonnet-4-6" },
    { configKey: "TEXT_MISTRAL_KEYS", configValue: process.env["TEXT_MISTRAL_KEYS"] ?? null },
    { configKey: "TEXT_MISTRAL_MODEL", configValue: process.env["TEXT_MISTRAL_MODEL"] ?? "mistral-small-latest" },
    { configKey: "TEXT_DEEPSEEK_KEYS", configValue: process.env["TEXT_DEEPSEEK_KEYS"] ?? null },
    { configKey: "TEXT_DEEPSEEK_MODEL", configValue: process.env["TEXT_DEEPSEEK_MODEL"] ?? "deepseek-chat" },
  ];

  for (const config of defaults) {
    if (!config.configValue) continue;
    const existing = await db
      .select()
      .from(systemConfigs)
      .where(eq(systemConfigs.configKey, config.configKey))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(systemConfigs).values(config);
      console.log(`✓ Seeded config: ${config.configKey}`);
    }
  }
}

async function main() {
  console.log("Running database seed...");
  await seedSuperAdmin();
  await seedSystemConfigs();
  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
