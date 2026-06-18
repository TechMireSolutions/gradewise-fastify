import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import {
  listAiKeys,
  getAiSummary,
  addAiKeys as apiAddAiKeys,
  setProviderModel as apiSetProviderModel,
  deleteAiKey as apiDeleteAiKey,
  testStoredAiKey,
  testInlineAiKey,
} from "@/features/ai-config/api.js";
import {
  FaKey,
  FaFileAlt,
  FaPencilAlt,
  FaFlask,
  FaCheck,
  FaTimes,
  FaWrench,
  FaExclamationTriangle,
  FaTrash,
  FaArrowLeft,
  FaSave,
  FaInfoCircle,
} from "react-icons/fa";

// ─────────────────────────────────────────────────────────────
//  Test result pill
// ─────────────────────────────────────────────────────────────
function TestResultPill({ r }) {
  if (!r) return null;
  if (r.state === "testing") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700/60 text-slate-300 border border-slate-600/40 rounded-full text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
        Testing…
      </span>
    );
  }
  if (r.state === "ok") {
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold w-fit">
          <FaCheck className="w-2.5 h-2.5" /> Valid
          {typeof r.latencyMs === "number" && (
            <span className="font-mono opacity-70">{r.latencyMs}ms</span>
          )}
        </span>
        {r.autoSwitchedModelFrom && (
          <span className="inline-flex items-center gap-1 text-[11px] text-indigo-400 bg-indigo-500/15 border border-indigo-500/20 px-2 py-0.5 rounded w-fit">
            <FaWrench className="w-2.5 h-2.5 flex-shrink-0" /> Model auto-switched:{" "}
            <code className="font-mono">{r.autoSwitchedModelFrom}</code>{" "}→{" "}
            <code className="font-mono">{r.modelUsed}</code>
          </span>
        )}
        {r.providerOverridden && (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 rounded w-fit">
            <FaExclamationTriangle className="w-2.5 h-2.5 flex-shrink-0" /> Key belongs to{" "}
            <strong>{r.providerDetected}</strong> — consider moving it there.
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/15 text-red-400 border border-red-500/20 rounded-full text-xs font-semibold max-w-xs truncate w-fit">
        <FaTimes className="w-2.5 h-2.5 flex-shrink-0" />{" "}
        {(r.message || "Invalid key").substring(0, 60)}
      </span>
      {r.providerOverridden && (
        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 rounded w-fit">
          <FaExclamationTriangle className="w-2.5 h-2.5 flex-shrink-0" /> Key prefix suggests{" "}
          <strong>{r.providerDetected}</strong> provider.
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Module-level constants
// ─────────────────────────────────────────────────────────────
const ALL_PROVIDERS = ["gemini", "groq", "openai", "claude", "mistral", "deepseek"];

const defaultModelMap = {
  gemini:   "gemini-2.0-flash",
  groq:     "llama-3.3-70b-versatile",
  openai:   "gpt-4o-mini",
  claude:   "claude-sonnet-4-6",
  mistral:  "mistral-large-latest",
  deepseek: "deepseek-chat",
};

const providerLabels = {
  gemini:   "Google Gemini",
  groq:     "Groq AI",
  openai:   "OpenAI",
  claude:   "Anthropic Claude",
  mistral:  "Mistral AI",
  deepseek: "DeepSeek",
};

const modelOptions = {
  gemini: [
    { value: "gemini-2.5-flash",      label: "Gemini 2.5 Flash (recommended)" },
    { value: "gemini-2.5-pro",        label: "Gemini 2.5 Pro" },
    { value: "gemini-2.0-flash",      label: "Gemini 2.0 Flash" },
    { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite" },
    { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash-Lite" },
    { value: "gemini-1.5-flash-8b",   label: "Gemini 1.5 Flash 8B" },
  ],
  groq: [
    { value: "llama-3.3-70b-versatile",       label: "Llama 3.3 70B Versatile" },
    { value: "llama-3.1-70b-versatile",       label: "Llama 3.1 70B Versatile" },
    { value: "llama-3.1-8b-instant",          label: "Llama 3.1 8B Instant" },
    { value: "llama3-70b-8192",               label: "Llama 3 70B (8K ctx)" },
    { value: "llama3-8b-8192",                label: "Llama 3 8B (8K ctx)" },
    { value: "mixtral-8x7b-32768",            label: "Mixtral 8x7B" },
    { value: "gemma2-9b-it",                  label: "Gemma 2 9B IT" },
    { value: "gemma-7b-it",                   label: "Gemma 7B IT" },
    { value: "deepseek-r1-distill-llama-70b", label: "DeepSeek R1 Distill Llama 70B" },
  ],
  openai: [
    { value: "gpt-5",         label: "GPT-5" },
    { value: "gpt-5-mini",    label: "GPT-5 Mini" },
    { value: "o3",            label: "o3" },
    { value: "o3-mini",       label: "o3-mini" },
    { value: "o1",            label: "o1" },
    { value: "o1-mini",       label: "o1-mini" },
    { value: "o1-preview",    label: "o1-preview" },
    { value: "gpt-4o",        label: "GPT-4o" },
    { value: "gpt-4o-mini",   label: "GPT-4o Mini" },
    { value: "gpt-4-turbo",   label: "GPT-4 Turbo" },
    { value: "gpt-4",         label: "GPT-4" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  claude: [
    { value: "claude-fable-5",    label: "Claude Fable 5 (most capable)" },
    { value: "claude-opus-4-8",   label: "Claude Opus 4.8" },
    { value: "claude-opus-4-7",   label: "Claude Opus 4.7" },
    { value: "claude-opus-4-6",   label: "Claude Opus 4.6" },
    { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (recommended)" },
    { value: "claude-haiku-4-5",  label: "Claude Haiku 4.5" },
  ],
  mistral: [
    { value: "mistral-large-latest",  label: "Mistral Large" },
    { value: "mistral-medium-latest", label: "Mistral Medium" },
    { value: "mistral-small-latest",  label: "Mistral Small" },
    { value: "open-mistral-nemo",     label: "Mistral Nemo" },
    { value: "codestral-latest",      label: "Codestral" },
  ],
  deepseek: [
    { value: "deepseek-chat",     label: "DeepSeek Chat (V3)" },
    { value: "deepseek-reasoner", label: "DeepSeek Reasoner (R1)" },
    { value: "deepseek-coder",    label: "DeepSeek Coder" },
  ],
};

const providerTheme = {
  gemini:   {
    dot:           "bg-indigo-500",
    badge:         "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
    activeSidebar: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
    activeText:    "text-indigo-300",
    panelGradient: "from-indigo-600 to-violet-600",
    saveGradient:  "from-indigo-500 to-violet-600",
    focusBorder:   "focus:border-indigo-500",
    accentBg:      "bg-gradient-to-br from-indigo-500 to-violet-600",
  },
  groq:     {
    dot:           "bg-amber-500",
    badge:         "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    activeSidebar: "bg-amber-500/15 border-amber-500/30 text-amber-300",
    activeText:    "text-amber-300",
    panelGradient: "from-amber-500 to-orange-600",
    saveGradient:  "from-amber-500 to-orange-600",
    focusBorder:   "focus:border-amber-500",
    accentBg:      "bg-gradient-to-br from-amber-500 to-orange-600",
  },
  openai:   {
    dot:           "bg-emerald-500",
    badge:         "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    activeSidebar: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    activeText:    "text-emerald-300",
    panelGradient: "from-emerald-600 to-teal-600",
    saveGradient:  "from-emerald-500 to-teal-600",
    focusBorder:   "focus:border-emerald-500",
    accentBg:      "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
  claude:   {
    dot:           "bg-violet-500",
    badge:         "bg-violet-500/15 text-violet-400 border border-violet-500/20",
    activeSidebar: "bg-violet-500/15 border-violet-500/30 text-violet-300",
    activeText:    "text-violet-300",
    panelGradient: "from-violet-600 to-purple-700",
    saveGradient:  "from-violet-500 to-purple-700",
    focusBorder:   "focus:border-violet-500",
    accentBg:      "bg-gradient-to-br from-violet-500 to-purple-700",
  },
  mistral:  {
    dot:           "bg-rose-500",
    badge:         "bg-rose-500/15 text-rose-400 border border-rose-500/20",
    activeSidebar: "bg-rose-500/15 border-rose-500/30 text-rose-300",
    activeText:    "text-rose-300",
    panelGradient: "from-rose-600 to-pink-700",
    saveGradient:  "from-rose-500 to-pink-700",
    focusBorder:   "focus:border-rose-500",
    accentBg:      "bg-gradient-to-br from-rose-500 to-pink-700",
  },
  deepseek: {
    dot:           "bg-sky-500",
    badge:         "bg-sky-500/15 text-sky-400 border border-sky-500/20",
    activeSidebar: "bg-sky-500/15 border-sky-500/30 text-sky-300",
    activeText:    "text-sky-300",
    panelGradient: "from-sky-600 to-blue-700",
    saveGradient:  "from-sky-500 to-blue-700",
    focusBorder:   "focus:border-sky-500",
    accentBg:      "bg-gradient-to-br from-sky-500 to-blue-700",
  },
};

function buildInitialState() {
  const perProvider = () =>
    Object.fromEntries(
      ALL_PROVIDERS.map(p => [
        p,
        { model: defaultModelMap[p], newKeys: "", keysDirty: false, list: [], testStatus: {} },
      ])
    );
  return { pdf: perProvider(), text: perProvider() };
}

function detectProvider(text) {
  if (!text) return null;
  const k = text.split(",")[0].trim();
  if (!k) return null;
  if (k.startsWith("sk-ant-"))                                                          return "claude";
  if (k.startsWith("gsk_"))                                                             return "groq";
  if (k.startsWith("sk-proj-") || k.startsWith("sk-svcacct-") || k.startsWith("sk-")) return "openai";
  if (k.startsWith("AIza") || k.startsWith("AQ."))                                     return "gemini";
  if (/^[a-zA-Z0-9]{32}$/.test(k))                                                     return "mistral";
  return null;
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────
function SuperAdminApiConfig() {
  const [aiState, setAiState]           = useState(buildInitialState);
  const [configSubTab, setConfigSubTab] = useState("pdf");
  const [activeProvider, setActiveProvider] = useState({ pdf: "gemini", text: "gemini" });
  const [pendingKeyDelete, setPendingKeyDelete] = useState(null);
  const [inlineTestStatus, setInlineTestStatus] = useState({});
  const [configLoading, setConfigLoading]   = useState(false);
  const [actionLoading, setActionLoading]   = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });

  useEffect(() => { refreshAllKeyLists(); }, []);

  const showModal = (type, title, message) =>
    setModal({ isOpen: true, type, title, message });

  const patchPP = (purpose, provider, patch) =>
    setAiState(prev => ({
      ...prev,
      [purpose]: { ...prev[purpose], [provider]: { ...prev[purpose][provider], ...patch } },
    }));

  const refreshAllKeyLists = async () => {
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
  };

  const refreshKeyList = async (purpose, provider) => {
    try {
      const r = await listAiKeys(purpose, provider);
      if (r.success) {
        patchPP(purpose, provider, {
          list:  r.keys  || [],
          model: r.model || defaultModelMap[provider],
        });
      }
    } catch (e) {
      console.error(`Failed to load ${purpose}/${provider} keys:`, e);
    }
  };

  const updateActiveCard = (field, value) => {
    const pur  = configSubTab;
    const prov = activeProvider[pur];
    const patch = { [field]: value };
    if (field === "model") patch.modelManuallyChanged = true;
    if (field === "newKeys") {
      patch.keysDirty = true;
      const detected = detectProvider(value);
      if (detected && detected !== prov) {
        setActiveProvider(prev => ({ ...prev, [pur]: detected }));
        patchPP(pur, detected, { newKeys: value, keysDirty: true });
        patchPP(pur, prov,     { newKeys: "",    keysDirty: false });
        return;
      }
    }
    patchPP(pur, prov, patch);
  };

  const handleSaveCard = async () => {
    const pur  = configSubTab;
    const prov = activeProvider[pur];
    const card = aiState[pur][prov];
    try {
      setConfigLoading(true);
      let added = 0, autoPickedModel = null, autoPickedSource = null;
      if (card.keysDirty && card.newKeys.trim()) {
        const explicitModel = card.modelManuallyChanged ? card.model : undefined;
        const r = await apiAddAiKeys(pur, prov, card.newKeys, explicitModel);
        added = r.added || 0;
        autoPickedModel  = r.autoPickedModel;
        autoPickedSource = r.autoPickedSource;
      } else {
        await apiSetProviderModel(pur, prov, card.model);
      }
      patchPP(pur, prov, { newKeys: "", keysDirty: false, modelManuallyChanged: false });
      await refreshKeyList(pur, prov);
      const purposeLabel   = pur  === "pdf" ? "PDF Reading" : "Text Generation";
      const providerLabel  = providerLabels[prov];
      let msg;
      if (card.keysDirty) {
        msg = `${added} key${added === 1 ? "" : "s"} added to ${providerLabel} (${purposeLabel}).`;
        if (autoPickedModel && autoPickedSource && autoPickedSource !== "default") {
          msg += ` Model auto-selected: ${autoPickedModel} (${autoPickedSource === "listed" ? "discovered from key's available models" : "verified via probe"}).`;
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
    patchPP(purpose, provider, { testStatus: { ...card.testStatus, [index]: { state: "testing" } } });
    try {
      const r = await testStoredAiKey(purpose, provider, index);
      const status = {
        state:                r.success ? "ok" : "fail",
        message:              r.message,
        latencyMs:            r.latencyMs,
        modelUsed:            r.modelUsed,
        autoSwitchedModelFrom: r.autoSwitchedModelFrom,
      };
      setAiState(prev => ({
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
      setAiState(prev => ({
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
      `This will permanently remove key #${index + 1} (${snippet}) from the ${providerLabels[provider]} pool under ${purpose === "pdf" ? "PDF Reading" : "Text Generation"}. This cannot be undone.`
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
    const pur  = configSubTab;
    const prov = activeProvider[pur];
    const card = aiState[pur][prov];
    const firstKey = (card.newKeys || "").split(",")[0]?.trim();
    if (!firstKey) { showModal("warning", "No key entered", "Paste a key in the textarea first."); return; }
    const id = `${pur}-${prov}`;
    setInlineTestStatus(s => ({ ...s, [id]: { state: "testing" } }));
    try {
      const r = await testInlineAiKey(prov, card.model, firstKey);
      setInlineTestStatus(s => ({
        ...s,
        [id]: { state: r.success ? "ok" : "fail", message: r.message, latencyMs: r.latencyMs },
      }));
    } catch (e) {
      setInlineTestStatus(s => ({
        ...s,
        [id]: { state: "fail", message: e?.response?.data?.message || e.message },
      }));
    }
  };

  // ── Derived values ────────────────────────────────────────
  const purpose  = configSubTab;
  const provider = activeProvider[purpose];
  const card     = aiState[purpose][provider];
  const pStyle   = providerTheme[provider];

  const totalPdfKeys  = ALL_PROVIDERS.reduce((s, p) => s + aiState.pdf[p].list.length,  0);
  const totalTextKeys = ALL_PROVIDERS.reduce((s, p) => s + aiState.text[p].list.length, 0);
  const totalKeys     = totalPdfKeys + totalTextKeys;
  const configuredCount = ALL_PROVIDERS.filter(p => aiState[purpose][p].list.length > 0).length;

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">

      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── Page Header ───────────────────────────────────── */}
        <div className="mb-8">
          <Link
            to="/super-admin/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-6 transition-colors duration-150 group"
          >
            <FaArrowLeft className="w-3 h-3 transition-transform duration-150 group-hover:-translate-x-0.5" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <FaKey className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Super Admin</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">API Key Configuration</h1>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  Manage AI provider API keys for PDF extraction and text generation.
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-3 flex-shrink-0">
              <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-3 sm:p-4 text-center min-w-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-white leading-none">{totalKeys}</div>
                <div className="text-xs text-slate-400 mt-0.5">Total keys</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-3 sm:p-4 text-center min-w-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-white leading-none">
                  {configuredCount}
                  <span className="text-sm font-normal text-slate-400">/6</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {purpose === "pdf" ? "PDF" : "Text"} providers
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ─────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar ─────────────────────────────────────── */}
          <aside className="lg:w-64 xl:w-72 flex-shrink-0">
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden sticky top-4">

              {/* Purpose tabs */}
              <div className="p-4 border-b border-slate-700/50">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1 mb-3">Purpose</p>
                <div className="space-y-1.5">
                  {[
                    { id: "pdf",  label: "PDF Reading",     Icon: FaFileAlt,   tKeys: totalPdfKeys  },
                    { id: "text", label: "Text Generation", Icon: FaPencilAlt, tKeys: totalTextKeys },
                  ].map(({ id, label, Icon, tKeys }) => {
                    const isActive = configSubTab === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setConfigSubTab(id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 min-h-[52px] cursor-pointer ${
                          isActive
                            ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-white shadow-sm"
                            : "hover:bg-slate-700/60 border border-transparent text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25" : "bg-slate-700/60"}`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{label}</div>
                          <div className={`text-xs mt-0.5 ${isActive ? "text-slate-400" : "text-slate-500"}`}>
                            {tKeys} key{tKeys !== 1 ? "s" : ""} stored
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Provider list */}
              <div className="p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1 mb-3">Providers</p>
                <div className="space-y-1">
                  {ALL_PROVIDERS.map(p => {
                    const isActive = p === provider;
                    const count    = aiState[purpose][p].list.length;
                    const t        = providerTheme[p];
                    return (
                      <button
                        key={p}
                        onClick={() => setActiveProvider(prev => ({ ...prev, [purpose]: p }))}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 min-h-[48px] cursor-pointer group ${
                          isActive
                            ? `${t.activeSidebar} bg-slate-700/40 border shadow-sm`
                            : "hover:bg-slate-700/40 border border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {/* Status dot */}
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${count > 0 ? t.dot : "bg-slate-600"}`} />

                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold truncate ${isActive ? t.activeText : ""}`}>
                            {providerLabels[p]}
                          </div>
                          <div className="text-xs text-slate-500 truncate font-mono leading-tight mt-0.5">
                            {aiState[purpose][p].model}
                          </div>
                        </div>

                        {/* Key count badge */}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 inline-flex items-center ${
                          count > 0 ? t.badge : "bg-slate-700/60 text-slate-500 border border-slate-600/40"
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main panel ──────────────────────────────────── */}
          <main className="flex-1 min-w-0 space-y-5">

            {/* ── Provider config card ── */}
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-200">

              {/* Provider gradient header */}
              <div className={`bg-gradient-to-r ${pStyle.panelGradient} px-6 py-5 text-white`}>
                <div className="flex items-center gap-4">
                  <span className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg">
                    <FaKey className="w-5 h-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white leading-tight">{providerLabels[provider]}</h2>
                    <p className="text-white/70 text-sm mt-0.5">
                      {purpose === "pdf" ? "PDF Reading" : "Text Generation"} &middot;{" "}
                      {card.list.length} key{card.list.length !== 1 ? "s" : ""} stored
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-semibold flex-shrink-0">
                    {purpose === "pdf" ? "PDF Reading" : "Text Generation"}
                  </span>
                </div>
              </div>

              {/* Config form */}
              <div className="p-6 space-y-6">

                {/* Info notice */}
                <div className="flex items-start gap-3 px-4 py-3.5 bg-slate-800/60 border border-slate-700/40 rounded-xl">
                  <FaInfoCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {purpose === "pdf"
                      ? "These keys are used when the system extracts content from uploaded PDFs."
                      : "These keys are used when the system generates questions, feedback, and answers."}
                    {" "}Multiple keys are load-balanced automatically. Keys are stored encrypted — never shown after saving.
                  </p>
                </div>

                {/* Model + stats row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">
                      Active Model
                    </label>
                    <select
                      value={card.model}
                      onChange={e => updateActiveCard("model", e.target.value)}
                      className={`w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-slate-600 ${pStyle.focusBorder} rounded-xl px-4 py-3 text-slate-200 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 appearance-none cursor-pointer min-h-[48px]`}
                    >
                      {(modelOptions[provider] || []).map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-slate-800 text-slate-200">{opt.label}</option>
                      ))}
                    </select>
                    <p className="text-slate-500 text-xs mt-1.5">
                      Applied to all keys in this provider pool.
                    </p>
                  </div>

                  <div>
                    <div className="text-slate-400 text-sm font-medium mb-1.5">
                      Pool Status
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700/40">
                        <div className="text-xl sm:text-2xl font-bold text-white leading-none">{card.list.length}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Stored keys</div>
                      </div>
                      <div className="flex-1 bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700/40">
                        <div className={`text-sm font-bold mt-1 ${card.list.length > 0 ? "text-emerald-400" : "text-slate-500"}`}>
                          {card.list.length > 0 ? "Active" : "Empty"}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">Pool state</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key textarea */}
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-1.5">
                    Add New API Key
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      comma-separate for bulk add
                    </span>
                  </label>
                  <textarea
                    value={card.newKeys}
                    onChange={e => updateActiveCard("newKeys", e.target.value)}
                    rows={3}
                    className={`w-full bg-slate-800/60 backdrop-blur-sm border rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm font-mono transition-all duration-200 focus:outline-none resize-none ${
                      card.keysDirty
                        ? "border-indigo-500 ring-2 ring-indigo-500/30"
                        : `border-slate-700/60 hover:border-slate-600 ${pStyle.focusBorder} focus:ring-2 focus:ring-indigo-500/30`
                    }`}
                    placeholder={`Paste your ${providerLabels[provider]} API key — a key with a recognizable prefix auto-switches the provider sidebar`}
                  />
                  {card.keysDirty ? (
                    <p className="text-xs font-medium text-indigo-400 mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      Key ready — will be added to the {providerLabels[provider]} pool on save.
                    </p>
                  ) : (
                    <p className="text-slate-500 text-xs mt-2">
                      Pasting a key with a known prefix (e.g. <code className="font-mono text-slate-400">sk-ant-</code>, <code className="font-mono text-slate-400">gsk_</code>) auto-detects and switches providers.
                    </p>
                  )}
                </div>

                {/* Test + Save */}
                <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-700/50">
                  {card.keysDirty && (
                    <>
                      <button
                        type="button"
                        onClick={handleTestInlineKey}
                        className="px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer inline-flex items-center gap-2 min-h-[44px]"
                      >
                        <FaFlask className="w-3.5 h-3.5" />
                        Test Key
                      </button>
                      {inlineTestStatus[`${purpose}-${provider}`] && (
                        <TestResultPill r={inlineTestStatus[`${purpose}-${provider}`]} />
                      )}
                    </>
                  )}
                  <button
                    onClick={handleSaveCard}
                    disabled={configLoading}
                    className={`px-5 py-3 bg-gradient-to-r ${pStyle.saveGradient} text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 inline-flex items-center gap-2 min-h-[44px] cursor-pointer`}
                  >
                    {configLoading ? (
                      <><LoadingSpinner size="sm" /> Saving…</>
                    ) : (
                      <>
                        <FaSave className="w-3.5 h-3.5" />
                        {card.keysDirty ? "Save Key" : "Save Model"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Stored keys card ── */}
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-200">

              {/* Card header */}
              <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-slate-700/60">
                    <FaKey className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200">
                      Stored Keys
                      <span className="ml-2 text-sm font-normal text-slate-500">
                        — {providerLabels[provider]}
                      </span>
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {purpose === "pdf" ? "PDF Reading" : "Text Generation"} pool · load-balanced automatically
                    </p>
                  </div>
                </div>
                {card.list.length > 0 && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${pStyle.badge}`}>
                    {card.list.length} key{card.list.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {card.list.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-5">
                    <FaKey className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No keys stored yet</h3>
                  <p className="text-slate-400 text-sm max-w-xs">
                    Add a {providerLabels[provider]} API key in the form above to populate this pool.
                  </p>
                </div>
              ) : (
                /* Keys table */
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/60">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50 w-12">#</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Masked Key</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50 hidden sm:table-cell">Model</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Status</th>
                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {card.list.map(k => {
                        const status    = card.testStatus[k.index];
                        const delLoading = actionLoading === `delete-key-${purpose}-${provider}-${k.index}`;
                        return (
                          <tr
                            key={k.index}
                            className="hover:bg-indigo-500/5 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                              {k.index + 1}
                            </td>
                            <td className="px-6 py-4 font-mono text-sm text-slate-300 max-w-[200px] truncate">
                              {k.snippet}
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-400 border border-slate-600/40 font-mono">
                                {card.model}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {status ? (
                                <TestResultPill r={status} />
                              ) : (
                                <span className="text-xs text-slate-500 italic">Untested</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleTestStoredKey(purpose, provider, k.index)}
                                  disabled={status?.state === "testing"}
                                  aria-label={`Test key ${k.index + 1}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/25 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
                                >
                                  {status?.state === "testing" ? (
                                    <><span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" /> Testing</>
                                  ) : (
                                    <><FaFlask className="w-3 h-3" /> Test</>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteStoredKey(purpose, provider, k.index, k.snippet)}
                                  disabled={delLoading}
                                  aria-label={`Delete key ${k.index + 1}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
                                >
                                  {delLoading ? (
                                    <><span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> Deleting</>
                                  ) : (
                                    <><FaTrash className="w-3 h-3" /> Delete</>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </main>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => { setModal({ ...modal, isOpen: false }); setPendingKeyDelete(null); }}
        onConfirm={pendingKeyDelete ? confirmDeleteKey : undefined}
        type={modal.type}
        title={modal.title}
        loading={
          pendingKeyDelete &&
          actionLoading === `delete-key-${pendingKeyDelete.purpose}-${pendingKeyDelete.provider}-${pendingKeyDelete.index}`
        }
        confirmText="Delete Key"
      >
        {modal.message}
      </Modal>
    </div>
  );
}

export default SuperAdminApiConfig;
