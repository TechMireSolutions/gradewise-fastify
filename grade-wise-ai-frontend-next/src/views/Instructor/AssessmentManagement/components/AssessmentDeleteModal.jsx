"use client";

import Modal from "@/components/ui/Modal.jsx";
import Button from "@/components/ui/Button.jsx";

export default function AssessmentDeleteModal({
  isOpen = false,
  title = "",
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Assessment"
      type="warning"
      message={`Are you sure you want to permanently delete "${title}"? This action cannot be undone.`}
      actions={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </div>
      }
    />
  );
}
