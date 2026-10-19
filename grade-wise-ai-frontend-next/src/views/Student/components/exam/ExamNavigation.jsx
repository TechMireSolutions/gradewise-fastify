"use client";

import { Button } from "@/components/ui";

export default function ExamNavigation({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
}) {
  const isLastQuestion = currentIndex >= totalQuestions - 1;

  return (
    <div className="flex justify-between items-center gap-3 pt-2">
      <Button
        type="button"
        variant="secondary"
        onClick={onPrevious}
        disabled={currentIndex === 0 || isSubmitting}
      >
        Previous Question
      </Button>

      {isLastQuestion ? (
        <Button
          type="button"
          variant="success"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-6 font-bold"
        >
          {isSubmitting ? "Submitting Exam..." : "Submit Exam"}
        </Button>
      ) : (
        <Button
          type="button"
          variant="primary"
          onClick={onNext}
          disabled={isSubmitting}
        >
          Next Question
        </Button>
      )}
    </div>
  );
}
