import { cn } from "@/lib/cn.js";
import { btn } from "@/lib/ui.js";
import { FaGraduationCap } from "react-icons/fa";
import StatusBadge from "@/components/ui/StatusBadge.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import { formatDate } from "@/utils/formatDate.js";
import {
  DashboardSectionCard,
  CardListSkeleton,
} from "@/components/dashboard/shared/index.js";

export default function StudentAnalyticsList({
  assessments = [],
  selectedAssessment,
  onSeeResults,
  loading = false,
}) {
  return (
    <DashboardSectionCard
      title="Completed Assessments"
      subtitle="Select an assessment to review your performance metrics and download results"
      icon={FaGraduationCap}
      className="max-w-5xl mx-auto"
    >
      {loading ? (
        <CardListSkeleton count={3} />
      ) : Array.isArray(assessments) && assessments.length > 0 ? (
        <div className="space-y-4">
          {assessments.map((a) => {
            const currentId = a.attemptId || a.id;
            const isSelected = selectedAssessment === currentId;

            return (
              <div
                key={currentId}
                style={{ contentVisibility: "auto", containIntrinsicSize: "auto 90px" }}
                className={cn(
                  "bg-card/60 backdrop-blur-sm border p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-200",
                  isSelected
                    ? "border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                    : "border-border hover:border-indigo-500/30"
                )}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-foreground break-words">
                    {a.title || "Assessment"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge variant="success">Completed</StatusBadge>
                    {a.completedAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(a.completedAt)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSeeResults(a.attemptId, a.id)}
                  className={cn(
                    btn.primary,
                    "px-5 py-2 min-h-11 text-xs font-semibold cursor-pointer w-full sm:w-auto"
                  )}
                  aria-label={`View results for ${a.title || "assessment"}`}
                >
                  {isSelected ? "Viewing Results" : "View Results"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FaGraduationCap}
          title="No Completed Assessments"
          description="You have not completed any assessments yet. Visit your student dashboard to start an assigned assessment."
        />
      )}
    </DashboardSectionCard>
  );
}
