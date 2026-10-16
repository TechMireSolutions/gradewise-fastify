import { describe, it, expect } from "vitest";
import {
  PROVIDER_TYPES,
  AI_DEFAULT_MODELS,
  buildConfigKey,
  detectProviderFromKey,
  ProviderEnum,
  PurposeEnum,
} from "./constants.js";

describe("AI Constants & Configuration Helpers", () => {
  it("includes all supported providers in PROVIDER_TYPES and Zod schema", () => {
    expect(PROVIDER_TYPES).toEqual([
      "gemini",
      "groq",
      "openai",
      "claude",
      "mistral",
      "deepseek",
    ]);

    PROVIDER_TYPES.forEach((provider) => {
      expect(ProviderEnum.safeParse(provider).success).toBe(true);
    });

    expect(ProviderEnum.safeParse("unknown_provider").success).toBe(false);
  });

  it("validates PurposeEnum for text and pdf", () => {
    expect(PurposeEnum.safeParse("text").success).toBe(true);
    expect(PurposeEnum.safeParse("pdf").success).toBe(true);
    expect(PurposeEnum.safeParse("audio").success).toBe(false);
  });

  it("defines default models for each provider", () => {
    PROVIDER_TYPES.forEach((p) => {
      expect(AI_DEFAULT_MODELS[p]).toBeDefined();
      expect(typeof AI_DEFAULT_MODELS[p]).toBe("string");
      expect(AI_DEFAULT_MODELS[p].length).toBeGreaterThan(0);
    });
    expect(AI_DEFAULT_MODELS.gemini).toBe("gemini-2.5-flash");
    expect(AI_DEFAULT_MODELS.openai).toBe("gpt-4o-mini");
  });

  it("buildConfigKey constructs uppercase composite keys", () => {
    expect(buildConfigKey("text", "gemini", "KEYS")).toBe("TEXT_GEMINI_KEYS");
    expect(buildConfigKey("pdf", "openai", "MODEL")).toBe("PDF_OPENAI_MODEL");
    expect(buildConfigKey("text", "claude", "KEYS")).toBe("TEXT_CLAUDE_KEYS");
  });

  it("detectProviderFromKey identifies provider prefixes accurately", () => {
    expect(detectProviderFromKey("sk-ant-api03-xxxx")).toBe("claude");
    expect(detectProviderFromKey("gsk_1234567890abcdef")).toBe("groq");
    expect(detectProviderFromKey("AIzaSyD-12345678")).toBe("gemini");
    expect(detectProviderFromKey("AQ.abc123xyz")).toBe("gemini");
    expect(detectProviderFromKey("sk-proj-abc123xyz")).toBe("openai");
    expect(detectProviderFromKey("sk-svcacct-abc123xyz")).toBe("openai");
    expect(detectProviderFromKey("0123456789abcdef0123456789abcdef")).toBe("mistral");
    expect(detectProviderFromKey("unknown-random-key")).toBe(null);
  });
});
