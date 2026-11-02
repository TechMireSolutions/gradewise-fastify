"use client";

import { cn } from "@/lib/cn.js";
import { accentPanel, card, iconBadge, tableRowHover } from "@/lib/ui.js";
import { FaQuestionCircle } from "react-icons/fa";
import StatusBadge from "@/components/ui/StatusBadge.jsx";

export default function AssessmentBlocksDisplay({ blocks = [] }) {
  return (
    <div>
      {/* Desktop View */}
      <section className="hidden lg:block">
        <div className="flex items-center gap-3 mb-5">
          <div className={cn("p-2.5 rounded-xl", iconBadge)}>
            <FaQuestionCircle className="text-white text-sm" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Question Blocks</h3>
        </div>

        {blocks.length > 0 ? (
          <div className={cn(card, "overflow-hidden")}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-input">
                    <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                      Type
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                      Count
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                      Time/Q
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                      Options
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                      +Marks
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                      -Marks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {blocks.map((b, i) => (
                    <tr key={i} className={cn("hover:bg-indigo-500/5", tableRowHover, "transition-colors duration-150")}>
                      <td className="px-6 py-4 text-sm text-secondary-foreground">
                        <StatusBadge variant="info" className="capitalize">
                          {b.question_type?.replace(/_/g, " ") || b.questionType?.replace(/_/g, " ")}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-foreground font-medium">
                        {b.question_count || b.questionCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {b.duration_per_question || b.durationPerQuestion}s
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {(b.question_type === "multiple_choice" || b.questionType === "multiple_choice")
                          ? (b.num_options || b.numOptions || 4)
                          : (b.question_type === "matching" || b.questionType === "matching")
                            ? `${b.num_first_side || b.leftCount || 3}/${b.num_second_side || b.rightCount || 4}`
                            : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <StatusBadge variant="success">
                          +{b.positive_marks ?? b.positiveMarks ?? "1"}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <StatusBadge variant="danger">
                          -{Math.abs(Number(b.negative_marks ?? b.negativeMarks ?? 0))}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className={cn(accentPanel, "w-16 h-16 rounded-xl flex items-center justify-center mb-4")}>
              <FaQuestionCircle className="text-indigo-500 dark:text-indigo-400 text-2xl" />
            </div>
            <p className="text-muted-foreground text-sm italic">No question blocks configured</p>
          </div>
        )}
      </section>

      {/* Mobile Cards */}
      <section className="lg:hidden space-y-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", iconBadge)}>
            <FaQuestionCircle className="text-white text-sm" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Question Blocks</h3>
        </div>

        {blocks.length > 0 ? (
          blocks.map((b, i) => (
            <div
              key={i}
              style={{ contentVisibility: "auto", containIntrinsicSize: "auto 140px" }}
              className="bg-input rounded-xl border border-border p-4 sm:p-5 hover:border-indigo-500/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <StatusBadge variant="info">
                  Block {i + 1}
                </StatusBadge>
                <StatusBadge variant="neutral" className="capitalize">
                  {b.question_type?.replace(/_/g, " ") || b.questionType?.replace(/_/g, " ")}
                </StatusBadge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Count:</span>
                  <p className="font-semibold text-foreground">{b.question_count || b.questionCount} Qs</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Duration:</span>
                  <p className="font-semibold text-foreground">{b.duration_per_question || b.durationPerQuestion}s</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Marks (+ / -):</span>
                  <p className="font-semibold text-foreground">
                    +{b.positive_marks ?? b.positiveMarks ?? 1} / -{Math.abs(Number(b.negative_marks ?? b.negativeMarks ?? 0))}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm italic">No question blocks configured</p>
        )}
      </section>
    </div>
  );
}
