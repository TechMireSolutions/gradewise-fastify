"use client";

import { cn } from "@/lib/cn.js";
import {
  btn,
  focusRing,
  iconBadge,
  page,
  pageInner,
  pageTitle,
  pageDesc,
} from "@/lib/ui.js";
import Link from "next/link";
import { EmptyState, LoadingSpinner, Button, Modal } from "@/components/ui/index.js";
import { FaPlus, FaClipboardList } from "react-icons/fa";
import { PhysicalPaperModal } from "@/components/paper/index.js";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import useAssessmentList from "./hooks/useAssessmentList.js";
import AssessmentSearchControls from "./components/AssessmentSearchControls.jsx";
import AssessmentTable from "./components/AssessmentTable.jsx";
import AssessmentGrid from "./components/AssessmentGrid.jsx";
import AssessmentDeleteModal from "./components/AssessmentDeleteModal.jsx";

export default function AssessmentList() {
  const {
    assessments,
    filteredAssessments,
    loading,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    cloningId,
    handleCloneAssessment,
    isDeleting,
    deleteConfirm,
    requestDelete,
    cancelDelete,
    handleDeleteConfirm,
    paperModal,
    openPaperModal,
    closePaperModal,
    modal,
    closeModal,
  } = useAssessmentList();

  if (loading && assessments.length === 0) {
    return (
      <div className={cn(page, "flex items-center justify-center")}>
        <AmbientBackground />
        <div className="relative flex flex-col items-center justify-center py-32 gap-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className="text-muted-foreground text-sm">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={page}>
      <AmbientBackground />

      <div className={pageInner}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(iconBadge, "p-2 rounded-lg")}>
                <FaClipboardList className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <h1 className={pageTitle}>Assessments</h1>
            </div>
            <p className={pageDesc}>
              Manage, enroll students, and monitor your educational assessments
            </p>
          </div>
          <Link
            href="/instructor/assessments/create"
            className={cn(btn.primary, "shrink-0", focusRing)}
          >
            <FaPlus aria-hidden="true" />
            <span>Create Assessment</span>
          </Link>
        </div>

        {/* Search & View Controls */}
        <AssessmentSearchControls
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Content Listing */}
        {filteredAssessments.length === 0 ? (
          <EmptyState
            title="No Assessments Found"
            description={
              searchTerm
                ? "No assessments match your search criteria. Try a different query."
                : "You haven't created any assessments yet. Click 'Create Assessment' to get started."
            }
            action={
              searchTerm ? (
                <Button variant="secondary" size="sm" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              ) : (
                <Link
                  href="/instructor/assessments/create"
                  className={cn(btn.primary, focusRing)}
                >
                  <FaPlus aria-hidden="true" />
                  <span>Create Assessment</span>
                </Link>
              )
            }
          />
        ) : viewMode === "table" ? (
          <AssessmentTable
            assessments={filteredAssessments}
            cloningId={cloningId}
            onClone={handleCloneAssessment}
            onOpenPaper={openPaperModal}
            onRequestDelete={requestDelete}
          />
        ) : (
          <AssessmentGrid
            assessments={filteredAssessments}
            cloningId={cloningId}
            onClone={handleCloneAssessment}
            onOpenPaper={openPaperModal}
            onRequestDelete={requestDelete}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AssessmentDeleteModal
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        onClose={cancelDelete}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Physical Paper Generation Modal */}
      {paperModal.isOpen && (
        <PhysicalPaperModal
          isOpen={paperModal.isOpen}
          onClose={closePaperModal}
          assessmentId={paperModal.assessmentId}
          assessmentTitle={paperModal.title}
          assessment={paperModal.assessment}
        />
      )}

      {/* General Feedback Modal */}
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
