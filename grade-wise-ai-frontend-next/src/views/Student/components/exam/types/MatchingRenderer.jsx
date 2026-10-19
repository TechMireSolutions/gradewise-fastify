"use client";

import { Select } from "@/components/ui";

export default function MatchingRenderer({ question, onAnswer }) {
  let matchData = { leftItems: [], rightItems: [] };
  try {
    const raw = Array.isArray(question.options) ? question.options[0] : null;
    if (typeof raw === "string") matchData = { ...matchData, ...JSON.parse(raw) };
    else if (raw && typeof raw === "object") matchData = { ...matchData, ...raw };
  } catch {
    matchData = { leftItems: [], rightItems: [] };
  }

  const leftItems = Array.isArray(matchData.leftItems) ? matchData.leftItems : [];
  const rightItems = Array.isArray(matchData.rightItems) ? matchData.rightItems : [];

  if (leftItems.length === 0 || rightItems.length === 0) {
    return <p className="text-muted-foreground text-sm">Matching items unavailable.</p>;
  }

  let selectedPairs = [];
  try {
    const parsed = JSON.parse(question.answer || "[]");
    if (Array.isArray(parsed)) selectedPairs = parsed;
  } catch {
    selectedPairs = [];
  }

  const handleMatchChange = (left, right) => {
    const others = selectedPairs.filter(([, r]) => r !== right || r === "");
    const next = [...others.filter(([l]) => l !== left), [left, right]];
    onAnswer(question.id, JSON.stringify(next));
  };

  return (
    <div className="space-y-4">
      {leftItems.map((left, i) => {
        const pair = selectedPairs.find(([l]) => l === left);
        return (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-input rounded-xl border border-border"
          >
            <span className="font-semibold text-secondary-foreground flex-1 break-words">
              {left}
            </span>
            <div className="sm:w-72">
              <Select
                value={pair ? pair[1] : ""}
                onChange={(e) => handleMatchChange(left, e.target.value)}
                aria-label={`Match for ${left}`}
              >
                <option value="">Select match...</option>
                {rightItems.map((r, ri) => (
                  <option key={ri} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        );
      })}
    </div>
  );
}
