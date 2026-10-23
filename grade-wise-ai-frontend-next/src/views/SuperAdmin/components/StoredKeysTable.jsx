"use client";

import { useState } from "react";
import { cn } from "@/lib/cn.js";
import { card as uiCard, tableHead, tableRowHover, focusRing, btn } from "@/lib/ui.js";
import { FaKey, FaFlask, FaTrash, FaPlus, FaWrench, FaCopy, FaCheck } from "react-icons/fa";
import { Button, EmptyState } from "@/components/ui/index.js";
import TestResultBadge from "./TestResultBadge.jsx";
import {
  ALL_PROVIDERS,
  providerLabels,
  providerTheme,
  defaultModelMap,
} from "../hooks/useSuperAdminApiConfig.js";

export default function StoredKeysTable({
  purpose,
  aiState,
  activeProvider,
  actionLoading,
  onSelectProvider,
  onOpenSettings,
  onTestStoredKey,
  onDeleteStoredKey,
}) {
  const [filterProvider, setFilterProvider] = useState("all");
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(null);

  // Collect all keys stored under the current purpose across all providers
  const allPurposeKeys = ALL_PROVIDERS.flatMap((prov) =>
    (aiState?.[purpose]?.[prov]?.list || []).map((k) => ({
      ...k,
      provider: prov,
      providerLabel: providerLabels[prov],
      model: aiState?.[purpose]?.[prov]?.model || defaultModelMap[prov],
      theme: providerTheme[prov],
      testStatus: aiState?.[purpose]?.[prov]?.testStatus?.[k.index],
    }))
  );

  const displayedKeys =
    filterProvider === "all"
      ? allPurposeKeys
      : allPurposeKeys.filter((k) => k.provider === filterProvider);

  const providersWithKeys = ALL_PROVIDERS.filter(
    (p) => (aiState?.[purpose]?.[p]?.list || []).length > 0
  );

  const handleTestAllKeys = async () => {
    if (displayedKeys.length === 0 || isTestingAll) return;
    setIsTestingAll(true);
    for (const k of displayedKeys) {
      await onTestStoredKey(purpose, k.provider, k.index);
    }
    setIsTestingAll(false);
  };

  const handleCopySnippet = (snippet) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(snippet);
      setCopiedSnippet(snippet);
      setTimeout(() => setCopiedSnippet(null), 1800);
    }
  };

  return (
    <div className={cn(uiCard, "shadow-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-200")}>
      {/* Card Header */}
      <div className="px-6 py-5 border-b border-border bg-input flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-btn-secondary text-foreground">
            <FaKey className="w-4 h-4 text-muted-foreground" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">
                Stored Keys
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-btn-secondary text-muted-foreground border border-border">
                {allPurposeKeys.length} key{allPurposeKeys.length !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">
              {purpose === "pdf" ? "PDF Reading" : "Text Generation"} pool · load-balanced automatically
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {displayedKeys.length > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleTestAllKeys}
              disabled={isTestingAll}
              className="gap-2 text-xs sm:text-sm font-semibold"
            >
              <FaFlask className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isTestingAll ? "Testing All…" : `Test All (${displayedKeys.length})`}</span>
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            onClick={() => onOpenSettings?.(activeProvider)}
            className="gap-2 text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20"
          >
            <FaPlus className="w-3.5 h-3.5" />
            <span>Add New LLM</span>
          </Button>
        </div>
      </div>

      {/* Provider Filter Tabs (shown when multiple providers have keys) */}
      {providersWithKeys.length > 1 && (
        <div className="px-6 py-3 border-b border-border bg-surface-elevated/30 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold me-1">Filter:</span>
          <button
            type="button"
            onClick={() => setFilterProvider("all")}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 min-h-[44px] cursor-pointer",
              filterProvider === "all"
                ? "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-semibold"
                : "bg-btn-secondary text-muted-foreground hover:text-foreground",
              focusRing
            )}
          >
            All ({allPurposeKeys.length})
          </button>
          {providersWithKeys.map((p) => {
            const count = (aiState?.[purpose]?.[p]?.list || []).length;
            const t = providerTheme[p];
            const isSelected = filterProvider === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setFilterProvider(p);
                  onSelectProvider?.(p);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 min-h-[44px] cursor-pointer",
                  isSelected
                    ? `${t.badge} shadow-sm font-semibold`
                    : "bg-btn-secondary text-muted-foreground hover:text-foreground border border-transparent",
                  focusRing
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", t.dot)} />
                <span>{providerLabels[p]}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {displayedKeys.length === 0 ? (
        <EmptyState
          icon={FaKey}
          title="No keys stored yet"
          description={`Add a new LLM to populate the ${purpose === "pdf" ? "PDF Reading" : "Text Generation"} pool.`}
          action={
            <Button
              type="button"
              variant="primary"
              onClick={() => onOpenSettings?.(activeProvider)}
              className="gap-2 shadow-md shadow-indigo-500/20"
            >
              <FaPlus className="w-3.5 h-3.5" />
              <span>Add New LLM</span>
            </Button>
          }
          className="border-0 bg-transparent py-16"
        />
      ) : (
        /* Table of Stored Keys */
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={tableHead}>
              <tr>
                <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border w-12">
                  #
                </th>
                <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                  Provider
                </th>
                <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                  Masked Key
                </th>
                <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border hidden sm:table-cell">
                  Active Model
                </th>
                <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                  Status
                </th>
                <th className="px-6 py-3.5 text-end text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayedKeys.map((k, idx) => {
                const status = k.testStatus;
                const delLoading =
                  actionLoading === `delete-key-${purpose}-${k.provider}-${k.index}`;
                return (
                  <tr
                    key={`${k.provider}-${k.index}`}
                    className={cn("hover:bg-indigo-500/5", tableRowHover, "transition-colors duration-150")}
                    style={{ contentVisibility: "auto", containIntrinsicSize: "auto 64px" }}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                          k.theme.badge
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", k.theme.dot)} />
                        {k.providerLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-secondary-foreground max-w-[220px]">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{k.snippet}</span>
                        <button
                          type="button"
                          onClick={() => handleCopySnippet(k.snippet)}
                          className={cn(
                            "p-1 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
                            focusRing
                          )}
                          title="Copy snippet"
                          aria-label="Copy snippet"
                        >
                          {copiedSnippet === k.snippet ? (
                            <FaCheck className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <FaCopy className="w-2.5 h-2.5 opacity-60 hover:opacity-100" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <button
                        type="button"
                        onClick={() => onOpenSettings?.(k.provider, 4, purpose)}
                        title="Click to change model for this provider"
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-btn-secondary hover:bg-indigo-500/15 text-muted-foreground hover:text-indigo-700 dark:hover:text-indigo-400 border border-border hover:border-indigo-500/30 font-mono transition-all duration-150 cursor-pointer group",
                          focusRing
                        )}
                      >
                        <span>{k.model}</span>
                        <FaWrench className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {status ? (
                        <TestResultBadge r={status} />
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Untested</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => onTestStoredKey(purpose, k.provider, k.index)}
                          disabled={status?.state === "testing"}
                          aria-label={`Test ${k.providerLabel} key ${k.index + 1}`}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/25 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] cursor-pointer",
                            focusRing
                          )}
                        >
                          {status?.state === "testing" ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" /> Testing
                            </>
                          ) : (
                            <>
                              <FaFlask className="w-3 h-3" /> Test
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onDeleteStoredKey(purpose, k.provider, k.index, k.snippet)
                          }
                          disabled={delLoading}
                          aria-label={`Delete ${k.providerLabel} key ${k.index + 1}`}
                          className={cn(
                            btn.danger,
                            "text-xs px-3 py-2 min-h-[44px]"
                          )}
                        >
                          {delLoading ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 animate-pulse" /> Deleting
                            </>
                          ) : (
                            <>
                              <FaTrash className="w-3 h-3" /> Delete
                            </>
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
  );
}
