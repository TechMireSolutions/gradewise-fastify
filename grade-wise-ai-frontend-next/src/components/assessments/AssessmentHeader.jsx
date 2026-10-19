import { cn } from "@/lib/cn.js";
import { btn, card, focusRing, iconBadge } from "@/lib/ui.js";
import Link from "next/link";
import { FaEye, FaEdit, FaChartBar, FaCopy, FaCheckCircle } from "react-icons/fa";
import StatusBadge from "@/components/ui/StatusBadge.jsx";

function AssessmentHeader({ assessmentId, isExecuted = false, onClone, isCloning = false }) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className={cn(card, "shadow-2xl overflow-hidden")}>
        <div className="px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("p-2.5", "rounded-xl", iconBadge)}>
                  <FaEye className="text-white text-lg" />
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                    Assessment Preview
                  </h1>
                  <StatusBadge variant={isExecuted ? "success" : "warning"}>
                    {isExecuted ? (
                      <>
                        <FaCheckCircle className="text-xs" />
                        <span>Executed</span>
                      </>
                    ) : (
                      <span>Draft</span>
                    )}
                  </StatusBadge>
                </div>
              </div>
              <p className={cn("text-muted-foreground", "text-sm", "sm:text-base", "leading-relaxed")}>
                See exactly how the AI will interpret your setup and what students will experience
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {onClone && (
                <button
                  type="button"
                  onClick={onClone}
                  disabled={isCloning}
                  className={cn(
                    btn.secondary,
                    "px-4 py-2.5 inline-flex items-center justify-center gap-2 cursor-pointer text-sm font-medium",
                    focusRing
                  )}
                >
                  <FaCopy className="text-sm" />
                  <span>{isCloning ? "Cloning..." : "Clone Assessment"}</span>
                </button>
              )}

              {isExecuted ? (
                <Link
                  href={`/instructor/assessments/${assessmentId}/analytics`}
                  className={cn(
                    btn.primary,
                    "px-5 py-2.5 inline-flex items-center justify-center gap-2 cursor-pointer text-sm font-medium",
                    focusRing
                  )}
                >
                  <FaChartBar className="text-sm" />
                  <span>View Analytics</span>
                </Link>
              ) : (
                <Link
                  href={`/instructor/assessments/${assessmentId}/edit`}
                  className={cn(
                    btn.primary,
                    "px-5 py-2.5 inline-flex items-center justify-center gap-2 cursor-pointer text-sm font-medium",
                    focusRing
                  )}
                >
                  <FaEdit className="text-sm" />
                  <span>Edit Assessment</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssessmentHeader;
