"use client";

import { cn } from "@/lib/cn.js";
import { card, tableHead, tableRowHover } from "@/lib/ui.js";
import StatusBadge from "@/components/ui/StatusBadge.jsx";
import { formatDate } from "@/utils/formatDate.js";
import { FaClipboardList, FaCalendarAlt } from "react-icons/fa";
import AssessmentActionButtons from "./AssessmentActionButtons.jsx";

export default function AssessmentTable({
  assessments = [],
  cloningId,
  onClone,
  onOpenPaper,
  onRequestDelete,
}) {
  return (
    <div className={cn(card, "overflow-hidden shadow-xl")}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className={tableHead}>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                Assessment Title
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                Created On
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                Status
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pr-8">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card/40">
            {assessments.map((assessment) => (
              <tr key={assessment.id} className={cn(tableRowHover, "transition-colors duration-150")}>
                <td className="px-6 py-4 text-sm font-semibold text-foreground">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/20 shrink-0">
                      <FaClipboardList className="w-4 h-4 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
                    </div>
                    <span className="truncate max-w-sm">{assessment.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden="true" />
                    <span>{formatDate(assessment.created_at || assessment.createdAt)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  <StatusBadge variant={assessment.is_executed ? "success" : "warning"}>
                    {assessment.is_executed ? "Executed" : "Draft"}
                  </StatusBadge>
                </td>
                <td className="px-6 py-4 pr-6">
                  <AssessmentActionButtons
                    assessment={assessment}
                    mode="chips"
                    className="justify-end"
                    cloningId={cloningId}
                    onClone={onClone}
                    onOpenPaper={onOpenPaper}
                    onRequestDelete={onRequestDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
