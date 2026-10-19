"use client";

import { Label, Textarea } from "@/components/ui";

export default function ShortAnswerRenderer({ question, onAnswer }) {
  return (
    <div>
      <Label htmlFor="short-answer-input">Your Answer</Label>
      <Textarea
        id="short-answer-input"
        value={question.answer || ""}
        onChange={(e) => onAnswer(question.id, e.target.value)}
        placeholder="Type your answer here..."
        rows={6}
      />
    </div>
  );
}
