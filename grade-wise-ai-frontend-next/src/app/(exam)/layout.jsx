"use client";

import useStudentAssessmentStore from "@/store/studentAssessmentStore";
import useHydrated from "@/hooks/useHydrated";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ExamLayout({ children }) {
  const { language, hasStarted } = useStudentAssessmentStore();
  const hydrated = useHydrated();

  // Handle SSR hydration safety
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner size="lg" type="spinner" color="blue" />
      </div>
    );
  }

  const isRTL = ["ur", "ar", "fa"].includes(language);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-slate-100" dir={isRTL ? "rtl" : "ltr"}>
      {children}
    </main>
  );
}
