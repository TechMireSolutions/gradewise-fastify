"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/cn.js";
import { focusRing } from "@/lib/ui.js";
import { FaWrench, FaTimes, FaFlask, FaSave } from "react-icons/fa";
import { Label, Textarea, LoadingSpinner, Button } from "@/components/ui/index.js";
import ModelSelector from "./ModelSelector.jsx";
import TestResultBadge from "./TestResultBadge.jsx";
import {
  ALL_PROVIDERS,
  providerLabels,
  providerTheme,
} from "../hooks/useSuperAdminApiConfig.js";

export default function ProviderSettingsModal({
  isOpen,
  onClose,
  purpose,
  provider,
  card,
  pStyle,
  aiState,
  configLoading,
  inlineTestStatus,
  onChangeProvider,
  onUpdateCard,
  onTestInlineKey,
  onSaveCard,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && !configLoading) {
        onClose();
      }
    },
    [onClose, configLoading]
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

  const inlineStatus = inlineTestStatus[`${purpose}-${provider}`];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto overscroll-contain flex items-center justify-center animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !configLoading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="provider-settings-title"
        className="bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto overscroll-contain transition-all duration-300 relative my-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-input/95 backdrop-blur-md px-6 py-5 border-b border-border flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <span className={cn("p-2.5 rounded-xl text-white shadow-md", pStyle.accentBg)}>
              <FaWrench className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="provider-settings-title" className="text-xl font-bold text-foreground truncate">
                  {providerLabels[provider]} Settings
                </h2>
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0", pStyle.badge)}>
                  {card.list.length} key{card.list.length !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {purpose === "pdf" ? "PDF Extraction pool" : "Question Generation & Evaluation pool"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={configLoading}
            aria-label="Close settings"
            className={cn(
              "p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-btn-secondary transition-all active:scale-95 disabled:opacity-50 cursor-pointer",
              focusRing
            )}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Provider Switcher Pills */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block font-semibold uppercase tracking-wider">
              Select Provider
            </Label>
            <div className="flex flex-wrap gap-2">
              {ALL_PROVIDERS.map((p) => {
                const isSelected = p === provider;
                const count = aiState?.[purpose]?.[p]?.list?.length || 0;
                const t = providerTheme[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onChangeProvider(p)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 cursor-pointer active:scale-95",
                      isSelected
                        ? `${t.activeSidebar} bg-btn-secondary border-indigo-500/50 shadow-sm font-semibold`
                        : "border-border hover:bg-btn-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full", count > 0 ? t.dot : "bg-muted-foreground/40")} />
                    <span>{providerLabels[p]}</span>
                    {count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-btn-secondary border border-border">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Selector */}
          <div className="bg-surface-elevated/40 border border-border rounded-2xl p-4 sm:p-5 space-y-3">
            <ModelSelector
              provider={provider}
              model={card.model}
              onChangeModel={(val) => onUpdateCard("model", val)}
              disabled={configLoading}
            />
          </div>

          {/* Add New Key Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="modal-new-keys">
                Add New API Key
                <span className="ms-2 text-xs font-normal text-muted-foreground">
                  comma-separate for bulk addition
                </span>
              </Label>
              <Textarea
                id="modal-new-keys"
                value={card.newKeys}
                onChange={(e) => onUpdateCard("newKeys", e.target.value)}
                rows={3}
                className={cn(
                  "font-mono mt-1.5",
                  card.keysDirty && "border-indigo-500 ring-2 ring-indigo-500/30"
                )}
                placeholder={`Paste your ${providerLabels[provider]} API key — a key with a recognizable prefix auto-detects provider & model`}
              />

              {/* Real-time Auto-Detection Notice */}
              {card.detectedInfo ? (
                <div className="mt-2.5 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center gap-2 text-xs font-medium text-indigo-700 dark:text-indigo-400 animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse flex-shrink-0" />
                  <span>
                    Auto-detected: <strong className="text-foreground">{providerLabels[card.detectedInfo.provider]}</strong> · Model: <strong className="font-mono text-foreground">{card.detectedInfo.model}</strong>
                  </span>
                </div>
              ) : card.keysDirty ? (
                <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                  Key ready — will be saved to the {providerLabels[provider]} pool.
                </p>
              ) : (
                <p className="text-muted-foreground text-xs mt-2">
                  Pasting a key with a recognized prefix (e.g. <code className="font-mono text-muted-foreground">AIza...</code>, <code className="font-mono text-muted-foreground">gsk_...</code>, <code className="font-mono text-muted-foreground">sk-ant-...</code>) auto-detects provider and model.
                </p>
              )}
            </div>

            {/* Inline test status */}
            {card.keysDirty && inlineStatus && (
              <div className="pt-2">
                <TestResultBadge r={inlineStatus} />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="sticky bottom-0 bg-input/95 backdrop-blur-md px-6 py-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <div>
            {card.keysDirty && (
              <Button
                type="button"
                variant="secondary"
                onClick={onTestInlineKey}
                disabled={configLoading}
                className="gap-2 min-h-[44px]"
              >
                <FaFlask className="w-3.5 h-3.5" />
                Test Key
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={configLoading}
              className="min-h-[44px]"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={onSaveCard}
              disabled={configLoading}
              className="gap-2 min-h-[44px]"
            >
              {configLoading ? (
                <>
                  <LoadingSpinner size="sm" /> Saving…
                </>
              ) : (
                <>
                  <FaSave className="w-3.5 h-3.5" />
                  {card.keysDirty ? "Add Key to Pool" : "Save Model Setting"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
