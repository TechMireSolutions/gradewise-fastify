import { db, systemConfigs } from "../../db/index.js";
import { eq } from "drizzle-orm";
import { invalidateConfigCache } from "../../ai/providers.js";
import axios from "axios";

export type ProviderType = "gemini" | "groq" | "openai" | "claude" | "mistral" | "deepseek";
export type PurposeType = "text" | "pdf";

const SAFE_TEST_MODELS: Record<ProviderType, string> = {
  gemini: "gemini-2.5-flash",
  groq: "llama-3.3-70b-versatile",
  openai: "gpt-4o-mini",
  claude: "claude-sonnet-4-6",
  mistral: "mistral-small-latest",
  deepseek: "deepseek-chat",
};

function maskKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return `${key.substring(0, 6)}••••${key.substring(key.length - 4)}`;
}

function detectProviderFromKey(key: string): ProviderType | null {
  if (key.startsWith("sk-ant-")) return "claude";
  if (key.startsWith("gsk_")) return "groq";
  if (key.startsWith("AIza") || key.startsWith("AQ.")) return "gemini";
  if (key.startsWith("sk-proj-") || key.startsWith("sk-svcacct-")) return "openai";
  if (/^[0-9a-f]{32}$/i.test(key)) return "mistral";
  if (key.startsWith("sk-")) return "openai";
  return null;
}

export async function getAllConfigs(): Promise<Array<{ key: string; value: string | null }>> {
  const rows = await db.select().from(systemConfigs).orderBy(systemConfigs.configKey);
  return rows.map((r) => ({
    key: r.configKey,
    value: r.configValue?.includes("Keys") || r.configKey.endsWith("_KEYS")
      ? r.configValue
        ?.split(",")
        .map((k) => maskKey(k.trim()))
        .join(", ") ?? null
      : r.configValue,
  }));
}

export async function getAiKeysSummary() {
  const rows = await db.select().from(systemConfigs);
  const map: Record<string, string> = {};
  for (const r of rows) {
    if (r.configKey && r.configValue) map[r.configKey] = r.configValue;
  }

  const providers: ProviderType[] = ["gemini", "groq", "openai", "claude", "mistral", "deepseek"];
  const purposes: PurposeType[] = ["text", "pdf"];

  return providers.map((provider) => ({
    provider,
    purposes: purposes.map((purpose) => {
      const keysRaw = map[`${purpose.toUpperCase()}_${provider.toUpperCase()}_KEYS`] ?? "";
      const model = map[`${purpose.toUpperCase()}_${provider.toUpperCase()}_MODEL`] ?? SAFE_TEST_MODELS[provider];
      const keys = keysRaw.split(",").map((k) => k.trim()).filter(Boolean);
      return {
        purpose,
        keyCount: keys.length,
        maskedKeys: keys.map(maskKey),
        model,
        configured: keys.length > 0,
      };
    }),
  }));
}

export async function addAiKeys(
  provider: ProviderType,
  purpose: PurposeType,
  keys: string[]
): Promise<void> {
  const configKey = `${purpose.toUpperCase()}_${provider.toUpperCase()}_KEYS`;
  const existing = await db
    .select()
    .from(systemConfigs)
    .where(eq(systemConfigs.configKey, configKey))
    .limit(1);

  const existingKeys = existing[0]?.configValue
    ?.split(",")
    .map((k) => k.trim())
    .filter(Boolean) ?? [];

  const merged = Array.from(new Set([...existingKeys, ...keys]));
  const newValue = merged.join(",");

  if (existing.length > 0) {
    await db
      .update(systemConfigs)
      .set({ configValue: newValue, updatedAt: new Date() })
      .where(eq(systemConfigs.configKey, configKey));
  } else {
    await db.insert(systemConfigs).values({ configKey, configValue: newValue });
  }

  invalidateConfigCache();
}

export async function setProviderModel(
  provider: ProviderType,
  purpose: PurposeType,
  model: string
): Promise<void> {
  const configKey = `${purpose.toUpperCase()}_${provider.toUpperCase()}_MODEL`;
  const existing = await db
    .select()
    .from(systemConfigs)
    .where(eq(systemConfigs.configKey, configKey))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(systemConfigs)
      .set({ configValue: model, updatedAt: new Date() })
      .where(eq(systemConfigs.configKey, configKey));
  } else {
    await db.insert(systemConfigs).values({ configKey, configValue: model });
  }

  invalidateConfigCache();
}

export async function deleteAiKey(
  provider: ProviderType,
  purpose: PurposeType,
  keyIndex: number
): Promise<void> {
  const configKey = `${purpose.toUpperCase()}_${provider.toUpperCase()}_KEYS`;
  const existing = await db
    .select()
    .from(systemConfigs)
    .where(eq(systemConfigs.configKey, configKey))
    .limit(1);

  if (!existing[0]) return;
  const keys = existing[0].configValue?.split(",").map((k) => k.trim()).filter(Boolean) ?? [];
  keys.splice(keyIndex, 1);

  await db
    .update(systemConfigs)
    .set({ configValue: keys.join(","), updatedAt: new Date() })
    .where(eq(systemConfigs.configKey, configKey));

  invalidateConfigCache();
}

export async function testAiKey(
  provider: ProviderType,
  apiKey: string,
  model?: string
): Promise<{ success: boolean; model: string; latencyMs: number; error?: string }> {
  const testModel = model ?? SAFE_TEST_MODELS[provider];
  const start = Date.now();
  const testPrompt = "Reply with exactly: OK";

  try {
    // Use Vercel AI SDK to send a minimal generation request
    const { generateText } = await import("ai");
    let aiModel;

    if (provider === "gemini") {
      const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
      aiModel = createGoogleGenerativeAI({ apiKey })(testModel);
    } else if (provider === "openai") {
      const { createOpenAI } = await import("@ai-sdk/openai");
      aiModel = createOpenAI({ apiKey })(testModel);
    } else if (provider === "claude") {
      const { createAnthropic } = await import("@ai-sdk/anthropic");
      aiModel = createAnthropic({ apiKey })(testModel);
    } else if (provider === "groq") {
      const { createGroq } = await import("@ai-sdk/groq");
      aiModel = createGroq({ apiKey })(testModel);
    } else if (provider === "mistral") {
      const { createMistral } = await import("@ai-sdk/mistral");
      aiModel = createMistral({ apiKey })(testModel);
    } else {
      const { createOpenAI } = await import("@ai-sdk/openai");
      aiModel = createOpenAI({ apiKey, baseURL: "https://api.deepseek.com/v1" })(testModel);
    }

    await generateText({ model: aiModel, prompt: testPrompt, maxOutputTokens: 5 });
    return { success: true, model: testModel, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      success: false,
      model: testModel,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function bulkUpdateConfigs(
  configs: Array<{ key: string; value: string }>
): Promise<void> {
  for (const { key, value } of configs) {
    const existing = await db
      .select()
      .from(systemConfigs)
      .where(eq(systemConfigs.configKey, key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(systemConfigs)
        .set({ configValue: value, updatedAt: new Date() })
        .where(eq(systemConfigs.configKey, key));
    } else {
      await db.insert(systemConfigs).values({ configKey: key, configValue: value });
    }
  }
  invalidateConfigCache();
}
