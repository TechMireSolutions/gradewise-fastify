"use client";

import { cn } from "@/lib/cn.js";
import { chip, examBar, statusTone, shape } from "@/lib/ui.js";
import useStudentAssessmentStore from "@/features/student-assessment/store.js";
import { getExamTranslation } from "@/utils/translations.js";

export default function ExamHeader({
  questionTimeLeft = 0,
  timeRemaining = 0,
  formatTime,
}) {
  const language = useStudentAssessmentStore((s) => s.language) || "en";
  const sessionLabel = getExamTranslation(language, "assessmentSession");
  const qTimeLabel = getExamTranslation(language, "qTime");
  const totalLabel = getExamTranslation(language, "total");

  return (
    <div className={examBar}>
      <div className="mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
            {sessionLabel}
          </span>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <span
            role="timer"
            aria-live="polite"
            className={cn("px-3 py-1.5 inline-flex items-center font-mono tabular-nums text-xs font-semibold", statusTone.warning, shape.pill)}
          >
            {qTimeLabel}: {formatTime(questionTimeLeft)}
          </span>
          <span
            role="timer"
            aria-live="polite"
            className={cn(chip, "px-3 py-1.5 font-mono tabular-nums")}
          >
            {totalLabel}: {formatTime(timeRemaining)}
          </span>
        </div>
      </div>
    </div>
  );
}
