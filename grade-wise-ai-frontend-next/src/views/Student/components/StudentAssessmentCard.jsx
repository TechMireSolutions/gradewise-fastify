import Link from "next/link";
import { cn } from "@/lib/cn.js";
import { btn } from "@/lib/ui.js";

export default function StudentAssessmentCard({ assessment }) {
  const isCompleted =
    assessment.status === "completed" || assessment.status === "graded";

  return (
    <div
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 110px" }}
      className="bg-input rounded-xl border border-border p-4 sm:p-5 hover:border-indigo-500/30 transition-all duration-200"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-secondary-foreground mb-1 break-words">
            {assessment.title || "Untitled Assessment"}
          </h3>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
        <span
          className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-full",
            isCompleted
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
          )}
        >
          {isCompleted ? "Completed" : "Available"}
        </span>
        {!isCompleted && (
          <Link
            href={`/student/assessments/${assessment.id}/take`}
            className={cn(
              btn.primary,
              "px-5 py-2 text-xs font-semibold rounded-lg min-h-[38px]"
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
