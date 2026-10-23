import Link from "next/link";
import { cn } from "@/lib/cn.js";
import { btn } from "@/lib/ui.js";
import StatusBadge from "@/components/ui/StatusBadge.jsx";

export default function StudentAssessmentCard({ assessment }) {
  const isCompleted =
    assessment.status === "completed" || assessment.status === "graded";

  return (
    <div
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 110px" }}
      className="@container bg-input rounded-xl border border-border p-4 sm:p-5 hover:border-indigo-500/30 transition-all duration-200"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-secondary-foreground mb-1 break-words">
            {assessment.title || "Untitled Assessment"}
          </h3>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
        <StatusBadge variant={isCompleted ? "success" : "info"}>
          {isCompleted ? "Completed" : "Available"}
        </StatusBadge>
        {!isCompleted && (
          <Link
            href={`/student/assessments/${assessment.id}/take`}
            className={cn(
              btn.primary,
              "px-5 py-2.5 text-xs font-semibold rounded-lg min-h-[44px]"
            )}
            aria-label={`Start assessment ${assessment.title || "Untitled"}`}
          >
            Start Assessment
          </Link>
        )}
      </div>
    </div>
  );
}
