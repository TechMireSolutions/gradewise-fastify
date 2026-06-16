import { generateText } from "ai";
import { callWithRotation, type ProviderInstance } from "./providers.js";

export interface GenerateOptions {
  maxOutputTokens?: number;
  temperature?: number;
  system?: string;
}

export async function generateContent(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const { maxOutputTokens = 4096, temperature = 0.7, system } = options;

  const result = await callWithRotation(
    "text",
    async (provider: ProviderInstance) => {
      const { text } = await generateText({
        model: provider.model,
        prompt,
        system,
        maxOutputTokens,
        temperature,
      });
      console.log(`[AI] Generated via ${provider.type}/${provider.modelName}`);
      return text;
    }
  );

  return result;
}

export async function generatePdfContent(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const { maxOutputTokens = 8192, temperature = 0.3, system } = options;

  const result = await callWithRotation(
    "pdf",
    async (provider: ProviderInstance) => {
      const { text } = await generateText({
        model: provider.model,
        prompt,
        system,
        maxOutputTokens,
        temperature,
      });
      return text;
    }
  );

  return result;
}

export const mapLanguageCode = (lang: string): string => {
  const map: Record<string, string> = {
    en: "English",
    ur: "Urdu",
    ar: "Arabic",
    fa: "Persian",
  };
  return map[lang] ?? "English";
};
