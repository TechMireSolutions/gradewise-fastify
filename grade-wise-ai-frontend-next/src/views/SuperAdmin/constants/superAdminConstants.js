import { statusTone, gradient } from "../../../lib/ui.js";

export const ALL_PROVIDERS = ["gemini", "groq", "openai", "claude", "mistral", "deepseek"];

export const defaultModelMap = {
  gemini: "gemini-2.5-flash",
  groq: "openai/gpt-oss-120b",
  openai: "gpt-4o-mini",
  claude: "claude-sonnet-4-6",
  mistral: "mistral-large-latest",
  deepseek: "deepseek-chat",
};

export const providerLabels = {
  gemini: "Google Gemini",
  groq: "Groq AI",
  openai: "OpenAI",
  claude: "Anthropic Claude",
  mistral: "Mistral AI",
  deepseek: "DeepSeek",
};

export const PROVIDER_META = {
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    badge: "Multimodal & Fast",
    tagline: "Ultra-fast inference with native document OCR & huge context",
    description: "Google's flagship multimodal models. Excels at extracting syllabi, diagrams, and complex lecture notes from PDFs.",
    defaultModel: "gemini-2.5-flash",
    keyPrefix: "AIza... or AQ....",
    keyPlaceholder: "AIzaSy...",
    docsUrl: "https://aistudio.google.com/app/apikey",
  },
  groq: {
    id: "groq",
    name: "Groq AI",
    badge: "Instant LPU",
    tagline: "Ultra-low latency inference on specialized LPU hardware",
    description: "Open-weight powerhouse running GPT-OSS 120B, Llama 4, and Qwen 3.6 with near-instantaneous token generation.",
    defaultModel: "openai/gpt-oss-120b",
    keyPrefix: "gsk_...",
    keyPlaceholder: "gsk_...",
    docsUrl: "https://console.groq.com/keys",
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    badge: "Frontier Reasoning",
    tagline: "Industry standard GPT-4o, GPT-5 series, and o3 reasoning",
    description: "Highly capable STEM reasoning, multilingual exam question synthesis, and detailed rubric compliance.",
    defaultModel: "gpt-4o-mini",
    keyPrefix: "sk-proj-... or sk-...",
    keyPlaceholder: "sk-proj-...",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  claude: {
    id: "claude",
    name: "Anthropic Claude",
    badge: "Pedagogical Depth",
    tagline: "Nuanced rubric scoring & long-form educational analysis",
    description: "Claude 3.7 / 3.5 Sonnet & Haiku models with industry-leading understanding of nuanced educational directives.",
    defaultModel: "claude-sonnet-4-6",
    keyPrefix: "sk-ant-...",
    keyPlaceholder: "sk-ant-api03-...",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  mistral: {
    id: "mistral",
    name: "Mistral AI",
    badge: "European Frontier",
    tagline: "High-efficiency multilingual open and commercial models",
    description: "Mistral Large and Nemo offer balanced multilingual processing across English, Urdu, Arabic, and French.",
    defaultModel: "mistral-large-latest",
    keyPrefix: "32 hex characters",
    keyPlaceholder: "a1b2c3d4e5f6...",
    docsUrl: "https://console.mistral.ai/api-keys",
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    badge: "Cost-Effective Reasoning",
    tagline: "DeepSeek V3 Chat and R1 Reasoner with stellar economics",
    description: "High-reasoning performance and code analysis at unprecedented cost efficiency for large-scale assessment evaluation.",
    defaultModel: "deepseek-chat",
    keyPrefix: "sk-...",
    keyPlaceholder: "sk-...",
    docsUrl: "https://platform.deepseek.com/api_keys",
  },
};

export const providerTheme = {
  gemini: {
    dot: "bg-indigo-500",
    badge: statusTone.info,
    activeSidebar: "bg-indigo-500/15 border-indigo-500/30 text-indigo-700 dark:text-indigo-300",
    activeText: "text-indigo-700 dark:text-indigo-300",
    panelGradient: "from-indigo-600 to-violet-600",
    saveGradient: "from-indigo-500 to-violet-600",
    focusBorder: "focus:border-indigo-500",
    accentBg: gradient.brand,
  },
  groq: {
    dot: "bg-amber-500",
    badge: statusTone.warning,
    activeSidebar: "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300",
    activeText: "text-amber-700 dark:text-amber-300",
    panelGradient: "from-amber-500 to-orange-600",
    saveGradient: "from-amber-500 to-orange-600",
    focusBorder: "focus:border-amber-500",
    accentBg: gradient.amber,
  },
  openai: {
    dot: "bg-emerald-500",
    badge: statusTone.success,
    activeSidebar: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    activeText: "text-emerald-700 dark:text-emerald-300",
    panelGradient: "from-emerald-600 to-teal-600",
    saveGradient: "from-emerald-500 to-teal-600",
    focusBorder: "focus:border-emerald-500",
    accentBg: gradient.emerald,
  },
  claude: {
    dot: "bg-violet-500",
    badge: statusTone.purple,
    activeSidebar: "bg-violet-500/15 border-violet-500/30 text-violet-700 dark:text-violet-300",
    activeText: "text-violet-700 dark:text-violet-300",
    panelGradient: "from-violet-600 to-purple-700",
    saveGradient: "from-violet-500 to-purple-700",
    focusBorder: "focus:border-violet-500",
    accentBg: "bg-gradient-to-br from-violet-500 to-purple-700",
  },
  mistral: {
    dot: "bg-rose-500",
    badge: statusTone.danger,
    activeSidebar: "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300",
    activeText: "text-rose-700 dark:text-rose-300",
    panelGradient: "from-rose-600 to-pink-700",
    saveGradient: "from-rose-500 to-pink-700",
    focusBorder: "focus:border-rose-500",
    accentBg: gradient.danger,
  },
  deepseek: {
    dot: "bg-sky-500",
    badge: statusTone.sky,
    activeSidebar: "bg-sky-500/15 border-sky-500/30 text-sky-700 dark:text-sky-300",
    activeText: "text-sky-700 dark:text-sky-300",
    panelGradient: "from-sky-600 to-blue-700",
    saveGradient: "from-sky-500 to-blue-700",
    focusBorder: "focus:border-sky-500",
    accentBg: "bg-gradient-to-br from-sky-500 to-blue-700",
  },
};

export function buildInitialState() {
  const perProvider = () =>
    Object.fromEntries(
      ALL_PROVIDERS.map((p) => [
        p,
        { model: defaultModelMap[p], newKeys: "", keysDirty: false, list: [], testStatus: {} },
      ])
    );
  return { pdf: perProvider(), text: perProvider() };
}

export function detectProvider(text) {
  if (!text) return null;
  const k = text.split(",")[0].trim();
  if (!k) return null;
  if (k.startsWith("sk-ant-")) return "claude";
  if (k.startsWith("gsk_")) return "groq";
  if (k.startsWith("sk-proj-") || k.startsWith("sk-svcacct-") || k.startsWith("sk-")) return "openai";
  if (k.startsWith("AIza") || k.startsWith("AQ.")) return "gemini";
  if (/^[a-zA-Z0-9]{32}$/.test(k)) return "mistral";
  return null;
}
