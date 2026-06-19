import { z } from "zod";

export const PROVIDER_TYPES = [
  "gemini",
  "groq",
  "openai",
  "claude",
  "mistral",
  "deepseek",
] as const;

export type ProviderType = (typeof PROVIDER_TYPES)[number];
export type PurposeType = "text" | "pdf";

export const ProviderEnum = z.enum(PROVIDER_TYPES);
export const PurposeEnum = z.enum(["text", "pdf"]);

export const AI_DEFAULT_MODELS: Record<ProviderType, string> = {
  gemini: "gemini-2.5-flash",
  groq: "llama-3.3-70b-versatile",
  openai: "gpt-4o-mini",
  claude: "claude-sonnet-4-6",
  mistral: "mistral-small-latest",
  deepseek: "deepseek-chat",
};

export function buildConfigKey(
  purpose: PurposeType | string,
  provider: ProviderType | string,
  kind: "KEYS" | "MODEL"
): string {
  return `${purpose.toUpperCase()}_${provider.toUpperCase()}_${kind}`;
}

export function detectProviderFromKey(key: string): ProviderType | null {
  if (key.startsWith("sk-ant-")) return "claude";
  if (key.startsWith("gsk_")) return "groq";
  if (key.startsWith("AIza") || key.startsWith("AQ.")) return "gemini";
  if (key.startsWith("sk-proj-") || key.startsWith("sk-svcacct-")) return "openai";
  if (/^[0-9a-f]{32}$/i.test(key)) return "mistral";
  if (key.startsWith("sk-")) return "openai";
  return null;
}
