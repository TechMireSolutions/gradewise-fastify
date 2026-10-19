"use client";

import { Input, Label } from "@/components/ui";

export default function FillInBlankRenderer({ question, onAnswer }) {
  return (
    <div>
      <Label htmlFor="fill-blank-input">Missing Word / Phrase</Label>
      <Input
        id="fill-blank-input"
        type="text"
        hasIcon={false}
        value={question.answer || ""}
        onChange={(e) => onAnswer(question.id, e.target.value)}
        placeholder="Type the missing word or phrase here..."
      />
    </div>
  );
}
