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
  gemini: "gemini-2.0-flash",
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

export const providerTheme = {
  gemini: {
    dot: "bg-indigo-500",
    badge: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
    activeSidebar: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
    activeText: "text-indigo-300",
    panelGradient: "from-indigo-600 to-violet-600",
    saveGradient: "from-indigo-500 to-violet-600",
    focusBorder: "focus:border-indigo-500",
    accentBg: "bg-gradient-to-br from-indigo-500 to-violet-600",
  },
  groq: {
    dot: "bg-amber-500",
    badge: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    activeSidebar: "bg-amber-500/15 border-amber-500/30 text-amber-300",
    activeText: "text-amber-300",
    panelGradient: "from-amber-500 to-orange-600",
    saveGradient: "from-amber-500 to-orange-600",
    focusBorder: "focus:border-amber-500",
    accentBg: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
  openai: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    activeSidebar: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    activeText: "text-emerald-300",
    panelGradient: "from-emerald-600 to-teal-600",
    saveGradient: "from-emerald-500 to-teal-600",
    focusBorder: "focus:border-emerald-500",
    accentBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
  claude: {
    dot: "bg-violet-500",
    badge: "bg-violet-500/15 text-violet-400 border border-violet-500/20",
    activeSidebar: "bg-violet-500/15 border-violet-500/30 text-violet-300",
    activeText: "text-violet-300",
    panelGradient: "from-violet-600 to-purple-700",
    saveGradient: "from-violet-500 to-purple-700",
    focusBorder: "focus:border-violet-500",
    accentBg: "bg-gradient-to-br from-violet-500 to-purple-700",
  },
  mistral: {
    dot: "bg-rose-500",
    badge: "bg-rose-500/15 text-rose-400 border border-rose-500/20",
    activeSidebar: "bg-rose-500/15 border-rose-500/30 text-rose-300",
    activeText: "text-rose-300",
    panelGradient: "from-rose-600 to-pink-700",
    saveGradient: "from-rose-500 to-pink-700",
    focusBorder: "focus:border-rose-500",
    accentBg: "bg-gradient-to-br from-rose-500 to-pink-700",
  },
  deepseek: {
    dot: "bg-sky-500",
    badge: "bg-sky-500/15 text-sky-400 border border-sky-500/20",
    activeSidebar: "bg-sky-500/15 border-sky-500/30 text-sky-300",
    activeText: "text-sky-300",
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
  const [inlineTestStatus, setInlineTestStatus] = useState({});
  const [configLoading, setConfigLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const { modal, showModal, closeModal } = useModal();

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
      if (detected && detected !== prov) {
        setActiveProvider((prev) => ({ ...prev, [pur]: detected }));
        patchPP(pur, detected, { newKeys: value, keysDirty: true });
        patchPP(pur, prov, { newKeys: "", keysDirty: false });
        return;
      }
    }
    patchPP(pur, prov, patch);
  };

  const handleSaveCard = async () => {
    const pur = configSubTab;
    const prov = activeProvider[pur];
    const card = aiState[pur][prov];
    try {
      setConfigLoading(true);
      let added = 0;
      let autoPickedModel = null;
      let autoPickedSource = null;
      if (card.keysDirty && card.newKeys.trim()) {
        const explicitModel = card.modelManuallyChanged ? card.model : undefined;
        const r = await apiAddAiKeys(pur, prov, card.newKeys, explicitModel);
        added = r.added || 0;
        autoPickedModel = r.autoPickedModel;
        autoPickedSource = r.autoPickedSource;
      } else {
        await apiSetProviderModel(pur, prov, card.model);
      }
      patchPP(pur, prov, { newKeys: "", keysDirty: false, modelManuallyChanged: false });
      await refreshKeyList(pur, prov);
      const purposeLabel = pur === "pdf" ? "PDF Reading" : "Text Generation";
      const providerLabel = providerLabels[prov];
      let msg;
      if (card.keysDirty) {
        msg = `${added} key${added === 1 ? "" : "s"} added to ${providerLabel} (${purposeLabel}).`;
        if (autoPickedModel && autoPickedSource && autoPickedSource !== "default") {
          msg += ` Model auto-selected: ${autoPickedModel} (${
            autoPickedSource === "listed" ? "discovered from key's available models" : "verified via probe"
          }).`;
        }
        msg += " Form cleared — ready for the next key.";
      } else {
        msg = `${providerLabel} model saved for ${purposeLabel}.`;
      }
      showModal("success", "Saved", msg);
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to save settings. Please try again.";
      showModal("error", "Save Rejected", msg);
    } finally {
      setConfigLoading(false);
    }
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
      showModal("success", "Key Deleted", "API key removed from the pool.");
    } catch {
      showModal("error", "Error", "Failed to delete key. Please try again.");
    } finally {
      setActionLoading(null);
      setPendingKeyDelete(null);
    }
  };

  const handleTestInlineKey = async () => {
    const pur = configSubTab;
    const prov = activeProvider[pur];
    const card = aiState[pur][prov];
    const firstKey = (card.newKeys || "").split(",")[0]?.trim();
    if (!firstKey) {
      showModal("warning", "No key entered", "Paste a key in the textarea first.");
      return;
    }
    const id = `${pur}-${prov}`;
    setInlineTestStatus((s) => ({ ...s, [id]: { state: "testing" } }));
    try {
      const r = await testInlineAiKey(prov, card.model, firstKey);
      setInlineTestStatus((s) => ({
        ...s,
        [id]: { state: r.success ? "ok" : "fail", message: r.message, latencyMs: r.latencyMs },
      }));
    } catch (e) {
      setInlineTestStatus((s) => ({
        ...s,
        [id]: { state: "fail", message: e?.response?.data?.message || e.message },
      }));
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
    modal,
    closeModal,
    updateActiveCard,
    handleSaveCard,
    handleTestStoredKey,
    handleDeleteStoredKey,
    confirmDeleteKey,
    handleTestInlineKey,
  };
}
