import type { LanguageModel } from "ai";
import { db, systemConfigs } from "../db/index.js";
import { buildLanguageModel } from "./build-model.js";
import {
  AI_DEFAULT_MODELS,
  buildConfigKey,
  PROVIDER_TYPES,
  type ProviderType,
  type PurposeType,
} from "./constants.js";
import { decryptCommaSeparatedKeys, decryptSecret } from "../utils/crypto.js";

export type { ProviderType, PurposeType } from "./constants.js";

export interface ProviderInstance {
  id: string;
  type: ProviderType;
  model: LanguageModel;
  modelName: string;
  keySnippet: string;
}

// ─── Default models per provider ─────────────────────────────────────────────

const DEFAULT_MODELS = AI_DEFAULT_MODELS;

// ─── Rotation & cooldown state ────────────────────────────────────────────────

const rotationIndex: Record<PurposeType, number> = { text: 0, pdf: 0 };
const cooldownMap = new Map<string, number>();

function isOnCooldown(id: string): boolean {
  const until = cooldownMap.get(id);
  if (!until) return false;
  if (Date.now() >= until) {
    cooldownMap.delete(id);
    return false;
  }
  return true;
}

export function markCooldown(providerId: string, ms = 60_000): void {
  cooldownMap.set(providerId, Date.now() + ms);
  console.warn(`[AI] Provider ${providerId} on cooldown for ${ms / 1000}s`);
}

function pickNext(providers: ProviderInstance[], purpose: PurposeType): ProviderInstance | null {
  const available = providers.filter((p) => !isOnCooldown(p.id));
  if (available.length === 0) return null;
  const idx = rotationIndex[purpose] % available.length;
  rotationIndex[purpose] = (idx + 1) % available.length;
  return available[idx] ?? null;
}

// ─── Build a LanguageModel instance for a provider + key + model ──────────────

function buildModel(type: ProviderType, key: string, modelName: string): LanguageModel {
  return buildLanguageModel(type, key, modelName);
}

// ─── Load providers from DB system_configs ────────────────────────────────────

let configCache: Record<string, string> | null = null;
let cacheExpiry = 0;

async function getConfigs(): Promise<Record<string, string>> {
  if (configCache && Date.now() < cacheExpiry) return configCache;

  const rows = await db.select().from(systemConfigs);
  const map: Record<string, string> = {};
  for (const row of rows) {
    if (row.configKey && row.configValue) {
      map[row.configKey] = row.configValue;
    }
  }
  configCache = map;
  cacheExpiry = Date.now() + 60_000; // cache for 1 minute
  return map;
}

export function invalidateConfigCache(): void {
  configCache = null;
  cacheExpiry = 0;
}

const SUPPORTED_PROVIDERS = PROVIDER_TYPES;

async function buildProviders(purpose: PurposeType): Promise<ProviderInstance[]> {
  const configs = await getConfigs();
  const purposeKey = purpose.toUpperCase();
  const instances: ProviderInstance[] = [];

  for (const providerType of SUPPORTED_PROVIDERS) {
    const providerKey = providerType.toUpperCase();
    const keysRaw = decryptCommaSeparatedKeys(
      configs[buildConfigKey(purpose, providerType, "KEYS")] ??
      configs[`${purposeKey}_AI_KEYS`] ??
      process.env[buildConfigKey(purpose, providerType, "KEYS")] ??
      ""
    );

    const modelName =
      configs[buildConfigKey(purpose, providerType, "MODEL")] ??
      process.env[buildConfigKey(purpose, providerType, "MODEL")] ??
      DEFAULT_MODELS[providerType];

    const keys = keysRaw
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    for (let i = 0; i < keys.length; i++) {
      const key = decryptSecret(keys[i]!);
      try {
        instances.push({
          id: `${purpose}-${providerType}-${i}`,
          type: providerType,
          model: buildModel(providerType, key, modelName),
          modelName,
          keySnippet: `${key.substring(0, 6)}••••${key.substring(key.length - 4)}`,
        });
      } catch (err) {
        console.warn(`[AI] Failed to init provider ${providerType} key ${i}:`, err);
      }
    }
  }

  return instances;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getTextProviders(): Promise<ProviderInstance[]> {
  return buildProviders("text");
}

export async function getPdfProviders(): Promise<ProviderInstance[]> {
  return buildProviders("pdf");
}

export async function pickTextProvider(): Promise<ProviderInstance | null> {
  const providers = await getTextProviders();
  return pickNext(providers, "text");
}

export async function pickPdfProvider(): Promise<ProviderInstance | null> {
  const providers = await getPdfProviders();
  // Fall back to text providers if no dedicated PDF providers configured
  if (providers.length === 0) {
    const textProviders = await getTextProviders();
    return pickNext(textProviders, "pdf");
  }
  return pickNext(providers, "pdf");
}

function isRateLimitError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as Record<string, unknown>;
  const status = e["statusCode"] ?? e["status"] ?? (e["cause"] as Record<string, unknown> | undefined)?.["status"];
  return status === 429 || status === 503 || status === 529;
}

export async function callWithRotation<T>(
  purpose: PurposeType,
  fn: (provider: ProviderInstance) => Promise<T>,
  maxAttempts = 4
): Promise<T> {
  const providers = purpose === "text" ? await getTextProviders() : await getPdfProviders();
  if (providers.length === 0) {
    throw new Error("No AI providers configured. Add API keys in Super Admin → API Config.");
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const provider = pickNext(providers, purpose);
    if (!provider) {
      throw new Error("All AI providers are on cooldown. Please wait and try again.");
    }
    try {
      return await fn(provider);
    } catch (err) {
      lastError = err;
      if (isRateLimitError(err)) {
        markCooldown(provider.id, 60_000);
        continue;
      }
      throw err;
    }
  }
  throw lastError ?? new Error("AI generation failed after max attempts");
}
