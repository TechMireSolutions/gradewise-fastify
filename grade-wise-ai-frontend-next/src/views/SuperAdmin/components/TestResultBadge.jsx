"use client";

import { cn } from "@/lib/cn.js";
import { FaCheck, FaTimes, FaWrench, FaExclamationTriangle } from "react-icons/fa";

export default function TestResultBadge({ r }) {
  if (!r) return null;

  if (r.state === "testing") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 bg-btn-secondary text-secondary-foreground border border-border rounded-full text-xs font-semibold")}>
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
        Testing…
      </span>
    );
  }

  if (r.state === "ok") {
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold w-fit">
          <FaCheck className="w-2.5 h-2.5" /> Valid
          {typeof r.latencyMs === "number" && (
            <span className="font-mono opacity-70">{r.latencyMs}ms</span>
          )}
        </span>
        {r.autoSwitchedModelFrom && (
          <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 dark:text-indigo-400 bg-indigo-500/15 border border-indigo-500/20 px-2 py-0.5 rounded w-fit">
            <FaWrench className="w-2.5 h-2.5 flex-shrink-0" /> Model auto-switched:{" "}
            <code className="font-mono">{r.autoSwitchedModelFrom}</code> →{" "}
            <code className="font-mono">{r.modelUsed}</code>
          </span>
        )}
        {r.providerOverridden && (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 rounded w-fit">
            <FaExclamationTriangle className="w-2.5 h-2.5 flex-shrink-0" /> Key belongs to{" "}
            <strong>{r.providerDetected}</strong> — consider moving it there.
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/20 rounded-full text-xs font-semibold max-w-xs truncate w-fit">
        <FaTimes className="w-2.5 h-2.5 flex-shrink-0" />{" "}
        {(r.message || "Invalid key").substring(0, 60)}
      </span>
      {r.providerOverridden && (
        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 rounded w-fit">
          <FaExclamationTriangle className="w-2.5 h-2.5 flex-shrink-0" /> Key prefix suggests{" "}
          <strong>{r.providerDetected}</strong> provider.
        </span>
      )}
    </div>
  );
}
