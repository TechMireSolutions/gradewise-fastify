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

  return (
    <div
      className={cn(
        isGrid
          ? "grid grid-cols-2 gap-2 text-sm pt-2 border-t border-border/60"
          : "flex flex-wrap items-center gap-1.5",
        className
      )}
    >
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

      {/* Edit (Draft only) */}
      {!assessment.is_executed && (
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
      {!assessment.is_executed && onRequestDelete && (
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

      {/* Physical Paper */}
      {onOpenPaper && (
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

      {/* Clone (Optional) */}
      {onClone && (
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

      {/* Preview (Draft only) */}
      {!assessment.is_executed && (
        <Link
          href={`/instructor/assessments/${assessment.id}/preview`}
          className={cn(chip, chipTone.emerald, buttonExtraClass, isGrid ? span2Class : "", focusRing)}
          aria-label={`Preview ${assessment.title}`}
        >
          <FaBinoculars className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isGrid ? "Preview Assessment" : "Preview"}</span>
        </Link>
      )}
    </div>
  );
}
