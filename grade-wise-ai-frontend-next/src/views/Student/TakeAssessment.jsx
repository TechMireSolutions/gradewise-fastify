"use client";

import { cn } from "@/lib/cn.js";
import { card } from "@/lib/ui.js";
import { LoadingSpinner } from "@/components/ui";
import { getExamTranslation } from "@/utils/translations.js";
import useTakeAssessment from "./hooks/useTakeAssessment.js";
import ExamLanguageSelector from "./components/exam/ExamLanguageSelector.jsx";
import ExamHeader from "./components/exam/ExamHeader.jsx";
import ExamQuestionCard from "./components/exam/ExamQuestionCard.jsx";
import ExamNavigation from "./components/exam/ExamNavigation.jsx";

export default function TakeAssessment() {
  const {
    assessmentQuestions,
    currentQuestion,
    currentQuestionIndex,
    timeRemaining,
    questionTimeLeft,
    loading,
    isSubmitting,
    isSubmitted,
    hasStarted,
    selectedLanguage,
    setSelectedLanguage,
    isRTL,
    isQuranic,
    formatTime,
    handleStart,
    handleSubmit,
    handleAnswer,
    goPrevious,
    goNext,
  } = useTakeAssessment();

  if (loading && !hasStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center gap-4 py-32">
          <div className="rounded-full border border-indigo-500/20 bg-indigo-500/10 p-4">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className="text-xl font-bold text-foreground">
            {getExamTranslation(selectedLanguage, "loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", isQuranic && "font-quran")} dir={isRTL ? "rtl" : "ltr"}>
      {/* Pre-Exam Language Selection */}
      {!hasStarted && (
        <ExamLanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          onStart={handleStart}
          loading={loading}
        />
      )}

      {/* Active Exam Running */}
      {hasStarted && !isSubmitted && currentQuestion && (
        <div className="min-h-screen flex flex-col">
          <ExamHeader
            questionTimeLeft={questionTimeLeft}
            timeRemaining={timeRemaining}
            formatTime={formatTime}
          />

          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl space-y-6">
              <ExamQuestionCard
                question={currentQuestion}
                onAnswer={handleAnswer}
              />

              <ExamNavigation
                currentIndex={currentQuestionIndex}
                totalQuestions={assessmentQuestions.length}
                onPrevious={goPrevious}
                onNext={goNext}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Submitted Screen */}
      {isSubmitted && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className={cn(card, "p-8 text-center max-w-xl w-full space-y-4 shadow-2xl")}>
            <h1 className="text-2xl font-bold text-foreground text-balance">
              {getExamTranslation(selectedLanguage, "submittedTitle")}
            </h1>
            <p className="text-muted-foreground text-pretty">
              {getExamTranslation(selectedLanguage, "submittedMsg")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
