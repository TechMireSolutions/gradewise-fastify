"use client";

import { cn } from "@/lib/cn.js";
import { Label, Textarea, LoadingSpinner } from "@/components/ui";
import { FaFlask, FaSave } from "react-icons/fa";
import TestResultBadge from "./TestResultBadge.jsx";
import { providerLabels } from "../hooks/useSuperAdminApiConfig.js";

export default function AddKeysSection({
  provider,
  purpose,
  card,
  pStyle,
  configLoading,
  inlineTestStatus,
  onUpdateCard,
  onTestInlineKey,
  onSaveCard,
}) {
  const inlineStatus = inlineTestStatus[`${purpose}-${provider}`];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="new-keys">
          Add New API Key
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            comma-separate for bulk addition
          </span>
        </Label>
        <Textarea
          id="new-keys"
          value={card.newKeys}
          onChange={(e) => onUpdateCard("newKeys", e.target.value)}
          rows={3}
          className={cn(
            "font-mono",
            card.keysDirty && "border-indigo-500 ring-2 ring-indigo-500/30"
          )}
          placeholder={`Paste your ${providerLabels[provider]} API key — a key with a recognizable prefix auto-switches the provider`}
        />
        {card.keysDirty ? (
          <p className="text-xs font-medium text-indigo-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Key ready — will be added to the {providerLabels[provider]} pool on save.
          </p>
        ) : (
          <p className="text-muted-foreground text-xs mt-2">
            Pasting a key with a known prefix (e.g. <code className="font-mono text-muted-foreground">sk-ant-</code>, <code className="font-mono text-muted-foreground">gsk_</code>) auto-detects and switches providers.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
        {card.keysDirty && (
          <>
            <button
              type="button"
              onClick={onTestInlineKey}
              className={cn(
                "px-4 py-2.5 bg-btn-secondary hover:bg-surface-elevated border border-border text-secondary-foreground hover:text-foreground rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer inline-flex items-center gap-2 min-h-[44px]"
              )}
            >
              <FaFlask className="w-3.5 h-3.5" />
              Test Key
            </button>
            {inlineStatus && <TestResultBadge r={inlineStatus} />}
          </>
        )}

        <button
          type="button"
          onClick={onSaveCard}
          disabled={configLoading}
          className={cn(
            "px-5 py-3 text-white rounded-xl font-semibold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 inline-flex items-center gap-2 min-h-[44px] cursor-pointer",
            `bg-gradient-to-r ${pStyle.saveGradient}`
          )}
        >
          {configLoading ? (
            <>
              <LoadingSpinner size="sm" /> Saving…
            </>
          ) : (
            <>
              <FaSave className="w-3.5 h-3.5" />
              {card.keysDirty ? `Add Key to Pool` : "Save Model Setting"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
