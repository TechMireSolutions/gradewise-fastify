import { z } from "zod";

export const ProviderEnum = z.enum(["gemini", "groq", "openai", "claude", "mistral", "deepseek"]);
export type ProviderType = z.infer<typeof ProviderEnum>;

export const PurposeEnum = z.enum(["text", "pdf"]);
export type PurposeType = z.infer<typeof PurposeEnum>;

export const BulkUpdateConfigsSchema = z.object({
  configs: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  ),
});
export type BulkUpdateConfigsInput = z.infer<typeof BulkUpdateConfigsSchema>;

export const AddAiKeysSchema = z.object({
  provider: ProviderEnum,
  purpose: PurposeEnum,
  keys: z.array(z.string().min(1)),
  model: z.string().min(1).optional(),
});
export type AddAiKeysInput = z.infer<typeof AddAiKeysSchema>;

export const SetProviderModelSchema = z.object({
  provider: ProviderEnum,
  purpose: PurposeEnum,
  model: z.string().min(1),
});
export type SetProviderModelInput = z.infer<typeof SetProviderModelSchema>;

export const DeleteAiKeySchema = z.object({
  provider: ProviderEnum,
  purpose: PurposeEnum,
  keyIndex: z.number().int().min(0),
});
export type DeleteAiKeyInput = z.infer<typeof DeleteAiKeySchema>;

export const TestAiKeySchema = z.object({
  provider: ProviderEnum,
  purpose: PurposeEnum,
  keyIndex: z.number().int().min(0),
});
export type TestAiKeyInput = z.infer<typeof TestAiKeySchema>;

export const TestInlineAiKeySchema = z.object({
  provider: ProviderEnum,
  apiKey: z.string().min(1),
  model: z.string().optional(),
});
export type TestInlineAiKeyInput = z.infer<typeof TestInlineAiKeySchema>;
