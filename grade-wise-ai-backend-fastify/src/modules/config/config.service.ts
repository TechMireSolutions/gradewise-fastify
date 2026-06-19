import { db, systemConfigs } from "../../db/index.js";
import { eq } from "drizzle-orm";
import { invalidateConfigCache } from "../../ai/providers.js";
import { buildLanguageModel } from "../../ai/build-model.js";
import { encryptSecret, decryptSecret } from "../../utils/crypto.js";
import {
  AI_DEFAULT_MODELS,
  buildConfigKey,
  PROVIDER_TYPES,
  type ProviderType,
  type PurposeType,
} from "../../ai/constants.js";

export type { ProviderType, PurposeType };

function maskKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return `${key.substring(0, 6)}••••${key.substring(key.length - 4)}`;
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

  const purposes: PurposeType[] = ["text", "pdf"];

  return PROVIDER_TYPES.map((provider) => ({
    provider,
    purposes: purposes.map((purpose) => {
      const keysRaw = map[buildConfigKey(purpose, provider, "KEYS")] ?? "";
      const model = map[buildConfigKey(purpose, provider, "MODEL")] ?? AI_DEFAULT_MODELS[provider];
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
): Promise<{ added: number }> {
  const configKey = buildConfigKey(purpose, provider, "KEYS");
  const existing = await db
    .select()
    .from(systemConfigs)
    .where(eq(systemConfigs.configKey, configKey))
    .limit(1);

  const existingKeys = existing[0]?.configValue
    ?.split(",")
    .map((k) => decryptSecret(k.trim()))
    .filter(Boolean) ?? [];

  const merged = Array.from(new Set([...existingKeys, ...keys]));
  const added = merged.length - existingKeys.length;
  const newValue = merged.map((key) => encryptSecret(key)).join(",");

  if (existing.length > 0) {
    await db
      .update(systemConfigs)
      .set({ configValue: newValue, updatedAt: new Date() })
      .where(eq(systemConfigs.configKey, configKey));
  } else {
    await db.insert(systemConfigs).values({ configKey, configValue: newValue });
  }

  invalidateConfigCache();
  return { added };
}

export async function setProviderModel(
  provider: ProviderType,
  purpose: PurposeType,
  model: string
): Promise<void> {
  const configKey = buildConfigKey(purpose, provider, "MODEL");
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
  const configKey = buildConfigKey(purpose, provider, "KEYS");
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
  const testModel = model ?? AI_DEFAULT_MODELS[provider];
  const start = Date.now();
  const testPrompt = "Reply with exactly: OK";

  try {
    const { generateText } = await import("ai");
    const aiModel = buildLanguageModel(provider, apiKey, testModel);
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
