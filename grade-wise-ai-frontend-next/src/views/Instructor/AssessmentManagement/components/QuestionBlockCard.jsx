"use client";

import { cn } from "@/lib/cn.js";
import { card, focusRing, iconBadge } from "@/lib/ui.js";
import { Input, Label, Select } from "@/components/ui";
import { FiTrash2, FiLayers } from "react-icons/fi";
import BlockTypeFields from "./BlockTypeFields.jsx";
import { QUESTION_TYPES } from "../hooks/useAssessmentForm.js";

export default function QuestionBlockCard({
  block,
  index,
  totalBlocks,
  onChange,
  onNegativeMarksBlur,
  onRemove,
  disabled,
}) {
  const isSingleBlock = totalBlocks <= 1;

  return (
    <div className={cn(card, "p-5 sm:p-6 shadow-md transition-all duration-200 border-border/80")}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-border/70">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", iconBadge)}>
            <FiLayers className="text-white text-sm" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Question Block #{index + 1}
            </h3>
            <p className="text-xs text-muted-foreground">
              Configure question volume, timing, and marking scheme
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={disabled || isSingleBlock}
          aria-label={`Remove question block ${index + 1}`}
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            isSingleBlock
              ? "opacity-30 cursor-not-allowed text-muted-foreground"
              : "text-red-500 hover:bg-red-500/10 active:scale-95 cursor-pointer",
            focusRing
          )}
          title={isSingleBlock ? "Must keep at least one block" : "Remove Block"}
        >
          <FiTrash2 className="text-base" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Row 1: Question Type & Question Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`questionType-${index}`}>Question Type</Label>
            <Select
              id={`questionType-${index}`}
              name={`questionType-${index}`}
              value={block.questionType}
              onChange={(e) => onChange(index, "questionType", e.target.value)}
              disabled={disabled}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor={`questionCount-${index}`}>Number of Questions</Label>
            <Input
              type="number"
              id={`questionCount-${index}`}
              name={`questionCount-${index}`}
              hasIcon={false}
              min="1"
              max="100"
              value={block.questionCount ?? 1}
              onChange={(e) => onChange(index, "questionCount", e.target.value)}
              disabled={disabled}
              required
            />
          </div>
        </div>

        {/* Row 2: Duration per Question & Type Specific Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`duration-${index}`}>Time per Question (seconds)</Label>
            <Input
              type="number"
              id={`duration-${index}`}
              name={`durationPerQuestion-${index}`}
              hasIcon={false}
              min="30"
              max="600"
              step="5"
              value={block.durationPerQuestion ?? 120}
              onChange={(e) => onChange(index, "durationPerQuestion", e.target.value)}
              disabled={disabled}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {Math.floor((block.durationPerQuestion || 120) / 60)}m{" "}
              {(block.durationPerQuestion || 120) % 60}s per question
            </p>
          </div>

          <div>
            <BlockTypeFields
              block={block}
              index={index}
              onChange={onChange}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Row 3: Marks Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
          <div>
            <Label htmlFor={`positiveMarks-${index}`}>Positive Marks (Per Correct)</Label>
            <Input
              type="number"
              id={`positiveMarks-${index}`}
              name={`positiveMarks-${index}`}
              hasIcon={false}
              min="0.25"
              max="100"
              step="0.25"
              value={block.positiveMarks ?? 1}
              onChange={(e) => onChange(index, "positiveMarks", e.target.value)}
              disabled={disabled}
              required
            />
          </div>

          <div>
            <Label htmlFor={`negativeMarks-${index}`}>Negative Marks (Deduction)</Label>
            <Input
              type="text"
              id={`negativeMarks-${index}`}
              name={`negativeMarks-${index}`}
              hasIcon={false}
              placeholder="-0.25 (or 0)"
              value={block.negativeMarks ?? 0}
              onChange={(e) => onChange(index, "negativeMarks", e.target.value)}
              onBlur={() => onNegativeMarksBlur(index)}
              disabled={disabled}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Deduction on incorrect answer (e.g. -0.25). 0 for no penalty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
