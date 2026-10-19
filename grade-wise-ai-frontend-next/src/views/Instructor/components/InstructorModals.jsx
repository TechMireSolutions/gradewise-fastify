import Modal from "@/components/ui/Modal.jsx";
import { PhysicalPaperModal } from "@/components/paper/index.js";

export default function InstructorModals({
  paperModal,
  onClosePaperModal,
  deleteConfirm,
  onCloseDeleteConfirm,
  onConfirmDelete,
  isDeleting,
  modal,
  onCloseModal,
}) {
  return (
    <>
      {/* Physical Paper Modal */}
      <PhysicalPaperModal
        isOpen={paperModal.isOpen}
        onClose={onClosePaperModal}
        assessmentId={paperModal.assessmentId}
        assessmentTitle={paperModal.title}
        assessment={paperModal.assessment}
      />

      {/* General Feedback Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={onCloseModal}
        type={modal.type}
        title={modal.title}
      >
        {modal.message}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={onCloseDeleteConfirm}
        loading={isDeleting}
        type="warning"
        title="Delete Assessment?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={onConfirmDelete}
      >
        Are you sure you want to delete{" "}
        <strong className="text-foreground">{deleteConfirm.title}</strong>?
        This action cannot be undone.
      </Modal>
    </>
  );
}
