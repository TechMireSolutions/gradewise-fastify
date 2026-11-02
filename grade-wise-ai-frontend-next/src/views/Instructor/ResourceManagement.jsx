"use client";

import { page, pageInner, btn, focusRing } from "@/lib/ui.js";
import { useRouter } from "next/navigation";
import { FaBook, FaArrowLeft } from "react-icons/fa";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import WelcomeBanner from "@/components/layout/WelcomeBanner.jsx";
import Modal from "@/components/ui/Modal.jsx";
import useResourceManagement from "./hooks/useResourceManagement.js";
import ResourceStats from "./components/ResourceStats.jsx";
import ResourceUploadArea from "./components/ResourceUploadArea.jsx";
import ResourceList from "./components/ResourceList.jsx";
import { cn } from "@/lib/cn.js";

function ResourceManagement() {
  const router = useRouter();
  const {
    resources,
    isInitialLoading,
    isUploading,
    isDeleting,
    dragActive,
    handleDrag,
    handleDrop,
    handleFileInput,
    deleteConfirm,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDeleteConfirm,
    modal,
    closeModal,
  } = useResourceManagement();

  return (
    <div className={page}>
      <AmbientBackground />

      <MainLandmark className={pageInner}>
        <div className="mb-8">
          <WelcomeBanner
            eyebrow="Instructor Workspace"
            title="Manage Resources"
            description="Upload and organize source materials for automated, context-grounded question generation."
            icon={FaBook}
            aside={
              <button
                type="button"
                onClick={() => router.push("/instructor/assessments")}
                className={cn(btn.secondary, "self-start sm:self-auto", focusRing)}
              >
                <FaArrowLeft className="text-xs" aria-hidden="true" />
                <span>Back to Assessments</span>
              </button>
            }
          />
        </div>

        <ResourceStats
          resources={resources}
          loading={isInitialLoading}
        />

        <ResourceUploadArea
          isUploading={isUploading}
          dragActive={dragActive}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onFileInput={handleFileInput}
        />

        <ResourceList
          resources={resources}
          loading={isInitialLoading}
          onOpenDelete={openDeleteConfirm}
        />
      </MainLandmark>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={closeDeleteConfirm}
        loading={isDeleting}
        type="warning"
        title="Delete Resource?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
      >
        Are you sure you want to delete{" "}
        <strong className="text-foreground">{deleteConfirm.resourceName}</strong>?
        This action cannot be undone.
      </Modal>

      {/* Feedback Modal */}
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

export default ResourceManagement;
