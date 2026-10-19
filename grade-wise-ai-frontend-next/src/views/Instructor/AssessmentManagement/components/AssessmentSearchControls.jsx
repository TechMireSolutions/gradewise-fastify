"use client";

import { cn } from "@/lib/cn.js";
import { card, focusRing } from "@/lib/ui.js";
import SearchField from "@/components/ui/SearchField.jsx";
import { FaList, FaThLarge } from "react-icons/fa";

export default function AssessmentSearchControls({
  searchTerm = "",
  onSearchChange,
  viewMode = "table",
  onViewModeChange,
  placeholder = "Search assessments by title...",
}) {
  return (
    <div className={cn(card, "shadow-xl mb-6 p-4 sm:p-5")}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchField
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={placeholder}
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            aria-label="Table view"
            aria-pressed={viewMode === "table"}
            className={cn(
              "min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl border text-sm transition-all cursor-pointer",
              viewMode === "table"
                ? "bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                : "border-border text-muted-foreground hover:bg-input hover:text-foreground",
              focusRing
            )}
          >
            <FaList className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
            className={cn(
              "min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl border text-sm transition-all cursor-pointer",
              viewMode === "grid"
                ? "bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                : "border-border text-muted-foreground hover:bg-input hover:text-foreground",
              focusRing
            )}
          >
            <FaThLarge className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
