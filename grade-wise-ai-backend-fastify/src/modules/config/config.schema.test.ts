import { describe, it, expect } from "vitest";
import {
  ProviderEnum,
  PurposeEnum,
  AddAiKeysSchema,
  SetProviderModelSchema,
  DeleteAiKeySchema,
  TestAiKeySchema,
  TestInlineAiKeySchema,
  BulkUpdateConfigsSchema,
} from "./config.schema.js";

describe("Config Module Schemas", () => {
  it("validates ProviderEnum and PurposeEnum", () => {
    expect(ProviderEnum.safeParse("gemini").success).toBe(true);
    expect(ProviderEnum.safeParse("openai").success).toBe(true);
    expect(ProviderEnum.safeParse("anthropic").success).toBe(false); // canonical is claude

    expect(PurposeEnum.safeParse("text").success).toBe(true);
    expect(PurposeEnum.safeParse("pdf").success).toBe(true);
  });

  describe("AddAiKeysSchema & SetProviderModelSchema", () => {
    it("validates valid key addition payload", () => {
      const payload = {
        provider: "gemini",
        purpose: "text",
        keys: ["AIzaSyD-12345", "AIzaSyD-67890"],
        model: "gemini-2.5-flash",
      };
      expect(AddAiKeysSchema.safeParse(payload).success).toBe(true);
    });

    it("rejects empty keys array with empty strings", () => {
      const invalid = {
        provider: "openai",
        purpose: "pdf",
        keys: [""],
      };
      expect(AddAiKeysSchema.safeParse(invalid).success).toBe(false);
    });

    it("validates SetProviderModelSchema", () => {
      expect(
        SetProviderModelSchema.safeParse({
          provider: "claude",
          purpose: "text",
          model: "claude-sonnet-4-6",
        }).success
      ).toBe(true);

      expect(
        SetProviderModelSchema.safeParse({
          provider: "claude",
          purpose: "text",
          model: "",
        }).success
      ).toBe(false);
    });
  });

  describe("DeleteAiKeySchema & TestAiKeySchema", () => {
    it("validates non-negative keyIndex", () => {
      expect(
        DeleteAiKeySchema.safeParse({
          provider: "groq",
          purpose: "text",
          keyIndex: 0,
        }).success
      ).toBe(true);

      expect(
        DeleteAiKeySchema.safeParse({
          provider: "groq",
          purpose: "text",
          keyIndex: -1,
        }).success
      ).toBe(false);
    });

    it("validates TestInlineAiKeySchema", () => {
      expect(
        TestInlineAiKeySchema.safeParse({
          provider: "deepseek",
          apiKey: "sk-deepseek-123",
          model: "deepseek-chat",
        }).success
      ).toBe(true);
    });
  });

  describe("BulkUpdateConfigsSchema", () => {
    it("validates list of key-value pairs", () => {
      const payload = {
        configs: [
          { key: "SITE_NAME", value: "GradeWise AI" },
          { key: "MAX_UPLOAD_MB", value: "25" },
        ],
      };
      expect(BulkUpdateConfigsSchema.safeParse(payload).success).toBe(true);
    });
  });
});
