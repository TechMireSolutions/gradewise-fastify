"use client";

import { Input, Label } from "@/components/ui";
import useStudentAssessmentStore from "@/features/student-assessment/store.js";
import { getExamTranslation } from "@/utils/translations.js";

export default function FillInBlankRenderer({ question, onAnswer }) {
  const language = useStudentAssessmentStore((s) => s.language) || "en";
  const missingWordLabel = getExamTranslation(language, "missingWord");
  const placeholder = getExamTranslation(language, "missingWordPlaceholder");

  return (
    <div>
      <Label htmlFor="fill-blank-input">{missingWordLabel}</Label>
      <Input
        id="fill-blank-input"
        type="text"
        hasIcon={false}
        value={question.answer || ""}
        onChange={(e) => onAnswer(question.id, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
