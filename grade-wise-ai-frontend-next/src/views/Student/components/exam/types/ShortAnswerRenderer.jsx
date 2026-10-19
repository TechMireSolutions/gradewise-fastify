"use client";

import { Label, Textarea } from "@/components/ui";
import useStudentAssessmentStore from "@/features/student-assessment/store.js";
import { getExamTranslation } from "@/utils/translations.js";

export default function ShortAnswerRenderer({ question, onAnswer }) {
  const language = useStudentAssessmentStore((s) => s.language) || "en";
  const yourAnswerLabel = getExamTranslation(language, "yourAnswer");
  const placeholder = getExamTranslation(language, "placeholder");

  return (
    <div>
      <Label htmlFor="short-answer-input">{yourAnswerLabel}</Label>
      <Textarea
        id="short-answer-input"
        value={question.answer || ""}
        onChange={(e) => onAnswer(question.id, e.target.value)}
        placeholder={placeholder}
        rows={6}
      />
    </div>
  );
}
