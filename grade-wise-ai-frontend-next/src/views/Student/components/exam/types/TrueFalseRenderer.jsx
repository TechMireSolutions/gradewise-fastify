"use client";

import { cn } from "@/lib/cn.js";
import { focusRing } from "@/lib/ui.js";

export default function TrueFalseRenderer({ question, onAnswer }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
      {[true, false].map((val) => {
        const isSelected = question.answer === val;
        return (
          <button
            key={val.toString()}
            type="button"
            onClick={() => onAnswer(question.id, val)}
            className={cn(
              "py-6 text-xl font-bold rounded-xl border transition-all text-center cursor-pointer",
              isSelected
                ? "bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-md shadow-indigo-500/15"
                : "bg-input border-border text-foreground hover:bg-surface-elevated",
              focusRing
            )}
            aria-pressed={isSelected}
          >
            {val ? "True" : "False"}
          </button>
        );
      })}
    </div>
  );
}
