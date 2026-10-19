"use client";

import { cn } from "@/lib/cn.js";
import { card, panel } from "@/lib/ui.js";
import MultipleChoiceRenderer from "./types/MultipleChoiceRenderer.jsx";
import TrueFalseRenderer from "./types/TrueFalseRenderer.jsx";
import ShortAnswerRenderer from "./types/ShortAnswerRenderer.jsx";
import FillInBlankRenderer from "./types/FillInBlankRenderer.jsx";
import MatchingRenderer from "./types/MatchingRenderer.jsx";

export default function ExamQuestionCard({
  question,
  onAnswer,
}) {
  if (!question) return null;

  const rawText = question.question_text || question.questionText || "";
  const rawType = question.question_type || question.questionType || "multiple_choice";

  return (
    <div className={cn(card, "p-6 sm:p-8 space-y-6 shadow-2xl")}>
      <div className={cn(panel, "text-center py-6")}>
        <p className="text-xl font-semibold text-foreground leading-relaxed text-balance">
          {rawText || "No Question Text Found"}
        </p>
      </div>

      {/* Render matching question type */}
      {(rawType === "multiple_choice" || rawType === "multiple-choice") && (
        <MultipleChoiceRenderer question={question} onAnswer={onAnswer} />
      )}

      {(rawType === "true_false" || rawType === "true-false") && (
        <TrueFalseRenderer question={question} onAnswer={onAnswer} />
      )}

      {(rawType === "short_answer" || rawType === "short-answer") && (
        <ShortAnswerRenderer question={question} onAnswer={onAnswer} />
      )}

      {(rawType === "fill_in_the_blank" ||
        rawType === "fill-in-the-blank" ||
        rawType === "fill_in_blank") && (
        <FillInBlankRenderer question={question} onAnswer={onAnswer} />
      )}

      {rawType === "matching" && (
        <MatchingRenderer question={question} onAnswer={onAnswer} />
      )}
    </div>
  );
}
