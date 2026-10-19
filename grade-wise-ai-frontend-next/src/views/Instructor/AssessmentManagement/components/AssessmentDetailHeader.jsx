"use client";

import { cn } from "@/lib/cn.js";
import { btn, focusRing } from "@/lib/ui.js";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge.jsx";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEdit,
  FaGlobe,
  FaLock,
  FaCopy,
  FaUsers,
  FaPrint,
} from "react-icons/fa";

export default function AssessmentDetailHeader({
  assessment,
  isCloning,
  onClone,
  onOpenPaper,
}) {
  if (!assessment) return null;

  return (
    <>
      {/* Breadcrumb Back Link & Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/instructor/assessments"
            className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors duration-150 cursor-pointer inline-flex items-center gap-1.5"
          >
            <FaArrowLeft className="text-xs" /> Back to Assessments
          </Link>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2 text-balance">
          Assessment Details
        </h1>
        <p className="text-muted-foreground text-sm">
          View and manage this assessment configuration
        </p>
      </div>

      {/* Card Header Top Bar */}
      <div className="px-6 py-5 border-b border-border bg-input">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-foreground mb-3 break-words text-balance">
              {assessment.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge variant={assessment.is_executed ? "success" : "warning"}>
                {assessment.is_executed ? (
                  <>
                    <FaCheckCircle className="text-xs" aria-hidden="true" />
                    <span>Executed</span>
                  </>
                ) : (
                  <>
                    <FaEdit className="text-xs" aria-hidden="true" />
                    <span>Draft</span>
                  </>
                )}
              </StatusBadge>
              {assessment.is_published ? (
                <StatusBadge variant="info">
                  <FaGlobe className="text-xs" aria-hidden="true" />
                  <span>Published</span>
                </StatusBadge>
              ) : (
                <StatusBadge variant="neutral">
                  <FaLock className="text-xs" aria-hidden="true" />
                  <span>Unpublished</span>
                </StatusBadge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClone}
              disabled={isCloning}
              className={cn(btn.secondary, "min-h-11 px-4 text-sm", focusRing)}
              aria-label="Clone Assessment"
            >
              <FaCopy aria-hidden="true" />
              <span>{isCloning ? "Cloning..." : "Clone"}</span>
            </button>
            {!assessment.is_executed && (
              <Link
                href={`/instructor/assessments/${assessment.id}/edit`}
                className={cn(btn.secondary, "min-h-11 px-4 text-sm", focusRing)}
              >
                <FaEdit aria-hidden="true" />
                <span>Edit</span>
              </Link>
            )}
            <Link
              href={`/instructor/assessments/${assessment.id}/enroll`}
              className={cn(btn.secondary, "min-h-11 px-4 text-sm", focusRing)}
            >
              <FaUsers aria-hidden="true" />
              <span>Enroll</span>
            </Link>
            <button
              type="button"
              onClick={() => onOpenPaper(assessment)}
              className={cn(btn.primary, "min-h-11 px-5 text-sm", focusRing)}
            >
              <FaPrint aria-hidden="true" />
              <span>Print PDF</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
