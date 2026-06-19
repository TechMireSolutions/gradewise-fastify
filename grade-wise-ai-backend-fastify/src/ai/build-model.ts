import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import type { LanguageModel } from "ai";
import type { ProviderType } from "./constants.js";

export function buildLanguageModel(
  type: ProviderType,
  key: string,
  modelName: string
): LanguageModel {
  switch (type) {
    case "gemini": {
      const g = createGoogleGenerativeAI({ apiKey: key });
      return g(modelName);
    }
    case "openai": {
      const o = createOpenAI({ apiKey: key });
      return o(modelName);
    }
    case "claude": {
      const a = createAnthropic({ apiKey: key });
      return a(modelName);
    }
    case "groq": {
      const gr = createGroq({ apiKey: key });
      return gr(modelName);
    }
    case "mistral": {
      const m = createMistral({ apiKey: key });
      return m(modelName);
    }
    case "deepseek": {
      const ds = createOpenAI({ apiKey: key, baseURL: "https://api.deepseek.com/v1" });
      return ds(modelName);
    }
  }
}
