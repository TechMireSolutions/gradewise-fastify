import { useState, useEffect } from "react";
import useResourceStore from "@/features/resources/store.js";
import useModal from "@/hooks/useModal.js";
import { validateFiles } from "@/schemas/resourceSchemas.js";

export default function useResourceManagement() {
  const {
    resources,
    fetchResources,
    uploadResources,
    deleteResource,
  } = useResourceStore();

  const { modal, showModal, closeModal } = useModal();
  const [dragActive, setDragActive] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    resourceId: null,
    resourceName: "",
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setIsInitialLoading(true);
        await fetchResources();
      } catch (error) {
        if (!isMounted) return;
        showModal(
          "error",
          "Error",
          error.response?.data?.message || "Failed to load resources"
        );
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target?.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files) => {
    const validation = validateFiles(files);
    if (!validation.isValid) {
      showModal("error", "Invalid Files", validation.errors.join("\n"));
      return;
    }

    try {
      setIsUploading(true);
      await uploadResources(files);
      await fetchResources();
      showModal(
        "success",
        "Upload Complete",
        `Successfully uploaded ${files.length} resource${files.length > 1 ? "s" : ""}. They have been vectorized for assessment generation.`
      );
    } catch (error) {
      showModal(
        "error",
        "Upload Failed",
        error.response?.data?.message || error.message || "Failed to upload resources."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const openDeleteConfirm = (resource) => {
    setDeleteConfirm({
      isOpen: true,
      resourceId: resource.id,
      resourceName: resource.name || resource.title || "this resource",
    });
  };

  const closeDeleteConfirm = () => {
    if (!isDeleting) {
      setDeleteConfirm({
        isOpen: false,
        resourceId: null,
        resourceName: "",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.resourceId) return;
    try {
      setIsDeleting(true);
      await deleteResource(deleteConfirm.resourceId);
      closeDeleteConfirm();
      showModal("success", "Deleted", "Resource removed successfully.");
    } catch (error) {
      showModal(
        "error",
        "Error",
        error.response?.data?.message || "Failed to delete resource."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return {
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
  };
}
