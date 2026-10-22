"use client";

import { cn } from "@/lib/cn.js";
import { card as uiCard } from "@/lib/ui.js";
import { FaFileAlt, FaPencilAlt, FaWrench } from "react-icons/fa";
import { providerLabels } from "../hooks/useSuperAdminApiConfig.js";

export default function ApiConfigSidebar({
  purpose,
  activeProvider,
  totalPdfKeys,
  totalTextKeys,
  onSelectPurpose,
  onOpenSettings,
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
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-start transition-all duration-200 min-h-[52px] cursor-pointer",
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

        {/* Quick Settings Action */}
        <div className="p-4 border-t border-border bg-input/40">
          <button
            type="button"
            onClick={() => onOpenSettings?.(activeProvider)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <FaWrench className="w-3.5 h-3.5" />
            <span>{providerLabels[activeProvider]} Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
