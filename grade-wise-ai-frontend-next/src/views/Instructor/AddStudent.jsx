"use client";

import { cn } from "@/lib/cn.js";
import { card, cardHeader, focusRing, page } from "@/lib/ui.js";
import { useRouter } from "next/navigation";
import { Modal, StatusBadge } from "@/components/ui/index.js";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import WelcomeBanner from "@/components/layout/WelcomeBanner.jsx";
import {
  FaUser,
  FaUserPlus,
  FaUserGraduate,
} from "react-icons/fa";
import useAddStudent from "./hooks/useAddStudent.js";
import RegisterStudentForm from "./components/RegisterStudentForm.jsx";
import EnrollStudentForm from "./components/EnrollStudentForm.jsx";

function AddStudent({ assessmentId, onStudentAdded, compact = false }) {
  const router = useRouter();
  const {
    mode,
    setMode,
    selectedAssessmentId,
    setSelectedAssessmentId,
    formData,
    errors,
    isLoading,
    enrollLoading,
    assessments,
    handleChange,
    handleRegister,
    handleEnroll,
    modal,
    closeModal,
  } = useAddStudent({ assessmentId, onStudentAdded });

  const formContent =
    mode === "register" ? (
      <RegisterStudentForm
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleRegister}
        isLoading={isLoading}
        compact={compact}
        onCancel={() => router.back()}
      />
    ) : (
      <EnrollStudentForm
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleEnroll}
        isLoading={enrollLoading}
        compact={compact}
        assessmentId={assessmentId}
        selectedAssessmentId={selectedAssessmentId}
        onSelectAssessment={setSelectedAssessmentId}
        assessments={assessments}
        onCancel={() => router.back()}
      />
    );

  // Standalone page layout
  if (!compact) {
    return (
      <div className={page}>
        <AmbientBackground />

        <MainLandmark className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Page header */}
          <div className="mb-6">
            <WelcomeBanner
              eyebrow="Student Management"
              title={mode === "register" ? "Add New Student" : "Enroll Existing Student"}
              description="Register a new student account or enroll an existing student into an assessment."
              icon={FaUserPlus}
            />
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6" role="tablist" aria-label="Student management mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              onClick={() => setMode("register")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer min-h-11",
                focusRing,
                mode === "register"
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-btn-secondary text-secondary-foreground hover:text-foreground hover:bg-surface-elevated border border-border"
              )}
            >
              <FaUserPlus className="text-sm" aria-hidden="true" />
              <span>Register New Student</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "enroll"}
              onClick={() => setMode("enroll")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer min-h-11",
                focusRing,
                mode === "enroll"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-btn-secondary text-secondary-foreground hover:text-foreground hover:bg-surface-elevated border border-border"
              )}
            >
              <FaUserGraduate className="text-sm" aria-hidden="true" />
              <span>Enroll Into Assessment</span>
            </button>
          </div>

          {/* Card */}
          <div className={cn(card, "shadow-2xl overflow-hidden")}>
            <div className={cardHeader}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  {mode === "register" ? "Register Student" : "Enroll Existing Student"}
                </h2>
                <StatusBadge variant={mode === "register" ? "primary" : "success"}>
                  {mode === "register" ? (
                    <>
                      <FaUser className="text-xs" aria-hidden="true" />
                      <span>New Student</span>
                    </>
                  ) : (
                    <>
                      <FaUserGraduate className="text-xs" aria-hidden="true" />
                      <span>Existing Student</span>
                    </>
                  )}
                </StatusBadge>
              </div>
            </div>

            <div className="p-6 sm:p-8">{formContent}</div>
          </div>
        </MainLandmark>

        <Modal
          isOpen={modal.isOpen}
          onClose={closeModal}
          type={modal.type}
          title={modal.title}
        >
          {modal.message}
        </Modal>
      </div>
    );
  }

  // Compact mode (modal embed)
  return (
    <>
      {assessmentId && (
        <div className="mb-4 -mt-2">
          <button
            type="button"
            onClick={() => setMode((m) => (m === "enroll" ? "register" : "enroll"))}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium text-sm transition-colors duration-150 cursor-pointer"
          >
            {mode === "enroll"
              ? "→ Register new student instead"
              : "→ Enroll existing student instead"}
          </button>
        </div>
      )}
      {formContent}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
      >
        {modal.message}
      </Modal>
    </>
  );
}

export default AddStudent;
