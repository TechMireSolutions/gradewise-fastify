"use client";

import { cn } from "@/lib/cn.js";
import { card as uiCard, focusRing, statusTone } from "@/lib/ui.js";
import { FaFileAlt, FaPencilAlt, FaPlus } from "react-icons/fa";
import { Button } from "@/components/ui/index.js";
import { ALL_PROVIDERS, PROVIDER_META } from "../hooks/useSuperAdminApiConfig.js";

export default function ApiConfigSidebar({
  purpose,
  activeProvider,
  totalPdfKeys,
  totalTextKeys,
  onSelectPurpose,
  onSelectProvider,
  onOpenSettings,
  aiState,
}) {
  return (
    <aside className="lg:w-64 xl:w-72 flex-shrink-0">
      <div className={cn(uiCard, "shadow-2xl overflow-hidden sticky top-4")}>
        {/* Purpose tabs */}
        <div className="p-4">
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
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-start transition-all duration-200 min-h-[52px] cursor-pointer group",
                    isActive
                      ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/15 border border-indigo-500/30 text-foreground shadow-sm font-semibold"
                      : "hover:bg-btn-secondary border border-transparent text-muted-foreground hover:text-foreground",
                    focusRing
                  )}
                >
                  <span
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      isActive
                        ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25 text-white"
                        : "bg-btn-secondary text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
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

        {/* Provider Readiness for Active Purpose */}
        {aiState && (
          <div className="p-4 border-t border-border bg-surface-elevated/20">
            <div className="flex items-center justify-between px-1 mb-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                {purpose === "pdf" ? "PDF" : "Text"} Providers
              </p>
              <span className="text-[11px] font-mono text-muted-foreground">
                {ALL_PROVIDERS.filter((p) => (aiState?.[purpose]?.[p]?.list || []).length > 0).length}/6
              </span>
            </div>

            <div className="space-y-1">
              {ALL_PROVIDERS.map((p) => {
                const count = (aiState?.[purpose]?.[p]?.list || []).length;
                const meta = PROVIDER_META[p];
                const isConfigured = count > 0;
                const isActive = activeProvider === p;
                const activeModel = aiState?.[purpose]?.[p]?.model || meta?.defaultModel;

                return (
                  <div
                    key={p}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all duration-150 group text-start",
                      isActive
                        ? "bg-btn-secondary border border-border/80 text-foreground font-semibold"
                        : "hover:bg-btn-secondary/60 text-muted-foreground hover:text-foreground border border-transparent"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectProvider?.(p)}
                      className={cn("flex items-center gap-2 truncate min-w-0 flex-1 cursor-pointer text-start", focusRing)}
                      title={`Select ${meta?.name || p} (Active model: ${activeModel})`}
                    >
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0 transition-all",
                          isConfigured
                            ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                            : "bg-muted-foreground/30"
                        )}
                      />
                      <span className="truncate font-medium group-hover:text-foreground">
                        {meta?.name || p}
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5 flex-shrink-0 ms-1">
                      {isConfigured && activeModel && (
                        <span className="hidden xl:inline text-[10px] text-muted-foreground font-mono truncate max-w-[70px]">
                          {activeModel}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenSettings?.(p, isConfigured ? 4 : 1, purpose)}
                        aria-label={`Configure ${meta?.name || p}`}
                        className={cn(
                          "text-[10px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0 hover:scale-105 transition-all cursor-pointer",
                          isConfigured
                            ? cn("font-semibold", statusTone.success)
                            : "text-muted-foreground/60 hover:text-foreground hover:bg-input",
                          focusRing
                        )}
                        title={isConfigured ? `${count} active key(s) - Click to configure` : "Click to add key"}
                      >
                        {isConfigured ? `${count} key${count !== 1 ? "s" : ""}` : "+ Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add New LLM Action */}
        <div className="p-4 border-t border-border bg-input/40">
          <Button
            type="button"
            variant="primary"
            onClick={() => onOpenSettings?.(activeProvider)}
            className="w-full justify-center gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20"
          >
            <FaPlus className="w-3.5 h-3.5" />
            <span>Add New LLM</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
