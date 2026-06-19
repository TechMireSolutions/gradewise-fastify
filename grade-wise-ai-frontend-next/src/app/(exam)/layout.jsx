"use client";

import { cn } from "@/lib/cn.js";
import { page } from "@/lib/ui.js";
import useStudentAssessmentStore from "@/features/student-assessment/store.js";
import useHydrated from "@/hooks/useHydrated";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import MainLandmark from "@/components/layout/MainLandmark.jsx";

export default function ExamLayout({ children }) {
  const { language } = useStudentAssessmentStore();
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" type="spinner" color="blue" />
      </div>
    );
  }

  const isRTL = ["ur", "ar", "fa"].includes(language);

  return (
    <MainLandmark className={cn(page, "min-h-screen")} dir={isRTL ? "rtl" : "ltr"}>
      {children}
    </MainLandmark>
  );
}
