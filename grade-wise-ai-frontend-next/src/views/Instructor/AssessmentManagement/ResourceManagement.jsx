import { cn } from "@/lib/cn.js";
import { card, cardHeader, cardInteractive, page } from "@/lib/ui.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useResourceStore from "@/features/resources/store.js";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Modal from "../../../components/ui/Modal";
import { validateFiles } from "../../../schemas/resourceSchema.js";
import { FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileAlt, FaImage, FaFolder, FaUpload, FaBook, FaInfoCircle, FaTrash, FaArrowLeft, FaDatabase } from "react-icons/fa";
import AmbientBackground from "../../../components/layout/AmbientBackground.jsx";
import useModal from "../../../hooks/useModal.js";

function ResourceManagement() {
  const navigate = useNavigate();
  const { resources, loading, fetchResources, uploadResources, deleteResource, clearCurrentResource } = useResourceStore();
  const { modal, showModal, closeModal } = useModal();
  const [dragActive, setDragActive] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    fetchResources();
    return () => clearCurrentResource();
  }, [fetchResources, clearCurrentResource]);

  const handleResourceUpload = async (e) => {
    const files = Array.from(e.target.files);

    // Validate files using Zod
    const validation = validateFiles(files);
    if (!validation.success) {
      showModal("error", "Validation Error", validation.error);
      return;
    }

    try {
      await uploadResources(files);
      showModal("success", "Success", `${files.length} resource(s) uploaded and chunked successfully.`);
      fetchResources();
    } catch (error) {
      showModal("error", "Error", error.message || "Failed to upload resources.");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);

    // Validate files using Zod
    const validation = validateFiles(files);
    if (!validation.success) {
      showModal("error", "Validation Error", validation.error);
      return;
    }

    try {
      await uploadResources(files);
      showModal("success", "Upload Successful", `${files.length} resource(s) uploaded and processed successfully.`);
      fetchResources();
    } catch (error) {
      showModal("error", "Upload Failed", error.message || "Failed to upload resources.");
    }
  };

  const handleDeleteClick = (resourceId) => {
    setPendingDeleteId(resourceId);
    showModal("warning", "Confirm Deletion", "Are you sure you want to delete this resource? This action cannot be undone.");
  };

  const confirmDeleteResource = async () => {
    if (!pendingDeleteId) return;

    try {
      await deleteResource(pendingDeleteId);
      showModal("success", "Success", "Resource deleted successfully.");
      fetchResources();
    } catch (error) {
      showModal("error", "Error", error.message || "Failed to delete resource.");
    } finally {
      setPendingDeleteId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
  };

  const getFileIcon = (fileType) => {
    const type = fileType?.toLowerCase() || '';
    if (type.includes('pdf')) return <FaFilePdf className="text-red-400" />;
    if (type.includes('doc')) return <FaFileWord className="text-blue-400" />;
    if (type.includes('ppt') || type.includes('presentation')) return <FaFilePowerpoint className="text-amber-400" />;
    if (type.includes('txt') || type.includes('text')) return <FaFileAlt className={"text-muted-foreground"} />;
    if (type.includes('image') || type.includes('jpg') || type.includes('png')) return <FaImage className="text-violet-400" />;
    return <FaFolder className="text-emerald-400" />;
  };

  const getFileTypeBadge = (fileType) => {
    const type = fileType?.toLowerCase() || '';
    if (type.includes('pdf')) return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20';
    if (type.includes('doc')) return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20';
    if (type.includes('ppt')) return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20';
    if (type.includes('txt')) return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-btn-secondary text-muted-foreground border border-border';
    if (type.includes('image')) return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/20';
    return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';
  };

  if (loading) {
    return (
      <div className={cn(page, "flex", "items-center", "justify-center")}>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className={cn("text-muted-foreground", "text-sm")}>Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={page}>
      {/* Ambient blobs */}
      <AmbientBackground />

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
              <FaBook className="text-white text-lg" />
            </div>
            <div>
              <p className={cn("text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-widest", "mb-0.5")}>Instructor</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Manage Resources</h1>
              <p className={cn("text-muted-foreground", "text-sm", "mt-1")}>Upload and organize your educational materials</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/instructor/assessments")}
            className={cn("px-4", "py-2.5", "bg-btn-secondary", "hover:bg-surface-elevated", "border", "border-border", "text-secondary-foreground", "hover:text-foreground", "rounded-xl", "font-medium", "text-sm", "transition-all", "duration-200", "active:scale-95", "cursor-pointer", "inline-flex", "items-center", "gap-2")}
          >
            <FaArrowLeft className="text-xs" />
            Back to Assessments
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-bold text-foreground leading-none">{resources.length}</p>
            <p className={cn("text-xs", "text-muted-foreground", "mt-0.5")}>Total Resources</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-bold text-foreground leading-none">
              {resources.filter(r => (r.file_type || r.content_type)?.toLowerCase().includes('pdf')).length}
            </p>
            <p className={cn("text-xs", "text-muted-foreground", "mt-0.5")}>PDF Documents</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 rounded-xl p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-bold text-foreground leading-none">
              {resources.filter(r => !(r.file_type || r.content_type)?.toLowerCase().includes('pdf')).length}
            </p>
            <p className={cn("text-xs", "text-muted-foreground", "mt-0.5")}>Other Files</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className={cn(card, cardInteractive, "shadow-2xl", "mb-8")}>
          <div className={cardHeader}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <FaUpload className="text-white text-sm" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Upload New Resources</h2>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="space-y-5">
              {/* Drag and Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-border bg-card/60 hover:border-indigo-500/50 hover:bg-indigo-500/5'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                  onChange={handleResourceUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="file-upload"
                />
                <div className="pointer-events-none">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-5">
                    <FaUpload className={`text-2xl transition-colors duration-200 ${dragActive ? 'text-indigo-300' : 'text-indigo-400'}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {dragActive ? 'Drop files here' : 'Drag and drop files here'}
                  </h3>
                  <p className={cn("text-muted-foreground", "mb-5", "text-sm")}>or click to browse your device</p>
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 cursor-pointer pointer-events-auto"
                  >
                    <FaUpload className="text-xs" />
                    Choose Files
                  </label>
                </div>
              </div>

              {/* Info Section */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                <div className="flex gap-3 items-start">
                  <FaInfoCircle className="text-indigo-400 text-base mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-indigo-300 mb-1">Supported Formats</p>
                    <p className={cn("text-sm", "text-muted-foreground")}>
                      PDF, DOC, DOCX, TXT, PPT, PPTX, JPG, JPEG, PNG, WEBP (Max: 10MB each)
                    </p>
                    <p className={cn("text-xs", "text-muted-foreground", "mt-2", "flex", "items-center", "gap-1.5")}>
                      <FaDatabase className="text-indigo-500" />
                      PDFs will be automatically chunked for efficient storage and retrieval
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources List */}
        <div className={cn(card, cardInteractive, "shadow-2xl")}>
          <div className={cardHeader}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                  <FaBook className="text-white text-sm" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Existing Resources</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                {resources.length} {resources.length === 1 ? 'Resource' : 'Resources'}
              </span>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            {resources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-center px-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                  <FaFolder className="text-indigo-400 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">No resources yet</h3>
                <p className={cn("text-muted-foreground", "max-w-sm", "mb-8")}>
                  Upload your first resource to start building your library for assessments
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-input rounded-xl border border-border hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-200 gap-4"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 bg-btn-secondary border border-border rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                        {getFileIcon(resource.file_type || resource.content_type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn("font-semibold", "text-secondary-foreground", "truncate", "mb-2")}>{resource.name}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={getFileTypeBadge(resource.file_type || resource.content_type)}>
                            {(resource.file_type || resource.content_type)?.toUpperCase()}
                          </span>
                          <span className={cn("inline-flex", "items-center", "gap-1.5", "px-2.5", "py-1", "rounded-full", "text-xs", "font-semibold", "bg-btn-secondary", "text-muted-foreground", "border", "border-border")}>
                            {formatFileSize(resource.file_size)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleDeleteClick(resource.id)}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2"
                      >
                        <FaTrash className="text-xs" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => {
          closeModal();
          setPendingDeleteId(null);
        }}
        type={modal.type}
        title={modal.title}
        onConfirm={modal.type === "warning" ? confirmDeleteResource : undefined}
        confirmText="Delete"
        cancelText="Cancel"
      >
        {modal.message}
      </Modal>
    </div>
  );
}

export default ResourceManagement;
