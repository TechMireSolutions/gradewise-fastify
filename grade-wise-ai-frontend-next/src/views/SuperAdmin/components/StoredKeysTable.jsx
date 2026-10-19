"use client";

import { cn } from "@/lib/cn.js";
import { accentPanel, card as uiCard, tableHead, tableRowHover } from "@/lib/ui.js";
import { FaKey, FaFlask, FaTrash } from "react-icons/fa";
import TestResultBadge from "./TestResultBadge.jsx";
import { providerLabels } from "../hooks/useSuperAdminApiConfig.js";

export default function StoredKeysTable({
  provider,
  purpose,
  card,
  pStyle,
  actionLoading,
  onTestStoredKey,
  onDeleteStoredKey,
}) {
  return (
    <div className={cn(uiCard, "shadow-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-200")}>
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-border bg-input flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-btn-secondary">
            <FaKey className="w-3.5 h-3.5 text-muted-foreground" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Stored Keys
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                — {providerLabels[provider]}
              </span>
            </h3>
            <p className="text-muted-foreground text-xs mt-0.5">
              {purpose === "pdf" ? "PDF Reading" : "Text Generation"} pool · load-balanced automatically
            </p>
          </div>
        </div>
        {card.list.length > 0 && (
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", pStyle.badge)}>
            {card.list.length} key{card.list.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {card.list.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className={cn(accentPanel, "w-16 h-16 rounded-2xl flex items-center justify-center mb-5")}>
            <FaKey className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No keys stored yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Add a {providerLabels[provider]} API key in the form above to populate this pool.
          </p>
        </div>
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
                  Masked Key
                </th>
                <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border hidden sm:table-cell">
                  Model
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
              {card.list.map((k) => {
                const status = card.testStatus[k.index];
                const delLoading = actionLoading === `delete-key-${purpose}-${provider}-${k.index}`;
                return (
                  <tr
                    key={k.index}
                    className={cn("hover:bg-indigo-500/5", tableRowHover, "transition-colors duration-150")}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {k.index + 1}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-secondary-foreground max-w-[200px] truncate">
                      {k.snippet}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-btn-secondary text-muted-foreground border border-border font-mono">
                        {card.model}
                      </span>
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
                          onClick={() => onTestStoredKey(purpose, provider, k.index)}
                          disabled={status?.state === "testing"}
                          aria-label={`Test key ${k.index + 1}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/25 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
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
                          onClick={() => onDeleteStoredKey(purpose, provider, k.index, k.snippet)}
                          disabled={delLoading}
                          aria-label={`Delete key ${k.index + 1}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
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
