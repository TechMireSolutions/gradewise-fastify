"use client";

import { cn } from "@/lib/cn.js";
import { btn, card, page, pageInner } from "@/lib/ui.js";
import Link from "next/link";
import { LoadingSpinner, Modal } from "@/components/ui/index.js";
import { FaExclamationCircle, FaArrowLeft } from "react-icons/fa";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import { PhysicalPaperModal } from "@/components/paper/index.js";
import useAssessmentDetail from "./hooks/useAssessmentDetail.js";
import AssessmentDetailHeader from "./components/AssessmentDetailHeader.jsx";
import AssessmentBasicInfo from "./components/AssessmentBasicInfo.jsx";
import AssessmentBlocksDisplay from "./components/AssessmentBlocksDisplay.jsx";
import AssessmentResourcesDisplay from "./components/AssessmentResourcesDisplay.jsx";

export default function AssessmentDetail() {
  const {
    currentAssessment,
    isLoading,
    error,
    isCloning,
    handleClone,
    paperModal,
    openPaperModal,
    closePaperModal,
    modal,
    closeModal,
  } = useAssessmentDetail();

  if (isLoading) {
    return (
      <div className={page}>
        <AmbientBackground />
        <div className="relative flex flex-col items-center justify-center py-32 gap-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className="text-muted-foreground text-sm">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !currentAssessment) {
    return (
      <div className={page}>
        <AmbientBackground />
        <div className="relative max-w-2xl mx-auto px-4 py-16">
          <div className={cn(card, "shadow-2xl")}>
            <div className="flex flex-col items-center justify-center py-28 text-center px-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center mb-6">
                <FaExclamationCircle className="text-red-400 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Assessment Not Found</h3>
              <p className="text-muted-foreground max-w-sm mb-8">
                The requested assessment could not be loaded. It may have been deleted or you don&apos;t have access to it.
              </p>
              <Link
                href="/instructor/assessments"
                className={cn(btn.primary, "px-5 py-3 inline-flex items-center gap-2 cursor-pointer")}
              >
                <FaArrowLeft /> Back to Assessments
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={page}>
      <AmbientBackground />

      <div className={pageInner}>
        {/* Header Section */}
        <div className={cn(card, "shadow-xl overflow-hidden mb-8")}>
          <AssessmentDetailHeader
            assessment={currentAssessment}
            isCloning={isCloning}
            onClone={handleClone}
            onOpenPaper={openPaperModal}
          />

          <div className="p-6 sm:p-8 space-y-8">
            {/* Basic Info & Timeline */}
            <AssessmentBasicInfo assessment={currentAssessment} />

            {/* Question Blocks */}
            <div className="border-t border-border" />
            <AssessmentBlocksDisplay blocks={currentAssessment.question_blocks} />

            {/* Resources */}
            <AssessmentResourcesDisplay resources={currentAssessment.resources} />
          </div>
        </div>
      </div>

      {/* Physical Paper Modal */}
      {paperModal.isOpen && (
        <PhysicalPaperModal
          isOpen={paperModal.isOpen}
          onClose={closePaperModal}
          assessmentId={paperModal.assessmentId}
          assessmentTitle={paperModal.title}
          assessment={currentAssessment}
        />
      )}

      {/* Feedback Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
}
