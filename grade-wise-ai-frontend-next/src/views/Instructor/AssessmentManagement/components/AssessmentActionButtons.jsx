"use client";

import { cn } from "@/lib/cn.js";
import { chip, chipTone, focusRing } from "@/lib/ui.js";
import Link from "next/link";
import {
  FaEye,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaChartBar,
  FaFilePdf,
  FaCopy,
  FaBinoculars,
} from "react-icons/fa";

export default function AssessmentActionButtons({
  assessment,
  mode = "chips",
  cloningId,
  onClone,
  onOpenPaper,
  onRequestDelete,
  className,
}) {
  if (!assessment) return null;

  const isGrid = mode === "grid";
  const buttonExtraClass = isGrid ? "min-h-11 justify-center" : "";
  const span2Class = isGrid ? "col-span-2" : "";

  // 1. Primary Management Actions (Edit, Delete) - available in draft mode
  const canEdit = !assessment.is_executed;
  const canDelete = !assessment.is_executed && Boolean(onRequestDelete);
  const hasPrimaryGroup = canEdit || canDelete;

  // 2. Post-Publish / Live Course Actions (View, Enroll, Preview / Analytics)
  const hasLiveGroup = true;

  // 3. Secondary Utility Actions (Paper, Clone)
  const canPaper = Boolean(onOpenPaper);
  const canClone = Boolean(onClone);
  const hasUtilityGroup = canPaper || canClone;

  return (
    <div
      className={cn(
        isGrid
          ? "grid grid-cols-2 gap-2 text-sm pt-2 border-t border-border/60"
          : "flex flex-wrap items-center gap-2",
        className
      )}
    >
      {/* ── 1. PRIMARY MANAGEMENT (Edit, Delete) ── */}
      {hasPrimaryGroup && (
        <div className={cn(isGrid ? "contents" : "flex items-center gap-1.5")}>
          {/* Edit (Draft only) */}
          {canEdit && (
            <Link
              href={`/instructor/assessments/${assessment.id}/edit`}
              className={cn(chip, chipTone.violet, buttonExtraClass, focusRing)}
              aria-label={`Edit ${assessment.title}`}
            >
              <FaEdit className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Edit</span>
            </Link>
          )}

          {/* Delete (Draft only) */}
          {canDelete && (
            <button
              type="button"
              onClick={() => onRequestDelete(assessment)}
              className={cn(chip, chipTone.danger, buttonExtraClass, focusRing)}
              aria-label={`Delete ${assessment.title}`}
            >
              <FaTrash className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}

      {/* Divider between Primary and Live actions */}
      {!isGrid && hasPrimaryGroup && (hasLiveGroup || hasUtilityGroup) && (
        <div className="h-4 w-px bg-border/60 mx-0.5 shrink-0" aria-hidden="true" />
      )}

      {/* ── 2. LIVE / DELIVERY (View, Enroll, Preview / Analytics) ── */}
      <div className={cn(isGrid ? "contents" : "flex items-center gap-1.5")}>
        {/* View Details */}
        <Link
          href={`/instructor/assessments/${assessment.id}`}
          className={cn(chip, chipTone.indigo, buttonExtraClass, focusRing)}
          aria-label={`View ${assessment.title}`}
        >
          <FaEye className="w-3.5 h-3.5" aria-hidden="true" />
          <span>View</span>
        </Link>

        {/* Enroll Students */}
        <Link
          href={`/instructor/assessments/${assessment.id}/enroll`}
          className={cn(chip, chipTone.emerald, buttonExtraClass, focusRing)}
          aria-label={`Enroll in ${assessment.title}`}
        >
          <FaUserPlus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Enroll</span>
        </Link>

        {/* Preview (Draft only) */}
        {!assessment.is_executed && (
          <Link
            href={`/instructor/assessments/${assessment.id}/preview`}
            className={cn(chip, chipTone.sky, buttonExtraClass, isGrid ? span2Class : "", focusRing)}
            aria-label={`Preview ${assessment.title}`}
          >
            <FaBinoculars className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isGrid ? "Preview Assessment" : "Preview"}</span>
          </Link>
        )}

        {/* Analytics (Executed only) */}
        {assessment.is_executed && (
          <Link
            href={`/instructor/assessments/${assessment.id}/analytics`}
            className={cn(chip, chipTone.amber, buttonExtraClass, span2Class, focusRing)}
            aria-label={`Analytics for ${assessment.title}`}
          >
            <FaChartBar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isGrid ? "Student Analytics" : "Analytics"}</span>
          </Link>
        )}
      </div>

      {/* Divider between Live and Utility actions */}
      {!isGrid && hasUtilityGroup && (
        <div className="h-4 w-px bg-border/60 mx-0.5 shrink-0" aria-hidden="true" />
      )}

      {/* ── 3. SECONDARY UTILITY (Paper, Clone) ── */}
      {hasUtilityGroup && (
        <div className={cn(isGrid ? "contents" : "flex items-center gap-1.5")}>
          {/* Physical Paper */}
          {canPaper && (
            <button
              type="button"
              onClick={() => onOpenPaper(assessment)}
              className={cn(chip, chipTone.sky, buttonExtraClass, focusRing)}
              aria-label={`Physical paper for ${assessment.title}`}
            >
              <FaFilePdf className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Paper</span>
            </button>
          )}

          {/* Clone */}
          {canClone && (
            <button
              type="button"
              onClick={() => onClone(assessment.id)}
              disabled={cloningId === assessment.id}
              className={cn(chip, chipTone.violet, buttonExtraClass, focusRing)}
              aria-label={`Clone ${assessment.title}`}
            >
              <FaCopy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{cloningId === assessment.id ? "Cloning..." : "Clone"}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
