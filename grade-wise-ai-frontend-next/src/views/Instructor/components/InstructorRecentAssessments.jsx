import Link from "next/link";
import { cn } from "@/lib/cn.js";
import { btn, focusRing, tableHead, tableRowHover } from "@/lib/ui.js";
import { formatDate } from "@/utils/formatDate.js";
import StatusBadge from "@/components/ui/StatusBadge.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import {
  DashboardSectionCard,
  TableSkeleton,
} from "@/components/dashboard/shared/index.js";
import {
  FaPen,
  FaClipboardList,
  FaCalendarAlt,
} from "react-icons/fa";
import AssessmentActionButtons from "@/views/Instructor/AssessmentManagement/components/AssessmentActionButtons.jsx";

export default function InstructorRecentAssessments({
  assessments = [],
  loading = false,
  onOpenDelete,
  onOpenPaper,
}) {
  const displayedAssessments = Array.isArray(assessments)
    ? assessments.slice(0, 5)
    : [];

  return (
    <DashboardSectionCard
      title="Recent Assessments"
      icon={FaClipboardList}
      actions={
        <Link
          href="/instructor/assessments"
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors",
            focusRing
          )}
        >
          View All Assessments
          <span aria-hidden="true">→</span>
        </Link>
      }
    >
      {loading ? (
        <TableSkeleton rows={5} />
      ) : displayedAssessments.length === 0 ? (
        <EmptyState
          icon={FaPen}
          title="No assessments yet"
          description="Create your first assessment to start evaluating your students' learning outcomes."
          action={
            <Link href="/instructor/assessments/create" className={btn.primary}>
              <FaPen aria-hidden="true" />
              Create your first assessment
            </Link>
          }
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-hidden rounded-xl border border-border">
            <table className="min-w-full">
              <thead className={tableHead}>
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Assessment Title
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Created On
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card/40">
                {displayedAssessments.map((assessment) => (
                  <tr
                    key={assessment.id}
                    className={cn(tableRowHover, "transition-colors duration-150")}
                  >
                    <td className="px-6 py-4 text-sm text-secondary-foreground font-semibold">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/20 shrink-0">
                          <FaClipboardList className="w-4 h-4 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
                        </div>
                        <span className="truncate max-w-xs">{assessment.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden="true" />
                        <span>{formatDate(assessment.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <StatusBadge variant={assessment.is_executed ? "success" : "warning"}>
                        {assessment.is_executed ? "Executed" : "Draft"}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <AssessmentActionButtons
                        assessment={assessment}
                        mode="chips"
                        onOpenPaper={onOpenPaper}
                        onRequestDelete={onOpenDelete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden space-y-4">
            {displayedAssessments.map((assessment) => (
              <div
                key={assessment.id}
                style={{ contentVisibility: "auto", containIntrinsicSize: "auto 190px" }}
                className="bg-card rounded-xl border border-border p-4 sm:p-5 hover:border-indigo-500/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/20 shrink-0">
                      <FaClipboardList className="w-4 h-4 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 break-words">
                        {assessment.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FaCalendarAlt className="w-3 h-3 shrink-0" aria-hidden="true" />
                        <span>{formatDate(assessment.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge
                    variant={assessment.is_executed ? "success" : "warning"}
                    className="shrink-0"
                  >
                    {assessment.is_executed ? "Executed" : "Draft"}
                  </StatusBadge>
                </div>

                <AssessmentActionButtons
                  assessment={assessment}
                  mode="grid"
                  onOpenPaper={onOpenPaper}
                  onRequestDelete={onOpenDelete}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardSectionCard>
  );
}
