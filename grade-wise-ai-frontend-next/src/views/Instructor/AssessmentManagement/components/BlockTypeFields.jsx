"use client";

import { Input, Label } from "@/components/ui";

export default function BlockTypeFields({ block, index, onChange, disabled }) {
  const { questionType, numOptions, leftCount, rightCount } = block;

  if (questionType === "multiple_choice") {
    return (
      <div>
        <Label htmlFor={`options-${index}`}>Options per Question</Label>
        <Input
          type="number"
          id={`options-${index}`}
          name={`numOptions-${index}`}
          hasIcon={false}
          min="2"
          max="6"
          value={numOptions ?? 4}
          onChange={(e) => onChange(index, "numOptions", e.target.value)}
          disabled={disabled}
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">Standard is 4 choices (A, B, C, D)</p>
      </div>
    );
  }

  if (questionType === "matching") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`left-count-${index}`}>Left Side Items (Prompts)</Label>
          <Input
            type="number"
            id={`left-count-${index}`}
            name={`leftCount-${index}`}
            hasIcon={false}
            min="2"
            max="10"
            value={leftCount ?? 3}
            onChange={(e) => onChange(index, "leftCount", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
        <div>
          <Label htmlFor={`right-count-${index}`}>Right Side Options</Label>
          <Input
            type="number"
            id={`right-count-${index}`}
            name={`rightCount-${index}`}
            hasIcon={false}
            min="2"
            max="10"
            value={rightCount ?? 4}
            onChange={(e) => onChange(index, "rightCount", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>
    );
  }

  if (questionType === "short_answer") {
    return (
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-indigo-700 dark:text-indigo-300">
        AI will generate conceptual short-answer questions and evaluate key semantic phrases upon submission.
      </div>
    );
  }

  if (questionType === "true_false") {
    return (
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-indigo-700 dark:text-indigo-300">
        AI will generate factual statements requiring True or False evaluation.
      </div>
    );
  }

  if (questionType === "fill_in_the_blank") {
    return (
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-indigo-700 dark:text-indigo-300">
        AI will generate single-blank statements requiring exact or close terminology matches.
      </div>
    );
  }

  return null;
}
