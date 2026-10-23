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

export function maskKey(key: string): string {
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

export async function getRawConfigValue(key: string): Promise<string | null> {
  const [row] = await db
    .select({ configValue: systemConfigs.configValue })
    .from(systemConfigs)
    .where(eq(systemConfigs.configKey, key))
    .limit(1);
  return row?.configValue ?? null;
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
        maskedKeys: keys.map((k) => maskKey(decryptSecret(k))),
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

export interface DiscoveredModel {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
}

export async function fetchLiveProviderModels(
  provider: ProviderType,
  apiKey: string
): Promise<{ success: boolean; models: DiscoveredModel[]; error?: string }> {
  const timeoutMs = 8000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let url = "";
    const headers: Record<string, string> = {
      "User-Agent": "GradeWiseAI-Backend/2.1",
    };

    if (provider === "gemini") {
      url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    } else if (provider === "openai") {
      url = "https://api.openai.com/v1/models";
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else if (provider === "groq") {
      url = "https://api.groq.com/openai/v1/models";
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else if (provider === "claude") {
      url = "https://api.anthropic.com/v1/models";
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
    } else if (provider === "mistral") {
      url = "https://api.mistral.ai/v1/models";
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else if (provider === "deepseek") {
      url = "https://api.deepseek.com/models";
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else {
      clearTimeout(timeout);
      return { success: false, models: [], error: `Unsupported provider: ${provider}` };
    }

    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      let errDetail = `${res.status} ${res.statusText}`;
      try {
        const errJson = (await res.json()) as Record<string, unknown>;
        const errObj = errJson?.error as Record<string, unknown> | undefined;
        errDetail = (errObj?.message as string) || (errJson?.message as string) || errDetail;
      } catch {
        // ignore json parse error
      }
      return { success: false, models: [], error: `Failed to fetch models from ${provider}: ${errDetail}` };
    }

    const data = (await res.json()) as Record<string, unknown>;
    const discovered: DiscoveredModel[] = [];

    if (provider === "gemini" && Array.isArray(data.models)) {
      for (const m of data.models as Array<Record<string, unknown>>) {
        const id = ((m.name as string) || "").replace(/^models\//, "");
        const methods = Array.isArray(m.supportedGenerationMethods) ? (m.supportedGenerationMethods as string[]) : [];
        if (methods.includes("generateContent") && !id.includes("embedding") && !id.includes("aqa")) {
          discovered.push({
            id,
            name: (m.displayName as string) || id,
            description: m.description as string | undefined,
            isDefault: id === AI_DEFAULT_MODELS.gemini,
          });
        }
      }
    } else if (
      (provider === "openai" ||
        provider === "groq" ||
        provider === "mistral" ||
        provider === "deepseek" ||
        provider === "claude") &&
      Array.isArray(data.data)
    ) {
      for (const m of data.data as Array<Record<string, unknown>>) {
        const id = (m.id as string) || (m.name as string);
        if (!id) continue;

        if (provider === "openai") {
          const isRelevant =
            /^(gpt|o1|o3|chatgpt)/i.test(id) &&
            !id.includes("audio") &&
            !id.includes("transcription") &&
            !id.includes("embedding") &&
            !id.includes("moderation");
          if (isRelevant) {
            discovered.push({
              id,
              name: id,
              isDefault: id === AI_DEFAULT_MODELS.openai,
            });
          }
        } else if (provider === "groq") {
          if (m.active !== false && !id.includes("whisper") && !id.includes("distil-whisper")) {
            discovered.push({
              id,
              name: id,
              description: m.owned_by ? `Owned by ${m.owned_by}` : undefined,
              isDefault: id === AI_DEFAULT_MODELS.groq,
            });
          }
        } else if (provider === "claude") {
          discovered.push({
            id,
            name: (m.display_name as string) || id,
            isDefault:
              id.includes("claude-sonnet-4-6") ||
              id.includes("claude-3-7-sonnet") ||
              id === AI_DEFAULT_MODELS.claude,
          });
        } else if (provider === "mistral") {
          if (!id.includes("embed")) {
            discovered.push({
              id,
              name: (m.name as string) || id,
              description: m.description as string | undefined,
              isDefault: id === AI_DEFAULT_MODELS.mistral,
            });
          }
        } else if (provider === "deepseek") {
          discovered.push({
            id,
            name: id,
            isDefault: id === AI_DEFAULT_MODELS.deepseek,
          });
        }
      }
    }

    discovered.sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return a.id.localeCompare(b.id);
    });

    return { success: true, models: discovered };
  } catch (err: unknown) {
    clearTimeout(timeout);
    const errorObj = err as Error | undefined;
    return {
      success: false,
      models: [],
      error:
        errorObj?.name === "AbortError"
          ? `Request timed out connecting to ${provider} API`
          : errorObj?.message || "Network error",
    };
  }
}

export async function getProviderModels(
  provider: ProviderType,
  options?: { apiKey?: string; purpose?: PurposeType; keyIndex?: number }
): Promise<{ success: boolean; models: DiscoveredModel[]; error?: string }> {
  let keyToUse = (options?.apiKey || "").trim();

  if (!keyToUse && options?.purpose) {
    const configKey = buildConfigKey(options.purpose, provider, "KEYS");
    const raw = await getRawConfigValue(configKey);
    if (raw) {
      const keys = raw
        .split(",")
        .map((k) => decryptSecret(k.trim()))
        .filter(Boolean);
      const idx =
        options.keyIndex !== undefined && options.keyIndex < keys.length ? options.keyIndex : 0;
      keyToUse = keys[idx] ?? "";
    }
  }

  if (!keyToUse) {
    return {
      success: false,
      models: [],
      error: `No API key provided or found in stored pool for ${provider}.`,
    };
  }

  return fetchLiveProviderModels(provider, keyToUse);
}
