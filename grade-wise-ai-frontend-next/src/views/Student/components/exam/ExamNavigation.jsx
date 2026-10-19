"use client";

import { Button } from "@/components/ui";
import useStudentAssessmentStore from "@/features/student-assessment/store.js";
import { getExamTranslation } from "@/utils/translations.js";

export default function ExamNavigation({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
}) {
  const language = useStudentAssessmentStore((s) => s.language) || "en";
  const isLastQuestion = currentIndex >= totalQuestions - 1;

  const prevText = getExamTranslation(language, "previousQuestion");
  const nextText = getExamTranslation(language, "nextQuestion");
  const submitText = getExamTranslation(language, "submitExam");
  const submittingText = getExamTranslation(language, "submittingExam");

  return (
    <div className="flex justify-between items-center gap-3 pt-2">
      <Button
        type="button"
        variant="secondary"
        onClick={onPrevious}
        disabled={currentIndex === 0 || isSubmitting}
      >
        {prevText}
      </Button>

      {isLastQuestion ? (
        <Button
          type="button"
          variant="success"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-6 font-bold"
        >
          {isSubmitting ? submittingText : submitText}
        </Button>
      ) : (
        <Button
          type="button"
          variant="primary"
          onClick={onNext}
          disabled={isSubmitting}
        >
          {nextText}
        </Button>
      )}
    </div>
  );
}
