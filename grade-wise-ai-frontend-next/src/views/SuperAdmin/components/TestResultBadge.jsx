"use client";

import { cn } from "@/lib/cn.js";
import { statusTone, shape } from "@/lib/ui.js";
import { FaCheck, FaTimes, FaWrench, FaExclamationTriangle } from "react-icons/fa";

export default function TestResultBadge({ r }) {
  if (!r) return null;

  if (r.state === "testing") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 bg-btn-secondary text-secondary-foreground border border-border text-xs font-semibold", shape.pill)}>
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
        Testing…
      </span>
    );
  }

  if (r.state === "ok") {
    return (
      <div className="flex flex-col gap-1">
        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 border text-xs font-semibold w-fit", statusTone.success, shape.pill)}>
          <FaCheck className="w-2.5 h-2.5" /> Valid
          {typeof r.latencyMs === "number" && (
            <span className="font-mono opacity-70">{r.latencyMs}ms</span>
          )}
        </span>
        {r.autoSwitchedModelFrom && (
          <span className={cn("inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded w-fit", statusTone.info)}>
            <FaWrench className="w-2.5 h-2.5 flex-shrink-0" /> Model auto-switched:{" "}
            <code className="font-mono">{r.autoSwitchedModelFrom}</code> →{" "}
            <code className="font-mono">{r.modelUsed}</code>
          </span>
        )}
        {r.providerOverridden && (
          <span className={cn("inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded w-fit", statusTone.warning)}>
            <FaExclamationTriangle className="w-2.5 h-2.5 flex-shrink-0" /> Key belongs to{" "}
            <strong>{r.providerDetected}</strong> — consider moving it there.
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 border text-xs font-semibold max-w-xs truncate w-fit", statusTone.danger, shape.pill)}>
        <FaTimes className="w-2.5 h-2.5 flex-shrink-0" />{" "}
        {(r.message || "Invalid key").substring(0, 60)}
      </span>
      {r.providerOverridden && (
        <span className={cn("inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded w-fit", statusTone.warning)}>
          <FaExclamationTriangle className="w-2.5 h-2.5 flex-shrink-0" /> Key prefix suggests{" "}
          <strong>{r.providerDetected}</strong> provider.
        </span>
      )}
    </div>
  );
}
