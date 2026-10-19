"use client";

import { cn } from "@/lib/cn.js";
import { focusRing } from "@/lib/ui.js";

export default function MultipleChoiceRenderer({ question, onAnswer }) {
  let rawOptions = question?.options;
  if (typeof rawOptions === "string") {
    try {
      rawOptions = JSON.parse(rawOptions);
    } catch {
      rawOptions = [];
    }
  }
  if (!Array.isArray(rawOptions)) {
    rawOptions = [];
  }

  const optionBase =
    "rounded-xl border p-4 text-start text-sm font-medium transition-all duration-200 active:scale-[0.98] w-full cursor-pointer";
  const optionIdle =
    "border-border bg-input text-secondary-foreground hover:border-accent/40 hover:bg-surface-elevated";
  const optionSelected =
    "border-indigo-500/50 bg-indigo-500/15 text-indigo-800 shadow-lg shadow-indigo-500/10 dark:text-indigo-300 font-bold";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rawOptions.map((opt, i) => {
        const isSelected = question.answer === opt;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onAnswer(question.id, opt)}
            className={cn(optionBase, isSelected ? optionSelected : optionIdle, focusRing)}
            aria-pressed={isSelected}
          >
            <span className="font-bold inline-block me-2 text-indigo-500 dark:text-indigo-400">
              {String.fromCharCode(65 + i)}.
            </span>
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
