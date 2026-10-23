"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn.js";
import { focusRing, iconBadge, statusTone, shape } from "@/lib/ui.js";
import {
  FaRobot,
  FaTimes,
  FaFileAlt,
  FaPencilAlt,
  FaServer,
  FaKey,
  FaMicrochip,
  FaCheck,
  FaArrowRight,
  FaArrowLeft,
  FaFlask,
  FaExternalLinkAlt,
  FaSave,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaSync,
  FaEdit,
} from "react-icons/fa";
import { Label, Textarea, Select, Input, LoadingSpinner, Button, StatusBadge } from "@/components/ui/index.js";
import TestResultBadge from "./TestResultBadge.jsx";
import { fetchProviderModels } from "@/features/ai-config/api.js";
import {
  ALL_PROVIDERS,
  PROVIDER_META,
  providerLabels,
  providerTheme,
  defaultModelMap,
  detectProvider,
} from "../hooks/useSuperAdminApiConfig.js";

const STEPS = [
  { step: 1, label: "Purpose", Icon: FaFileAlt },
  { step: 2, label: "Provider", Icon: FaServer },
  { step: 3, label: "API Key", Icon: FaKey },
  { step: 4, label: "Model", Icon: FaMicrochip },
];

function cleanRawKey(val) {
  if (!val) return "";
  let clean = val.trim();
  // Strip export KEY= or set KEY= prefixes if copied from terminal
  clean = clean.replace(/^(?:export\s+)?[A-Z0-9_]+\s*=\s*/i, "");
  // Strip surrounding quotes or backticks
  clean = clean.replace(/^["'`]|["'`]$/g, "");
  return clean.trim();
}

export default function AddNewLlmModal({
  isOpen,
  onClose,
  initialPurpose = "pdf",
  initialProvider = "gemini",
  initialStep = 1,
  aiState,
  configLoading,
  onSaveLlm,
  onSaveCard,
  onTestInlineKey,
  totalPdfKeys = 0,
  totalTextKeys = 0,
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [selectedPurpose, setSelectedPurpose] = useState(initialPurpose);
  const [selectedProvider, setSelectedProvider] = useState(initialProvider);
  const [apiKey, setApiKey] = useState("");
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    aiState?.[initialPurpose]?.[initialProvider]?.model || defaultModelMap[initialProvider] || ""
  );
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Dynamic Model Fetching state
  const [fetchedModels, setFetchedModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchModelsError, setFetchModelsError] = useState(null);
  const [isCustomModelMode, setIsCustomModelMode] = useState(false);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep || 1);
      setSelectedPurpose(initialPurpose || "pdf");
      setSelectedProvider(initialProvider || "gemini");
      setApiKey("");
      setShowKeySecret(false);
      setTestResult(null);
      setIsTesting(false);
      setFetchedModels([]);
      setFetchModelsError(null);
      setIsCustomModelMode(false);
      const prov = initialProvider || "gemini";
      const pur = initialPurpose || "pdf";
      setSelectedModel(aiState?.[pur]?.[prov]?.model || defaultModelMap[prov] || "");
    }
  }, [isOpen, initialPurpose, initialProvider, initialStep, aiState]);

  // When selected provider changes, reset models and errors
  const handleSelectProvider = (prov) => {
    setSelectedProvider(prov);
    const existingModel = aiState?.[selectedPurpose]?.[prov]?.model;
    setSelectedModel(existingModel || defaultModelMap[prov] || "");
    setFetchedModels([]);
    setFetchModelsError(null);
    setTestResult(null);
    setIsCustomModelMode(false);
  };

  const currentProviderMeta = PROVIDER_META[selectedProvider] || PROVIDER_META.gemini;
  const currentProviderTheme = providerTheme[selectedProvider] || providerTheme.gemini;
  const currentProviderKeys = aiState?.[selectedPurpose]?.[selectedProvider]?.list || [];
  const detectedKeyProvider = detectProvider(apiKey);

  const parsedKeys = apiKey
    .split(/[,\n]/)
    .map((k) => cleanRawKey(k))
    .filter(Boolean);

  const isKeyEmpty = parsedKeys.length === 0;
  const hasExistingKeys = currentProviderKeys.length > 0;
  const purposeLabel = selectedPurpose === "pdf" ? "PDF Reading" : "Text Generation";

  // Dynamic Live Model Fetching
  const loadLiveModels = useCallback(async () => {
    const keyToUse = parsedKeys[0];
    setIsFetchingModels(true);
    setFetchModelsError(null);
    try {
      const res = await fetchProviderModels({
        provider: selectedProvider,
        apiKey: keyToUse || undefined,
        purpose: selectedPurpose,
      });

      if (res.success && Array.isArray(res.models) && res.models.length > 0) {
        setFetchedModels(res.models);
        // If no model is selected yet, choose recommended or first model
        if (!selectedModel) {
          const defaultMod = res.models.find((m) => m.isDefault);
          setSelectedModel(defaultMod ? defaultMod.id : res.models[0].id);
        }
      } else {
        setFetchModelsError(
          res.message || `No models returned from ${providerLabels[selectedProvider]} API.`
        );
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        `Failed to fetch live models from ${providerLabels[selectedProvider]} API.`;
      setFetchModelsError(msg);
    } finally {
      setIsFetchingModels(false);
    }
  }, [selectedProvider, parsedKeys, selectedPurpose, selectedModel]);

  // Automatically fetch models when Step 4 becomes active
  useEffect(() => {
    if (isOpen && currentStep === 4) {
      loadLiveModels();
    }
  }, [isOpen, currentStep, selectedProvider]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRunInlineTest = async () => {
    const keyToTest = parsedKeys[0];
    if (!keyToTest) return;
    setIsTesting(true);
    setTestResult({ state: "testing" });
    try {
      const res = await onTestInlineKey(selectedProvider, selectedModel, keyToTest);
      setTestResult(res);
    } catch (err) {
      setTestResult({ state: "fail", message: err?.message || "Failed to test key" });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    const modelToSave = (selectedModel || "").trim() || defaultModelMap[selectedProvider] || "";
    const payload = {
      purpose: selectedPurpose,
      provider: selectedProvider,
      key: parsedKeys.join(","),
      model: modelToSave,
    };
    if (onSaveLlm) {
      await onSaveLlm(payload);
    } else if (onSaveCard) {
      await onSaveCard(payload);
    }
  }, [selectedPurpose, selectedProvider, parsedKeys, selectedModel, onSaveLlm, onSaveCard]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && !configLoading && !isTesting && !isFetchingModels) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (currentStep === 4) {
          if (!isKeyEmpty || hasExistingKeys) {
            handleSubmit();
          }
        } else if (currentStep < 4) {
          if (currentStep === 3 && isKeyEmpty && !hasExistingKeys) return;
          setCurrentStep((s) => s + 1);
        }
      }
    },
    [onClose, configLoading, isTesting, isFetchingModels, currentStep, isKeyEmpty, hasExistingKeys, handleSubmit]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto overscroll-contain flex items-center justify-center animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !configLoading && !isTesting && !isFetchingModels) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-llm-title"
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto overscroll-contain transition-all duration-300 relative my-auto flex flex-col"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-input/95 backdrop-blur-md px-6 py-5 border-b border-border flex items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-3.5 min-w-0">
            <span className={cn("p-2.5 rounded-xl shadow-md", iconBadge)}>
              <FaRobot className="w-5 h-5 text-white" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="add-llm-title" className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  Add New LLM
                </h2>
                <StatusBadge variant="info">
                  Step {currentStep} of 4
                </StatusBadge>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                Configure foundation model keys and active models for educational workflows
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={configLoading || isTesting || isFetchingModels}
            aria-label="Close dialog"
            className={cn(
              "p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-btn-secondary transition-all active:scale-95 disabled:opacity-50 cursor-pointer",
              focusRing
            )}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="px-6 py-4 border-b border-border bg-surface-elevated/40">
          <nav aria-label="Add LLM Progress" className="flex items-center justify-between max-w-2xl mx-auto">
            {STEPS.map(({ step, label, Icon }, idx) => {
              const isPassed = currentStep > step;
              const isCurrent = currentStep === step;
              const canJump = isPassed;

              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <button
                    type="button"
                    onClick={() => canJump && setCurrentStep(step)}
                    disabled={!canJump}
                    className={cn(
                      "flex items-center gap-2 text-start transition-all duration-200 group cursor-pointer",
                      !canJump && "cursor-default opacity-85",
                      focusRing
                    )}
                  >
                    <span
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm flex-shrink-0",
                        isCurrent
                          ? "bg-indigo-600 text-white ring-2 ring-indigo-500/40 ring-offset-2 ring-offset-card"
                          : isPassed
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-btn-secondary text-muted-foreground border border-border"
                      )}
                    >
                      {isPassed ? <FaCheck className="w-3.5 h-3.5" /> : step}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5">
                      <Icon
                        className={cn(
                          "w-3 h-3 flex-shrink-0",
                          isCurrent
                            ? "text-indigo-600 dark:text-indigo-400"
                            : isPassed
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-semibold block leading-tight",
                          isCurrent
                            ? "text-foreground"
                            : isPassed
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-muted-foreground"
                        )}
                      >
                        {label}
                      </span>
                    </span>
                  </button>

                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 mx-2 sm:mx-4 h-0.5 bg-border relative">
                      <div
                        className={cn(
                          "h-full transition-all duration-300",
                          isPassed ? "bg-emerald-500 w-full" : "w-0"
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Modal Body: Active Step Content */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
          {/* ========================================================================= */}
          {/* STEP 1: CHOOSE PURPOSE (PDF Reading vs Text Generation)                  */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Step 1 of 4
                </span>
                <h3 className="text-xl font-bold text-foreground mt-1 text-balance">
                  Choose API Purpose
                </h3>
                <p className="text-sm text-muted-foreground mt-1 text-pretty">
                  Select the primary educational workload where this LLM will be utilized in GradeWise AI.
                </p>
              </div>

              <div role="radiogroup" aria-label="API Purpose Selection" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PDF Reading Card */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedPurpose === "pdf"}
                  onClick={() => setSelectedPurpose("pdf")}
                  className={cn(
                    "p-5 rounded-xl border text-start transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[170px] relative group",
                    selectedPurpose === "pdf"
                      ? "bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border-indigo-500 shadow-md ring-2 ring-indigo-500/30"
                      : "bg-surface-elevated hover:bg-btn-secondary border-border hover:border-border/80",
                    focusRing
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "p-3 rounded-xl flex items-center justify-center transition-all",
                        selectedPurpose === "pdf"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                          : "bg-btn-secondary text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      <FaFileAlt className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-btn-secondary border border-border text-muted-foreground">
                      {totalPdfKeys} keys stored
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-foreground">PDF Reading & OCR</h4>
                      {selectedPurpose === "pdf" && (
                        <FaCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-pretty">
                      Extracts course syllabi, textbook passages, lecture notes, tables, and exam references into structured context.
                    </p>
                  </div>
                </button>

                {/* Text Generation Card */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedPurpose === "text"}
                  onClick={() => setSelectedPurpose("text")}
                  className={cn(
                    "p-5 rounded-xl border text-start transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[170px] relative group",
                    selectedPurpose === "text"
                      ? "bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border-indigo-500 shadow-md ring-2 ring-indigo-500/30"
                      : "bg-surface-elevated hover:bg-btn-secondary border-border hover:border-border/80",
                    focusRing
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "p-3 rounded-xl flex items-center justify-center transition-all",
                        selectedPurpose === "text"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                          : "bg-btn-secondary text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      <FaPencilAlt className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-btn-secondary border border-border text-muted-foreground">
                      {totalTextKeys} keys stored
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-foreground">Text Generation & Evaluation</h4>
                      {selectedPurpose === "text" && (
                        <FaCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-pretty">
                      Generates timed exams (MCQ, Short, Matching), performs automated grading, and produces XAI justifications.
                    </p>
                  </div>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-input border border-border text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
                <span>
                  Currently selected: <strong className="text-foreground">{purposeLabel}</strong>. Both pools operate with independent key rotation.
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: SELECT PROVIDER (All 6 Updated Providers)                         */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Step 2 of 4 · {purposeLabel}
                </span>
                <h3 className="text-xl font-bold text-foreground mt-1 text-balance">
                  Select AI Provider
                </h3>
                <p className="text-sm text-muted-foreground mt-1 text-pretty">
                  Choose the model family to configure for {purposeLabel}. All 6 providers are supported with load-balancing.
                </p>
              </div>

              <div role="radiogroup" aria-label="AI Provider Selection" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {ALL_PROVIDERS.map((prov) => {
                  const meta = PROVIDER_META[prov] || PROVIDER_META.gemini;
                  const theme = providerTheme[prov] || providerTheme.gemini;
                  const isSelected = selectedProvider === prov;
                  const count = aiState?.[selectedPurpose]?.[prov]?.list?.length || 0;

                  return (
                    <button
                      key={prov}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleSelectProvider(prov)}
                      className={cn(
                        "p-4 rounded-xl border text-start transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[148px] relative group",
                        isSelected
                          ? "bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border-indigo-500 shadow-md ring-2 ring-indigo-500/30"
                          : "bg-surface-elevated hover:bg-btn-secondary border-border hover:border-border/80",
                        focusRing
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", theme.dot)} />
                          <span className="font-bold text-sm text-foreground">{meta.name}</span>
                        </div>
                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shadow-sm flex-shrink-0">
                            <FaCheck />
                          </span>
                        ) : count > 0 ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-btn-secondary border border-border text-muted-foreground flex-shrink-0">
                            {count} active
                          </span>
                        ) : null}
                      </div>

                      <div className="my-2">
                        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block mb-1", theme.badge)}>
                          {meta.badge}
                        </span>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed text-pretty">
                          {meta.tagline}
                        </p>
                      </div>

                      <div className="text-[10px] text-muted-foreground font-mono truncate border-t border-border/40 pt-1.5 mt-auto">
                        Provider: {prov}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: ADD API KEY (Input, Prefix detection & inline test)              */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                    Step 3 of 4
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", currentProviderTheme.badge)}>
                    {currentProviderMeta.name}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground font-medium">{purposeLabel}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground text-balance">
                  Enter {currentProviderMeta.name} API Key
                </h3>
                <p className="text-sm text-muted-foreground mt-1 text-pretty">
                  Keys are securely encrypted at rest using AES-256. When you enter your key, we will automatically fetch all available models directly from {currentProviderMeta.name}&apos;s live API.
                </p>
              </div>

              {/* Status if provider already has keys */}
              {hasExistingKeys && (
                <div className="p-3.5 rounded-xl bg-surface-elevated border border-border flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span>
                      <strong>{currentProviderKeys.length}</strong> active key{currentProviderKeys.length !== 1 ? "s" : ""} already in this pool.
                    </span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">
                    You can add more keys or proceed directly to model selection.
                  </span>
                </div>
              )}

              {/* Key Input & Security Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="add-llm-api-key" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    API Key Secret
                  </Label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowKeySecret((s) => !s)}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
                        focusRing
                      )}
                      aria-label={showKeySecret ? "Hide API key" : "Show API key"}
                    >
                      {showKeySecret ? <FaEyeSlash className="w-3 h-3" /> : <FaEye className="w-3 h-3" />}
                      <span>{showKeySecret ? "Hide key" : "Show key"}</span>
                    </button>
                    <a
                      href={currentProviderMeta.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer",
                        focusRing
                      )}
                    >
                      <span>Get Key</span>
                      <FaExternalLinkAlt className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                <Textarea
                  id="add-llm-api-key"
                  rows={3}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder={`Paste your ${currentProviderMeta.name} API key (e.g. ${currentProviderMeta.keyPlaceholder})`}
                  className={cn(
                    "font-mono text-sm leading-relaxed transition-all",
                    !showKeySecret && "[-webkit-text-security:disc]",
                    apiKey && "border-indigo-500 ring-2 ring-indigo-500/20"
                  )}
                  autoFocus
                />

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <p className="text-muted-foreground">
                    Format: <code className="font-mono text-muted-foreground">{currentProviderMeta.keyPrefix}</code>. Comma-separated for bulk keys.
                  </p>
                  {parsedKeys.length > 1 && (
                    <StatusBadge variant="info">
                      {parsedKeys.length} keys detected for rotation
                    </StatusBadge>
                  )}
                </div>
              </div>

              {/* Real-time Prefix Auto-Detection Banner */}
              {detectedKeyProvider && (
                <div className="animate-fade-in">
                  {detectedKeyProvider === selectedProvider ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-400">
                      <FaCheck className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        Recognized valid <strong className="text-foreground">{currentProviderMeta.name}</strong> key format.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-700 dark:text-amber-400">
                      <div className="flex items-center gap-2">
                        <FaExclamationTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          This key looks like an <strong className="text-foreground">{providerLabels[detectedKeyProvider]}</strong> key.
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleSelectProvider(detectedKeyProvider)}
                        className="text-xs py-1 px-3 min-h-[32px] w-fit shadow-none bg-amber-500/20 hover:bg-amber-500/30 text-foreground border-amber-500/40"
                      >
                        Switch to {providerLabels[detectedKeyProvider]}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Inline Test Action & Status */}
              <div className="p-4 rounded-xl bg-surface-elevated/50 border border-border space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Pre-Save Connection Test
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Verify credentials against the provider API before proceeding to model selection.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRunInlineTest}
                    disabled={isKeyEmpty || isTesting || configLoading}
                    className="gap-2 min-h-[40px] text-xs font-semibold flex-shrink-0"
                  >
                    {isTesting ? (
                      <>
                        <LoadingSpinner size="sm" /> Testing…
                      </>
                    ) : (
                      <>
                        <FaFlask className="w-3.5 h-3.5 text-indigo-500" /> Test Connection
                      </>
                    )}
                  </Button>
                </div>

                {testResult && (
                  <div className="pt-2 border-t border-border">
                    <TestResultBadge r={testResult} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: DYNAMIC LIVE MODEL FETCHING & SELECTION                           */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                    Step 4 of 4
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", currentProviderTheme.badge)}>
                    {currentProviderMeta.name}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground font-medium">{purposeLabel}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xl font-bold text-foreground text-balance">
                    Select Model for {currentProviderMeta.name}
                  </h3>
                  <button
                    type="button"
                    onClick={loadLiveModels}
                    disabled={isFetchingModels}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer disabled:opacity-50",
                      focusRing
                    )}
                  >
                    <FaSync className={cn("w-3 h-3", isFetchingModels && "animate-spin")} />
                    <span>{isFetchingModels ? "Fetching…" : "Re-fetch live models"}</span>
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1 text-pretty">
                  Models are dynamically fetched live from {currentProviderMeta.name}&apos;s API using your credentials.
                </p>
              </div>

              {/* Dynamic Loading State */}
              {isFetchingModels && (
                <div className="p-8 rounded-xl bg-surface-elevated/50 border border-border flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
                  <LoadingSpinner size="lg" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground">
                      Connecting to {currentProviderMeta.name} API…
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Querying available models with your authorized credentials.
                    </p>
                  </div>
                </div>
              )}

              {/* Fetch Error & Manual Input Fallback */}
              {!isFetchingModels && fetchModelsError && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-400 space-y-2.5 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FaExclamationTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{fetchModelsError}</span>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={loadLiveModels}
                      className="text-xs py-1 px-3 min-h-[32px] w-fit shadow-none bg-amber-500/20 hover:bg-amber-500/30 text-foreground border-amber-500/40"
                    >
                      <FaSync className="w-3 h-3" /> Retry Fetching
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    You can type any model name supported by {currentProviderMeta.name} manually below.
                  </p>
                </div>
              )}

              {/* Live Fetched Models Available */}
              {!isFetchingModels && fetchedModels.length > 0 && !isCustomModelMode && (
                <div className="space-y-4 animate-fade-in">
                  {/* Live Success Banner */}
                  <div className={cn("p-3 border text-xs flex items-center justify-between gap-2", statusTone.success, shape.panel)}>
                    <span className="flex items-center gap-2 font-semibold truncate">
                      <FaCheck className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        Discovered <strong>{fetchedModels.length}</strong> available models live from {currentProviderMeta.name} API
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCustomModelMode(true)}
                      className={cn(
                        "inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer flex-shrink-0",
                        focusRing
                      )}
                    >
                      <FaEdit className="w-2.5 h-2.5" />
                      <span>Enter custom name</span>
                    </button>
                  </div>

                  {/* Top 3 Quick-Pick Cards */}
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground block">
                      Top Discovered Models
                    </Label>
                    <div role="radiogroup" aria-label="Top Discovered Models" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {fetchedModels.slice(0, 3).map((m) => {
                        const isCur = selectedModel === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            role="radio"
                            aria-checked={isCur}
                            onClick={() => setSelectedModel(m.id)}
                            className={cn(
                              "p-3.5 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between min-h-[110px] group",
                              isCur
                                ? "bg-indigo-500/15 border-indigo-500 ring-2 ring-indigo-500/30 shadow-sm"
                                : "bg-surface-elevated hover:bg-btn-secondary border-border hover:border-border/80",
                              focusRing
                            )}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={cn(
                                  "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                                  isCur
                                    ? "bg-indigo-600 text-white"
                                    : "bg-btn-secondary text-muted-foreground border border-border"
                                )}
                              >
                                {m.isDefault ? "Recommended" : "Discovered"}
                              </span>
                              {isCur && <FaCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                            </div>
                            <div className="mt-2">
                              <div className="font-mono font-bold text-xs text-foreground truncate">{m.id}</div>
                              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-tight text-pretty">
                                {m.name || m.description || m.id}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Full Select Menu with All Discovered Models */}
                  <div className="bg-surface-elevated/60 border border-border rounded-xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="add-llm-model-select" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        All Live Models ({fetchedModels.length} available)
                      </Label>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-btn-secondary border border-border text-foreground font-semibold">
                        {selectedModel}
                      </span>
                    </div>

                    <Select
                      id="add-llm-model-select"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      disabled={configLoading}
                      className="font-medium font-mono text-sm"
                    >
                      {fetchedModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name && m.name !== m.id ? `${m.name} (${m.id})` : m.id}
                        </option>
                      ))}
                      {selectedModel && !fetchedModels.some((m) => m.id === selectedModel) && (
                        <option value={selectedModel}>
                          {selectedModel} (Active Configured Model)
                        </option>
                      )}
                    </Select>

                    <p className="text-xs text-muted-foreground">
                      The chosen model will be activated in PostgreSQL as <code className="font-mono text-muted-foreground">{selectedPurpose.toUpperCase()}_{selectedProvider.toUpperCase()}_MODEL</code>.
                    </p>
                  </div>
                </div>
              )}

              {/* Custom Model Input Mode (or fallback when models couldn't be fetched) */}
              {(!isFetchingModels && (isCustomModelMode || fetchedModels.length === 0)) && (
                <div className="bg-surface-elevated/60 border border-border rounded-xl p-4 sm:p-5 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="custom-model-input" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                      Model Identifier (Live API / Custom)
                    </Label>
                    {fetchedModels.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsCustomModelMode(false)}
                        className={cn("text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer", focusRing)}
                      >
                        Back to fetched list
                      </button>
                    )}
                  </div>

                  <Input
                    id="custom-model-input"
                    type="text"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    placeholder={`e.g. ${defaultModelMap[selectedProvider] || "model-name"}`}
                    className="font-mono text-sm"
                    autoFocus
                  />

                  <p className="text-xs text-muted-foreground">
                    Enter any valid model ID supported by your {currentProviderMeta.name} account (including fine-tuned models).
                  </p>
                </div>
              )}

              {/* Review Summary Box */}
              <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <FaCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  Configuration Review
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <span className="text-muted-foreground block text-[11px]">API Purpose</span>
                    <strong className="text-foreground text-sm font-semibold">{purposeLabel}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border">
                    <span className="text-muted-foreground block text-[11px]">AI Provider</span>
                    <strong className="text-foreground text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                      <span className={cn("w-2 h-2 rounded-full", currentProviderTheme.dot)} />
                      {currentProviderMeta.name}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border">
                    <span className="text-muted-foreground block text-[11px]">API Key Status</span>
                    <strong className="text-foreground text-sm font-semibold truncate block mt-0.5">
                      {!isKeyEmpty ? (
                        <span className="font-mono text-emerald-700 dark:text-emerald-400">
                          ••••{parsedKeys[0].slice(-4)} ({parsedKeys.length} new key{parsedKeys.length !== 1 ? "s" : ""} ready)
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Using existing pool ({currentProviderKeys.length} key{currentProviderKeys.length !== 1 ? "s" : ""})
                        </span>
                      )}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border">
                    <span className="text-muted-foreground block text-[11px]">Active Model</span>
                    <strong className="font-mono text-foreground text-sm font-semibold truncate block mt-0.5">
                      {selectedModel || "(none selected)"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer Controls */}
        <div className="sticky bottom-0 bg-input/95 backdrop-blur-md px-6 py-4 border-t border-border flex flex-wrap items-center justify-between gap-3 z-20">
          <div>
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                disabled={configLoading || isTesting || isFetchingModels}
                className="gap-2 min-h-[44px]"
              >
                <FaArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={configLoading || isTesting || isFetchingModels}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  if (currentStep === 1) setCurrentStep(2);
                  else if (currentStep === 2) setCurrentStep(3);
                  else if (currentStep === 3) setCurrentStep(4);
                }}
                disabled={
                  (currentStep === 3 && isKeyEmpty && !hasExistingKeys) ||
                  configLoading ||
                  isTesting ||
                  isFetchingModels
                }
                className="gap-2 min-h-[44px] shadow-md shadow-indigo-500/20"
              >
                <span>
                  {currentStep === 1
                    ? "Continue to Provider"
                    : currentStep === 2
                    ? "Continue to API Key"
                    : isKeyEmpty && hasExistingKeys
                    ? "Skip to Live Models"
                    : "Continue to Live Models"}
                </span>
                <FaArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                disabled={
                  configLoading ||
                  isTesting ||
                  isFetchingModels ||
                  !selectedModel ||
                  (isKeyEmpty && !hasExistingKeys)
                }
                className="gap-2 min-h-[44px] shadow-md shadow-indigo-500/20"
              >
                {configLoading ? (
                  <>
                    <LoadingSpinner size="sm" /> Activating LLM…
                  </>
                ) : (
                  <>
                    <FaSave className="w-3.5 h-3.5" /> Save & Activate LLM
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
