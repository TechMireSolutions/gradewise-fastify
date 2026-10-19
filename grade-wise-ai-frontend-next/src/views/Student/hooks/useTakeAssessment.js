"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import useStudentAssessmentStore from "@/features/student-assessment/store.js";
import toast from "react-hot-toast";
import useModal from "@/hooks/useModal.js";

export default function useTakeAssessment() {
  const { assessmentId } = useParams();
  const router = useRouter();

  const {
    assessmentQuestions,
    timeRemaining,
    loading,
    error,
    startAssessment,
    updateAnswer,
    submitAssessment,
    isSubmitted,
    hasStarted,
    clearError,
  } = useStudentAssessmentStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { showModal } = useModal();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRTL, setIsRTL] = useState(false);

  const isQuranic = ["ar", "fa"].includes(selectedLanguage);

  useEffect(() => {
    if (hasStarted) {
      setIsRTL(["ur", "ar", "fa"].includes(selectedLanguage));
    }
  }, [hasStarted, selectedLanguage]);

  const handleStart = async () => {
    try {
      await startAssessment(assessmentId, selectedLanguage);
      toast.success("Assessment started!");
    } catch (err) {
      toast.error(err.message || "Failed to start assessment");
    }
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || isSubmitted) return;
    setIsSubmitting(true);
    try {
      await submitAssessment(assessmentId);
      showModal("success", "Submitted!", "Your assessment has been submitted successfully.");
      toast.success("Submitted successfully!");
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, isSubmitted, submitAssessment, assessmentId, showModal]);

  // Overall Exam Timer
  useEffect(() => {
    if (timeRemaining > 0 && hasStarted && !isSubmitted) {
      const timer = setInterval(() => {
        useStudentAssessmentStore.setState((prev) => {
          if (prev.timeRemaining <= 1) {
            handleSubmit();
            return { timeRemaining: 0 };
          }
          return { timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining <= 0 && hasStarted && !isSubmitted) {
      handleSubmit();
    }
  }, [timeRemaining, hasStarted, isSubmitted, handleSubmit]);

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const perQuestionTime =
    currentQuestion?.duration_per_question || currentQuestion?.durationPerQuestion || 30;
  const [questionTimeLeft, setQuestionTimeLeft] = useState(perQuestionTime);

  useEffect(() => {
    setQuestionTimeLeft(perQuestionTime);
  }, [currentQuestionIndex, perQuestionTime]);

  // Question Timer with Auto-advance
  useEffect(() => {
    if (!hasStarted || isSubmitted || questionTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1 && currentQuestionIndex < assessmentQuestions.length - 1) {
          setCurrentQuestionIndex((i) => i + 1);
          return perQuestionTime;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [
    questionTimeLeft,
    hasStarted,
    isSubmitted,
    currentQuestionIndex,
    assessmentQuestions.length,
    perQuestionTime,
  ]);

  const goPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  };

  const goNext = () => {
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const handleAnswer = (qid, answer) => {
    updateAnswer(qid, answer);
  };

  useEffect(() => {
    if (error) {
      showModal("error", "Error", error);
      clearError();
    }
  }, [error, clearError, showModal]);

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        router.push("/student/dashboard");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, router]);

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return {
    assessmentId,
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
  };
}
