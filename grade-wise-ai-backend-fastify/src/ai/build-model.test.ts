import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildLanguageModel } from "./build-model.js";
import * as googleAi from "@ai-sdk/google";
import * as openAi from "@ai-sdk/openai";
import * as anthropicAi from "@ai-sdk/anthropic";
import * as groqAi from "@ai-sdk/groq";
import * as mistralAi from "@ai-sdk/mistral";

vi.mock("@ai-sdk/google");
vi.mock("@ai-sdk/openai");
vi.mock("@ai-sdk/anthropic");
vi.mock("@ai-sdk/groq");
vi.mock("@ai-sdk/mistral");

describe("buildLanguageModel factory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds a gemini language model", () => {
    const mockModelFn = vi.fn().mockReturnValue({ modelId: "gemini-2.5-flash" });
    vi.mocked(googleAi.createGoogleGenerativeAI).mockReturnValue(mockModelFn as never);

    const model = buildLanguageModel("gemini", "gemini-key", "gemini-2.5-flash");

    expect(googleAi.createGoogleGenerativeAI).toHaveBeenCalledWith({ apiKey: "gemini-key" });
    expect(mockModelFn).toHaveBeenCalledWith("gemini-2.5-flash");
    expect(model).toEqual({ modelId: "gemini-2.5-flash" });
  });

  it("builds an openai language model", () => {
    const mockModelFn = vi.fn().mockReturnValue({ modelId: "gpt-4o" });
    vi.mocked(openAi.createOpenAI).mockReturnValue(mockModelFn as never);

    const model = buildLanguageModel("openai", "openai-key", "gpt-4o");

    expect(openAi.createOpenAI).toHaveBeenCalledWith({ apiKey: "openai-key" });
    expect(mockModelFn).toHaveBeenCalledWith("gpt-4o");
    expect(model).toEqual({ modelId: "gpt-4o" });
  });

  it("builds a claude language model", () => {
    const mockModelFn = vi.fn().mockReturnValue({ modelId: "claude-3-5-sonnet" });
    vi.mocked(anthropicAi.createAnthropic).mockReturnValue(mockModelFn as never);

    const model = buildLanguageModel("claude", "claude-key", "claude-3-5-sonnet");

    expect(anthropicAi.createAnthropic).toHaveBeenCalledWith({ apiKey: "claude-key" });
    expect(mockModelFn).toHaveBeenCalledWith("claude-3-5-sonnet");
    expect(model).toEqual({ modelId: "claude-3-5-sonnet" });
  });

  it("builds a groq language model", () => {
    const mockModelFn = vi.fn().mockReturnValue({ modelId: "llama-3.3-70b-versatile" });
    vi.mocked(groqAi.createGroq).mockReturnValue(mockModelFn as never);

    const model = buildLanguageModel("groq", "groq-key", "llama-3.3-70b-versatile");

    expect(groqAi.createGroq).toHaveBeenCalledWith({ apiKey: "groq-key" });
    expect(mockModelFn).toHaveBeenCalledWith("llama-3.3-70b-versatile");
    expect(model).toEqual({ modelId: "llama-3.3-70b-versatile" });
  });

  it("builds a mistral language model", () => {
    const mockModelFn = vi.fn().mockReturnValue({ modelId: "mistral-large-latest" });
    vi.mocked(mistralAi.createMistral).mockReturnValue(mockModelFn as never);

    const model = buildLanguageModel("mistral", "mistral-key", "mistral-large-latest");

    expect(mistralAi.createMistral).toHaveBeenCalledWith({ apiKey: "mistral-key" });
    expect(mockModelFn).toHaveBeenCalledWith("mistral-large-latest");
    expect(model).toEqual({ modelId: "mistral-large-latest" });
  });

  it("builds a deepseek model using openai-compatible client and custom baseURL", () => {
    const mockModelFn = vi.fn().mockReturnValue({ modelId: "deepseek-chat" });
    vi.mocked(openAi.createOpenAI).mockReturnValue(mockModelFn as never);

    const model = buildLanguageModel("deepseek", "deepseek-key", "deepseek-chat");

    expect(openAi.createOpenAI).toHaveBeenCalledWith({
      apiKey: "deepseek-key",
      baseURL: "https://api.deepseek.com/v1",
    });
    expect(mockModelFn).toHaveBeenCalledWith("deepseek-chat");
    expect(model).toEqual({ modelId: "deepseek-chat" });
  });
});
