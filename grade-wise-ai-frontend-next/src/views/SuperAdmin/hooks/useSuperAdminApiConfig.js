"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listAiKeys,
  getAiSummary,
  addAiKeys as apiAddAiKeys,
  setProviderModel as apiSetProviderModel,
  deleteAiKey as apiDeleteAiKey,
  testStoredAiKey,
  testInlineAiKey,
} from "@/features/ai-config/api.js";
import useModal from "@/hooks/useModal.js";

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

export const modelOptions = {
  gemini: [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (recommended)" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite" },
    { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash-Lite" },
    { value: "gemini-1.5-flash-8b", label: "Gemini 1.5 Flash 8B" },
  ],
  groq: [
    { value: "openai/gpt-oss-120b", label: "GPT-OSS 120B (recommended)" },
    { value: "openai/gpt-oss-20b", label: "GPT-OSS 20B" },
    { value: "qwen/qwen3.6-27b", label: "Qwen 3.6 27B" },
    { value: "meta-llama/llama-4-scout-17b-16e-instruct", label: "Llama 4 Scout 17B" },
    { value: "meta-llama/llama-4-maverick-17b-128e-instruct", label: "Llama 4 Maverick 17B" },
    { value: "allam-2-7b", label: "Allam 2 7B" },
    { value: "groq/compound", label: "Groq Compound" },
    { value: "groq/compound-mini", label: "Groq Compound Mini" },
  ],
  openai: [
    { value: "gpt-5", label: "GPT-5" },
    { value: "gpt-5-mini", label: "GPT-5 Mini" },
    { value: "o3", label: "o3" },
    { value: "o3-mini", label: "o3-mini" },
    { value: "o1", label: "o1" },
    { value: "o1-mini", label: "o1-mini" },
    { value: "o1-preview", label: "o1-preview" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  claude: [
    { value: "claude-fable-5", label: "Claude Fable 5 (most capable)" },
    { value: "claude-opus-4-8", label: "Claude Opus 4.8" },
    { value: "claude-opus-4-7", label: "Claude Opus 4.7" },
    { value: "claude-opus-4-6", label: "Claude Opus 4.6" },
    { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (recommended)" },
    { value: "claude-haiku-4-5", label: "Claude Haiku 4.5" },
  ],
  mistral: [
    { value: "mistral-large-latest", label: "Mistral Large" },
    { value: "mistral-medium-latest", label: "Mistral Medium" },
    { value: "mistral-small-latest", label: "Mistral Small" },
    { value: "open-mistral-nemo", label: "Mistral Nemo" },
    { value: "codestral-latest", label: "Codestral" },
  ],
  deepseek: [
    { value: "deepseek-chat", label: "DeepSeek Chat (V3)" },
    { value: "deepseek-reasoner", label: "DeepSeek Reasoner (R1)" },
    { value: "deepseek-coder", label: "DeepSeek Coder" },
  ],
};

export const FEATURED_MODELS = {
  gemini: [
    { value: "gemini-2.5-flash", tag: "Recommended", desc: "Multimodal document vision with low latency" },
    { value: "gemini-2.5-pro", tag: "Deep Reasoning", desc: "Complex STEM synthesis & high-depth analysis" },
    { value: "gemini-2.5-flash-lite", tag: "Fast & Light", desc: "Ultra-low latency throughput" },
  ],
  groq: [
    { value: "openai/gpt-oss-120b", tag: "Recommended", desc: "120B parameter open weights on instant LPU" },
    { value: "qwen/qwen3.6-27b", tag: "STEM Specialist", desc: "Advanced mathematics and multilingual comprehension" },
    { value: "meta-llama/llama-4-scout-17b-16e-instruct", tag: "Llama 4", desc: "Next-gen Llama scout architecture" },
  ],
  openai: [
    { value: "gpt-4o-mini", tag: "Recommended", desc: "Fast, intelligent, and cost-effective daily driver" },
    { value: "gpt-4o", tag: "Frontier", desc: "Multimodal frontier model for complex questions" },
    { value: "o3-mini", tag: "STEM Reasoning", desc: "Chain-of-thought STEM evaluation" },
  ],
  claude: [
    { value: "claude-sonnet-4-6", tag: "Recommended", desc: "Premier model for nuanced rubric scoring & XAI" },
    { value: "claude-haiku-4-5", tag: "Ultra-Fast", desc: "Near-instant turnaround for concise extraction" },
    { value: "claude-opus-4-8", tag: "Maximum Depth", desc: "Deepest pedagogical understanding" },
  ],
  mistral: [
    { value: "mistral-large-latest", tag: "Recommended", desc: "Flagship model with robust multilingual support" },
    { value: "open-mistral-nemo", tag: "Lightweight", desc: "12B parameter efficient multilingual model" },
    { value: "codestral-latest", tag: "Code Specialist", desc: "Algorithmic and programming evaluation" },
  ],
  deepseek: [
    { value: "deepseek-chat", tag: "Recommended", desc: "DeepSeek V3 high-throughput general reasoning" },
    { value: "deepseek-reasoner", tag: "Reasoning R1", desc: "DeepSeek R1 reasoning benchmark champion" },
    { value: "deepseek-coder", tag: "Code Logic", desc: "Code and syntax evaluation" },
  ],
};

export const providerTheme = {
  gemini: {
    dot: "bg-indigo-500",
    badge: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20",
    activeSidebar: "bg-indigo-500/15 border-indigo-500/30 text-indigo-700 dark:text-indigo-300",
    activeText: "text-indigo-700 dark:text-indigo-300",
    panelGradient: "from-indigo-600 to-violet-600",
    saveGradient: "from-indigo-500 to-violet-600",
    focusBorder: "focus:border-indigo-500",
    accentBg: "bg-gradient-to-br from-indigo-500 to-violet-600",
  },
  groq: {
    dot: "bg-amber-500",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    activeSidebar: "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300",
    activeText: "text-amber-700 dark:text-amber-300",
    panelGradient: "from-amber-500 to-orange-600",
    saveGradient: "from-amber-500 to-orange-600",
    focusBorder: "focus:border-amber-500",
    accentBg: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
  openai: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    activeSidebar: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    activeText: "text-emerald-700 dark:text-emerald-300",
    panelGradient: "from-emerald-600 to-teal-600",
    saveGradient: "from-emerald-500 to-teal-600",
    focusBorder: "focus:border-emerald-500",
    accentBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
  claude: {
    dot: "bg-violet-500",
    badge: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/20",
    activeSidebar: "bg-violet-500/15 border-violet-500/30 text-violet-700 dark:text-violet-300",
    activeText: "text-violet-700 dark:text-violet-300",
    panelGradient: "from-violet-600 to-purple-700",
    saveGradient: "from-violet-500 to-purple-700",
    focusBorder: "focus:border-violet-500",
    accentBg: "bg-gradient-to-br from-violet-500 to-purple-700",
  },
  mistral: {
    dot: "bg-rose-500",
    badge: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20",
    activeSidebar: "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300",
    activeText: "text-rose-700 dark:text-rose-300",
    panelGradient: "from-rose-600 to-pink-700",
    saveGradient: "from-rose-500 to-pink-700",
    focusBorder: "focus:border-rose-500",
    accentBg: "bg-gradient-to-br from-rose-500 to-pink-700",
  },
  deepseek: {
    dot: "bg-sky-500",
    badge: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/20",
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

export default function useSuperAdminApiConfig() {
  const [aiState, setAiState] = useState(buildInitialState);
  const [configSubTab, setConfigSubTab] = useState("pdf");
  const [activeProvider, setActiveProvider] = useState({ pdf: "gemini", text: "gemini" });
  const [pendingKeyDelete, setPendingKeyDelete] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [modalInitialStep, setModalInitialStep] = useState(1);
  const [inlineTestStatus, setInlineTestStatus] = useState({});
  const [configLoading, setConfigLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const { modal, showModal, closeModal } = useModal();

  const openAddLlmModal = useCallback((prov = null, initialStep = 1, initialPurpose = null) => {
    if (initialPurpose) {
      setConfigSubTab(initialPurpose);
    }
    if (prov) {
      setActiveProvider((prev) => ({ ...prev, [initialPurpose || configSubTab]: prov }));
    }
    setModalInitialStep(initialStep);
    setIsSettingsModalOpen(true);
  }, [configSubTab]);

  const openSettingsModal = openAddLlmModal;

  const closeSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, []);

  const patchPP = useCallback((purpose, provider, patch) => {
    setAiState((prev) => ({
      ...prev,
      [purpose]: {
        ...prev[purpose],
        [provider]: { ...prev[purpose][provider], ...patch },
      },
    }));
  }, []);

  const refreshKeyList = useCallback(
    async (purpose, provider) => {
      try {
        const r = await listAiKeys(purpose, provider);
        if (r.success) {
          patchPP(purpose, provider, {
            list: r.keys || [],
            model: r.model || defaultModelMap[provider],
          });
        }
      } catch (e) {
        console.error(`Failed to load ${purpose}/${provider} keys:`, e);
      }
    },
    [patchPP]
  );

  const refreshAllKeyLists = useCallback(async () => {
    try {
      const summary = await getAiSummary();
      if (!summary.success) return;
      const promises = [];
      for (const pur of ["pdf", "text"]) {
        for (const prov of ALL_PROVIDERS) {
          const s = summary.summary[pur]?.[prov];
          if (!s) continue;
          patchPP(pur, prov, { model: s.model || defaultModelMap[prov] });
          if (s.count > 0) promises.push(refreshKeyList(pur, prov));
        }
      }
      await Promise.all(promises);
    } catch (e) {
      console.error("Failed to load AI summary:", e);
    }
  }, [patchPP, refreshKeyList]);

  useEffect(() => {
    refreshAllKeyLists();
  }, [refreshAllKeyLists]);

  const updateActiveCard = (field, value) => {
    const pur = configSubTab;
    const prov = activeProvider[pur];
    const patch = { [field]: value };
    if (field === "model") patch.modelManuallyChanged = true;
    if (field === "newKeys") {
      patch.keysDirty = true;
      const detected = detectProvider(value);
      if (detected) {
        const autoModel = defaultModelMap[detected];
        if (detected !== prov) {
          setActiveProvider((prev) => ({ ...prev, [pur]: detected }));
          patchPP(pur, detected, {
            newKeys: value,
            keysDirty: true,
            model: autoModel,
            detectedInfo: { provider: detected, model: autoModel },
          });
          patchPP(pur, prov, { newKeys: "", keysDirty: false });
          return;
        } else {
          if (!aiState[pur][prov].modelManuallyChanged) {
            patch.model = autoModel;
          }
          patch.detectedInfo = { provider: detected, model: autoModel };
        }
      } else {
        patch.detectedInfo = null;
      }
    }
    patchPP(pur, prov, patch);
  };

  const handleSaveLlm = async ({ purpose: targetPurpose, provider: targetProvider, key: targetKey, model: targetModel }) => {
    const pur = targetPurpose || configSubTab;
    const prov = targetProvider || activeProvider[pur];
    const keyToSave = typeof targetKey === "string" ? targetKey.trim() : "";
    const modelToSave = targetModel || aiState[pur]?.[prov]?.model || defaultModelMap[prov];

    try {
      setConfigLoading(true);
      let added = 0;
      let autoPickedModel = null;
      let autoPickedSource = null;

      if (keyToSave) {
        const r = await apiAddAiKeys(pur, prov, keyToSave, modelToSave);
        added = r.added || 0;
        autoPickedModel = r.autoPickedModel;
        autoPickedSource = r.autoPickedSource;
      } else if (modelToSave) {
        await apiSetProviderModel(pur, prov, modelToSave);
      }

      patchPP(pur, prov, {
        newKeys: "",
        keysDirty: false,
        model: modelToSave,
        modelManuallyChanged: false,
        detectedInfo: null,
      });

      // Switch active tab and provider so user sees the newly configured LLM immediately
      setConfigSubTab(pur);
      setActiveProvider((prev) => ({ ...prev, [pur]: prov }));

      await refreshKeyList(pur, prov);

      const purposeLabel = pur === "pdf" ? "PDF Reading" : "Text Generation";
      const providerLabel = providerLabels[prov] || prov;

      let msg = "";
      if (keyToSave) {
        msg = `${added} key${added === 1 ? "" : "s"} added to ${providerLabel} (${purposeLabel}) with active model "${modelToSave}".`;
        if (autoPickedModel && autoPickedSource && autoPickedSource !== "default") {
          msg += ` Verified model: ${autoPickedModel}.`;
        }
      } else {
        msg = `${providerLabel} model updated to "${modelToSave}" for ${purposeLabel}.`;
      }

      setIsSettingsModalOpen(false);
      showModal("success", "LLM Configured Successfully", msg);
      return { success: true };
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to configure LLM. Please try again.";
      showModal("error", "Configuration Rejected", msg);
      return { success: false, error: msg };
    } finally {
      setConfigLoading(false);
    }
  };

  const handleSaveCard = async () => {
    const pur = configSubTab;
    const prov = activeProvider[pur];
    const card = aiState[pur][prov];
    return handleSaveLlm({
      purpose: pur,
      provider: prov,
      key: card.newKeys,
      model: card.model,
    });
  };

  const handleTestStoredKey = async (purpose, provider, index) => {
    const card = aiState[purpose][provider];
    patchPP(purpose, provider, {
      testStatus: { ...card.testStatus, [index]: { state: "testing" } },
    });
    try {
      const r = await testStoredAiKey(purpose, provider, index);
      const status = {
        state: r.success ? "ok" : "fail",
        message: r.message,
        latencyMs: r.latencyMs,
        modelUsed: r.modelUsed,
        autoSwitchedModelFrom: r.autoSwitchedModelFrom,
      };
      setAiState((prev) => ({
        ...prev,
        [purpose]: {
          ...prev[purpose],
          [provider]: {
            ...prev[purpose][provider],
            testStatus: { ...prev[purpose][provider].testStatus, [index]: status },
          },
        },
      }));
      if (r.autoSwitchedModelFrom) await refreshKeyList(purpose, provider);
    } catch (e) {
      setAiState((prev) => ({
        ...prev,
        [purpose]: {
          ...prev[purpose],
          [provider]: {
            ...prev[purpose][provider],
            testStatus: {
              ...prev[purpose][provider].testStatus,
              [index]: { state: "fail", message: e?.response?.data?.message || e.message },
            },
          },
        },
      }));
    }
  };

  const handleDeleteStoredKey = (purpose, provider, index, snippet) => {
    setPendingKeyDelete({ purpose, provider, index, snippet });
    showModal(
      "warning",
      "Delete API Key?",
      `This will permanently remove key #${index + 1} (${snippet}) from the ${
        providerLabels[provider]
      } pool under ${purpose === "pdf" ? "PDF Reading" : "Text Generation"}. This cannot be undone.`
    );
  };

  const confirmDeleteKey = async () => {
    if (!pendingKeyDelete) return;
    const { purpose, provider, index } = pendingKeyDelete;
    try {
      setActionLoading(`delete-key-${purpose}-${provider}-${index}`);
      await apiDeleteAiKey(purpose, provider, index);
      await refreshKeyList(purpose, provider);
      setPendingKeyDelete(null);
      showModal("success", "Key Deleted", "API key removed from the pool.");
    } catch (err) {
      setPendingKeyDelete(null);
      showModal("error", "Error", err?.response?.data?.message || "Failed to delete key. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseModal = () => {
    setPendingKeyDelete(null);
    closeModal();
  };

  const handleTestInlineKey = async (overrideProv, overrideModel, overrideKey) => {
    const pur = configSubTab;
    const prov = overrideProv || activeProvider[pur];
    const card = aiState[pur]?.[prov] || {};
    const key = overrideKey !== undefined ? overrideKey : (card.newKeys || "").split(",")[0]?.trim();
    const model = overrideModel || card.model || defaultModelMap[prov];

    if (!key) {
      showModal("warning", "No key entered", "Enter an API key first to test the connection.");
      return null;
    }

    const id = `${pur}-${prov}`;
    setInlineTestStatus((s) => ({ ...s, [id]: { state: "testing" } }));
    try {
      const r = await testInlineAiKey(prov, model, key);
      const res = {
        state: r.success ? "ok" : "fail",
        message: r.message,
        latencyMs: r.latencyMs,
        modelUsed: r.modelUsed || model,
      };
      setInlineTestStatus((s) => ({ ...s, [id]: res }));
      return res;
    } catch (e) {
      const res = { state: "fail", message: e?.response?.data?.message || e.message };
      setInlineTestStatus((s) => ({ ...s, [id]: res }));
      return res;
    }
  };

  const purpose = configSubTab;
  const provider = activeProvider[purpose];
  const card = aiState[purpose][provider];
  const pStyle = providerTheme[provider];

  const totalPdfKeys = ALL_PROVIDERS.reduce((s, p) => s + aiState.pdf[p].list.length, 0);
  const totalTextKeys = ALL_PROVIDERS.reduce((s, p) => s + aiState.text[p].list.length, 0);
  const totalKeys = totalPdfKeys + totalTextKeys;
  const configuredCount = ALL_PROVIDERS.filter((p) => aiState[purpose][p].list.length > 0).length;

  return {
    aiState,
    configSubTab,
    setConfigSubTab,
    activeProvider,
    setActiveProvider,
    purpose,
    provider,
    card,
    pStyle,
    totalPdfKeys,
    totalTextKeys,
    totalKeys,
    configuredCount,
    configLoading,
    actionLoading,
    inlineTestStatus,
    pendingKeyDelete,
    isSettingsModalOpen,
    modalInitialStep,
    openAddLlmModal,
    openSettingsModal,
    closeSettingsModal,
    modal,
    closeModal: handleCloseModal,
    updateActiveCard,
    handleSaveCard,
    handleSaveLlm,
    handleTestStoredKey,
    handleDeleteStoredKey,
    confirmDeleteKey,
    handleTestInlineKey,
  };
}
