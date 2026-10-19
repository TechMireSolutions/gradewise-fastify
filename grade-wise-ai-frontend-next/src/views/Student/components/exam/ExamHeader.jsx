"use client";

import { cn } from "@/lib/cn.js";
import { chip, examBar } from "@/lib/ui.js";

export default function ExamHeader({
  questionTimeLeft = 0,
  timeRemaining = 0,
  formatTime,
}) {
  return (
    <div className={examBar}>
      <div className="mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
            Assessment Session
          </span>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <span
            role="timer"
            aria-live="polite"
            className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full inline-flex items-center"
          >
            Q Time: {formatTime(questionTimeLeft)}
          </span>
          <span
            role="timer"
            aria-live="polite"
            className={cn(chip, "rounded-full px-3 py-1.5")}
          >
            Total: {formatTime(timeRemaining)}
          </span>
        </div>
      </div>
    </div>
  );
}
