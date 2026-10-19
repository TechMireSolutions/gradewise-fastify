"use client";

import { page, pageInner } from "@/lib/ui.js";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import useInstructorDashboard from "./hooks/useInstructorDashboard.js";
import InstructorHeader from "./components/InstructorHeader.jsx";
import InstructorStats from "./components/InstructorStats.jsx";
import InstructorQuickActions from "./components/InstructorQuickActions.jsx";
import InstructorRecentAssessments from "./components/InstructorRecentAssessments.jsx";
import InstructorModals from "./components/InstructorModals.jsx";

function InstructorDashboard() {
  const {
    user,
    assessments,
    overview,
    isInitialLoading,
    isDeleting,
    modal,
    closeModal,
    deleteConfirm,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDeleteConfirm,
    paperModal,
    openPaperModal,
    closePaperModal,
  } = useInstructorDashboard();

  return (
    <div className={page}>
      <AmbientBackground />

      <div className={pageInner}>
        <InstructorHeader userName={user?.name} />

        <InstructorStats
          overview={overview}
          loading={isInitialLoading}
        />

        <InstructorQuickActions />

        <InstructorRecentAssessments
          assessments={assessments}
          loading={isInitialLoading}
          onOpenDelete={openDeleteConfirm}
          onOpenPaper={openPaperModal}
        />
      </div>

      <InstructorModals
        paperModal={paperModal}
        onClosePaperModal={closePaperModal}
        deleteConfirm={deleteConfirm}
        onCloseDeleteConfirm={closeDeleteConfirm}
        onConfirmDelete={handleDeleteConfirm}
        isDeleting={isDeleting}
        modal={modal}
        onCloseModal={closeModal}
      />
    </div>
  );
}

export default InstructorDashboard;
