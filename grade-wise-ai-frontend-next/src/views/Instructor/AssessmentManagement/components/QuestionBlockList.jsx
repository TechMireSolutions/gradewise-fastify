"use client";

import { cn } from "@/lib/cn.js";
import { btn, card, iconBadge } from "@/lib/ui.js";
import { FiList, FiPlus } from "react-icons/fi";
import QuestionBlockCard from "./QuestionBlockCard.jsx";

export default function QuestionBlockList({
  questionBlocks,
  onChange,
  onNegativeMarksBlur,
  onAddBlock,
  onRemoveBlock,
  disabled,
}) {
  const totalQuestions = questionBlocks.reduce(
    (sum, b) => sum + (Number(b.questionCount) || 0),
    0
  );

  const totalTimeSeconds = questionBlocks.reduce(
    (sum, b) => sum + (Number(b.questionCount) || 0) * (Number(b.durationPerQuestion) || 0),
    0
  );

  const totalMinutes = Math.floor(totalTimeSeconds / 60);

  return (
    <div className={cn(card, "shadow-2xl overflow-hidden")}>
      <div className="px-6 py-4 border-b border-border bg-input flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", iconBadge)}>
            <FiList className="text-white text-base" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Question Blocks</h2>
            <p className="text-xs text-muted-foreground">
              Define the structure, question count, and types for AI generation
            </p>
          </div>
        </div>

        {/* Live Summary Chips */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
            {totalQuestions} {totalQuestions === 1 ? "Question" : "Questions"}
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            ~{totalMinutes} min total
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="space-y-4">
          {questionBlocks.map((block, index) => (
            <QuestionBlockCard
              key={index}
              block={block}
              index={index}
              totalBlocks={questionBlocks.length}
              onChange={onChange}
              onNegativeMarksBlur={onNegativeMarksBlur}
              onRemove={onRemoveBlock}
              disabled={disabled}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => onAddBlock()}
          disabled={disabled}
          className={cn(
            btn.secondary,
            "w-full py-3 border-dashed border-2 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl"
          )}
        >
          <FiPlus className="text-base" />
          Add Another Question Block
        </button>
      </div>
    </div>
  );
}
