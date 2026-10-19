"use client";

import { cn } from "@/lib/cn.js";
import { card as uiCard } from "@/lib/ui.js";
import { FaFileAlt, FaPencilAlt } from "react-icons/fa";
import { ALL_PROVIDERS, providerLabels, providerTheme } from "../hooks/useSuperAdminApiConfig.js";

export default function ApiConfigSidebar({
  purpose,
  activeProvider,
  aiState,
  totalPdfKeys,
  totalTextKeys,
  onSelectPurpose,
  onSelectProvider,
}) {
  return (
    <aside className="lg:w-64 xl:w-72 flex-shrink-0">
      <div className={cn(uiCard, "shadow-2xl overflow-hidden sticky top-4")}>
        {/* Purpose tabs */}
        <div className="p-4 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-3">
            Purpose
          </p>
          <div className="space-y-1.5">
            {[
              { id: "pdf", label: "PDF Reading", Icon: FaFileAlt, tKeys: totalPdfKeys },
              { id: "text", label: "Text Generation", Icon: FaPencilAlt, tKeys: totalTextKeys },
            ].map(({ id, label, Icon, tKeys }) => {
              const isActive = purpose === id;
              return (
                <button
                  key={id}
                  onClick={() => onSelectPurpose(id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 min-h-[52px] cursor-pointer",
                    isActive
                      ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-white shadow-sm"
                      : "hover:bg-btn-secondary border border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      isActive
                        ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25"
                        : "bg-btn-secondary"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
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
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-3">
            Providers
          </p>
          <div className="space-y-1">
            {ALL_PROVIDERS.map((p) => {
              const isActive = p === activeProvider;
              const count = aiState[purpose][p].list.length;
              const t = providerTheme[p];
              return (
                <button
                  key={p}
                  onClick={() => onSelectProvider(p)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 min-h-[48px] cursor-pointer group",
                    isActive
                      ? `${t.activeSidebar} bg-slate-700/40 border shadow-sm`
                      : "hover:bg-surface-elevated/40 border border-transparent text-muted-foreground hover:text-secondary-foreground"
                  )}
                >
                  {/* Status dot */}
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      count > 0 ? t.dot : "bg-slate-600"
                    )}
                  />

                  <div className="flex-1 min-w-0">
                    <div className={cn("text-sm font-semibold truncate", isActive && t.activeText)}>
                      {providerLabels[p]}
                    </div>
                    <div className="text-xs text-muted-foreground truncate font-mono leading-tight mt-0.5">
                      {aiState[purpose][p].model}
                    </div>
                  </div>

                  {/* Key count badge */}
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 inline-flex items-center",
                      count > 0
                        ? t.badge
                        : "bg-btn-secondary text-muted-foreground border border-border"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
