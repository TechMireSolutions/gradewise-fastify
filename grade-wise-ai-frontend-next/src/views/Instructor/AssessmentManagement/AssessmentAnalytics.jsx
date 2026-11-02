"use client";

import { cn } from "@/lib/cn.js";
import { card, iconBadge, page, pageInner } from "@/lib/ui.js";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import useInstructorAnalyticsStore from "@/features/instructor-analytics/store.js";
import { FaChartBar, FaArrowUp, FaExclamationTriangle } from "react-icons/fa";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import AnalyticsAssessmentPicker from "./components/AnalyticsAssessmentPicker.jsx";
import AnalyticsStudentTable from "./components/AnalyticsStudentTable.jsx";
import AnalyticsQuestionReview from "./components/AnalyticsQuestionReview.jsx";

export default function AssessmentAnalytics() {
  const params = useParams();
  const rawId = params?.id || params?.assessmentId;
  const assessmentId = rawId && rawId !== ":assessmentId" ? rawId : null;
  const router = useRouter();

  const {
    loading,
    error,
    assessments,
    students,
    fetchAssessments,
    fetchAssessmentStudents,
    fetchStudentQuestions,
    studentQuestions,
    selectedStudentId,
  } = useInstructorAnalyticsStore();

  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const assessmentsRef = useRef(null);
  const studentsRef = useRef(null);
  const questionsRef = useRef(null);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  useEffect(() => {
    const isValid = assessmentId && !isNaN(Number(assessmentId));
    if (isValid) {
      fetchAssessmentStudents(assessmentId);
      const assessment = assessments.find((a) => a.id === Number(assessmentId));
      setSelectedAssessment(assessment || null);
    } else {
      setSelectedAssessment(null);
    }
  }, [assessmentId, assessments, fetchAssessmentStudents]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (assessmentId && !isNaN(Number(assessmentId)) && students.length > 0) {
      setTimeout(() => {
        studentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [assessmentId, students]);

  useEffect(() => {
    if (selectedStudentId && studentQuestions.length > 0) {
      setTimeout(() => {
        questionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [selectedStudentId, studentQuestions]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectAssessment = (id) => {
    router.push(`/instructor/assessments/${id}/analytics`);
  };

  const handleViewStudentAnswers = (studentId) => {
    if (assessmentId) {
      fetchStudentQuestions(assessmentId, studentId);
    }
  };

  const handleScrollToAssessments = () => {
    setTimeout(() => {
      assessmentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  if (loading && assessments.length === 0) {
    return (
      <div className={cn(page, "flex flex-col items-center justify-center")}>
        <AmbientBackground />
        <div className="relative flex flex-col items-center justify-center py-32 gap-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className="text-muted-foreground text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(page, "flex items-center justify-center px-4")}>
        <AmbientBackground />
        <div className={cn("relative w-full max-w-md", card, "shadow-2xl p-8 text-center")}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
            <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Error</h3>
          <p className="text-red-700 dark:text-red-400 font-medium text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={page}>
      <AmbientBackground />

      <MainLandmark className={pageInner}>
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className={cn("p-2.5 rounded-xl", iconBadge)}>
              <FaChartBar className="text-white text-xl" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight text-balance">
              Assessment Analytics
            </h1>
          </div>
          <p className="text-muted-foreground text-pretty">
            Monitor student completion, accuracy rates, and question-level performance breakdowns
          </p>
        </div>

        {/* Executed Assessments Selector */}
        <div ref={assessmentsRef} className="scroll-mt-24 mb-8">
          <AnalyticsAssessmentPicker
            assessments={assessments}
            selectedAssessmentId={assessmentId}
            onSelectAssessment={handleSelectAssessment}
          />
        </div>

        {/* Student Results Table & Cards */}
        {assessmentId && !isNaN(Number(assessmentId)) && (
          <div ref={studentsRef} className="scroll-mt-24">
            <AnalyticsStudentTable
              students={students}
              assessmentTitle={selectedAssessment?.title}
              onViewStudentAnswers={handleViewStudentAnswers}
            />
          </div>
        )}

        {/* Question-by-Question Review */}
        {selectedStudentId && studentQuestions.length > 0 && (
          <div ref={questionsRef} className="scroll-mt-24">
            <AnalyticsQuestionReview
              studentQuestions={studentQuestions}
              onScrollToAssessments={handleScrollToAssessments}
            />
          </div>
        )}
      </MainLandmark>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-full shadow-2xl shadow-indigo-500/30 transform hover:scale-110 transition-all duration-300 animate-fade-in cursor-pointer"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="text-xl" />
        </button>
      )}
    </div>
  );
}
