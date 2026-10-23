"use client";

import { cn } from "@/lib/cn.js";
import { card } from "@/lib/ui.js";
import StatusBadge from "@/components/ui/StatusBadge.jsx";
import { formatDate } from "@/utils/formatDate.js";
import { FaClipboardList, FaCalendarAlt } from "react-icons/fa";
import AssessmentActionButtons from "./AssessmentActionButtons.jsx";

export default function AssessmentGrid({
  assessments = [],
  cloningId,
  onClone,
  onOpenPaper,
  onRequestDelete,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assessments.map((assessment) => (
        <div
          key={assessment.id}
          style={{ contentVisibility: "auto", containIntrinsicSize: "auto 220px" }}
          className={cn(
            card,
            "p-6 flex flex-col justify-between space-y-4 shadow-xl hover:border-indigo-500/30 transition-all duration-200"
          )}
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/20 shrink-0">
                  <FaClipboardList className="w-4 h-4 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-foreground text-base truncate">
                  {assessment.title}
                </h3>
              </div>
              <StatusBadge
                variant={assessment.is_executed ? "success" : "warning"}
                className="shrink-0"
              >
                {assessment.is_executed ? "Executed" : "Draft"}
              </StatusBadge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 pl-1">
              <FaCalendarAlt className="w-3 h-3 opacity-70" aria-hidden="true" />
              <span>Created: {formatDate(assessment.created_at || assessment.createdAt)}</span>
            </div>
          </div>

          <AssessmentActionButtons
            assessment={assessment}
            mode="grid"
            cloningId={cloningId}
            onClone={onClone}
            onOpenPaper={onOpenPaper}
            onRequestDelete={onRequestDelete}
          />
        </div>
      ))}
    </div>
  );
}
