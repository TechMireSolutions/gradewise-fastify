import { cn } from "@/lib/cn.js";
import { card, cardInteractive, page } from "@/lib/ui.js";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAssessmentStore from "@/features/assessments/store.js";
import useResourceStore from "@/features/resources/store.js";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Modal from "../../../components/ui/Modal";
import { validateAssessmentForm, validateFiles } from "../../../schemas/editAssessmentSchemas.js";
import { FaArrowLeft, FaExclamationTriangle, FaClipboardList, FaLink, FaPlus, FaTrash, FaBook, FaFile, FaTimes, FaQuestionCircle, FaSave } from "react-icons/fa";
import AmbientBackground from "../../../components/layout/AmbientBackground.jsx";
import useModal from "../../../hooks/useModal.js";

function EditAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentAssessment, loading, error, getAssessmentById, updateAssessment } = useAssessmentStore();
  const { resources, fetchAllResources, loading: resourcesLoading } = useResourceStore();
    const { modal, showModal, closeModal } = useModal();


  useEffect(() => {
    fetchAllResources();
  }, [fetchAllResources]);

  useEffect(() => {
    if (!currentAssessment || currentAssessment.id !== Number(id)) {
      getAssessmentById(id);
    }
  }, [id, currentAssessment, getAssessmentById]);

  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
    externalLinks: [""],
  });

  const [questionBlocks, setQuestionBlocks] = useState([
    {
      question_type: "multiple_choice",
      question_count: 1,
      duration_per_question: 120,
      num_options: 4,
      positive_marks: 1,
      negative_marks: 0,
    },
  ]);

  const [selectedResources, setSelectedResources] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [questionBlocksTouched, setQuestionBlocksTouched] = useState(false);

  useEffect(() => {
    if (currentAssessment) {
      setFormData({
        title: currentAssessment.title || "",
        prompt: currentAssessment.prompt || "",
        externalLinks: Array.isArray(currentAssessment.external_links) ? currentAssessment.external_links : [""],
      });
      setQuestionBlocks(
        Array.isArray(currentAssessment.question_blocks) && currentAssessment.question_blocks.length > 0
          ? currentAssessment.question_blocks.map(block => ({
            question_type: block.question_type || "multiple_choice",
            question_count: Number(block.question_count) || 1,
            duration_per_question: Number(block.duration_per_question) || 120,
            num_options: Number(block.num_options) || 4,
            positive_marks: Number(block.positive_marks) || 1,
            negative_marks: Number(block.negative_marks) || 0,
          }))
          : [{ question_type: "multiple_choice", question_count: 1, duration_per_question: 120, num_options: 4, positive_marks: 1, negative_marks: 0 }]
      );
      setSelectedResources(
        Array.isArray(currentAssessment.resources)
          ? currentAssessment.resources.map(r => r.id).filter(id => id && !isNaN(id))
          : []
      );
    }
  }, [currentAssessment]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlockChange = (index, field, value) => {
    setQuestionBlocksTouched(true);
    setQuestionBlocks((prev) =>
      prev.map((block, i) =>
        i === index
          ? {
              ...block,
              [field]:
                field === "question_count" || field === "duration_per_question" || field === "num_options"
                  ? Math.max(Number.parseInt(value) || 1, 1)
                  : field === "positive_marks" || field === "negative_marks"
                    ? value === "" || value === null
                      ? null
                      : Math.max(Number.parseFloat(value) || 0, 0)
                    : value,
            }
          : block
      )
    );
  };

  const addQuestionBlock = () => {
    setQuestionBlocksTouched(true);
    setQuestionBlocks((prev) => [
      ...prev,
      {
        question_type: "multiple_choice",
        question_count: 1,
        duration_per_question: 120,
        num_options: 4,
        positive_marks: 1,
        negative_marks: 0,
      },
    ]);
  };

  const removeQuestionBlock = (index) => {
    setQuestionBlocksTouched(true);
    if (questionBlocks.length > 1) {
      setQuestionBlocks((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const addExternalLink = () => {
    setFormData((prev) => ({
      ...prev,
      externalLinks: [...prev.externalLinks, ""],
    }));
  };

  const removeExternalLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      externalLinks: prev.externalLinks.filter((_, i) => i !== index),
    }));
  };

  const handleLinkChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      externalLinks: prev.externalLinks.map((link, i) => (i === index ? value : link)),
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate files using Zod
    const validation = validateFiles(files);
    if (!validation.success) {
      showModal("error", "File Validation Error", validation.error);
      e.target.value = ''; // Clear the input
      return;
    }

    setNewFiles(files);
  };

  const handleResourceToggle = (resourceId) => {
    setSelectedResources((prev) =>
      prev.includes(resourceId) ? prev.filter((id) => id !== resourceId) : [...prev, resourceId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form using Zod
    const validation = validateAssessmentForm({
      title: formData.title,
      prompt: formData.prompt,
      externalLinks: formData.externalLinks,
      questionBlocks,
      selectedResources,
      newFiles
    });

    if (!validation.success) {
      showModal("error", "Validation Error", validation.error);
      return;
    }

    setIsProcessing(true);

    const assessmentData = {
      title: formData.title.trim(),
      ...(formData.prompt?.trim() && { prompt: formData.prompt.trim() }),
      externalLinks: formData.externalLinks.filter(l => l.trim()),
      selectedResources,
      ...(questionBlocksTouched && {
        questionBlocks: questionBlocks.map(b => ({
          questionType: b.question_type,
          questionCount: Number(b.question_count),
          durationPerQuestion: Number(b.duration_per_question),
          numOptions: b.question_type === "multiple_choice" ? (Number(b.num_options) || 4) : 4,
          leftCount: b.question_type === "matching" ? (Number(b.num_first_side) || 3) : 3,
          rightCount: b.question_type === "matching" ? (Number(b.num_second_side) || 4) : 4,
          positiveMarks: Number(b.positive_marks) || 1,
          negativeMarks: Number(b.negative_marks) || 0,
        })),
      }),
    };

    try {
      await updateAssessment(parseInt(id), assessmentData);
      showModal("success", "Success!", "Assessment updated!");
      setTimeout(() => navigate("/instructor/assessments"), 1500);
    } catch (err) {
      console.error("DEBUG: Frontend EditAssessment - Update error:", err);
      showModal("error", "Error", err.message || "Update failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !currentAssessment) {
    return (
      <div className={cn(page, "flex", "flex-col", "justify-center", "items-center")}>
        <AmbientBackground />
        <div className="relative flex flex-col items-center justify-center py-32 gap-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className={cn("text-muted-foreground", "text-sm")}>Loading assessment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={page}>
        <AmbientBackground />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className={cn(card, "shadow-2xl", "p-8")}>
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center mb-6 mx-auto">
                <FaExclamationTriangle className="text-red-400 text-3xl" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Error</h1>
              <p className={cn("text-muted-foreground", "mb-8")}>{error}</p>
              <button
                onClick={() => navigate("/instructor/assessments")}
                className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <FaArrowLeft />
                Back to Assessments
              </button>
            </div>
          </div>
        </div>
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

  return (
    <div className={page}>
      {/* Ambient blobs */}
      <AmbientBackground />

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => navigate("/instructor/assessments")}
              className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors duration-150 cursor-pointer inline-flex items-center gap-1.5"
            >
              <FaArrowLeft className="text-xs" />
              Back to Assessments
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 w-fit">
              <FaClipboardList className="text-white text-lg" />
            </div>
            <div>
              <p className={cn("text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-widest", "mb-1")}>Assessment Management</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Edit Assessment</h1>
            </div>
          </div>
          <p className={cn("text-muted-foreground", "leading-relaxed", "ml-0", "sm:ml-14")}>Update your assessment details and configuration</p>

          {currentAssessment.is_executed && (
            <div className="mt-5 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 mt-0.5 flex-shrink-0">
                <FaExclamationTriangle className="text-amber-400 text-sm" />
              </div>
              <div>
                <p className="font-semibold text-amber-300 text-sm">Assessment Already Executed</p>
                <p className="text-xs text-amber-400/80 mt-0.5">This assessment has been executed and cannot be modified.</p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assessment Details Card */}
          <div className={cn(card, cardInteractive, "shadow-2xl", "overflow-hidden")}>
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-border bg-input flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/20">
                <FaClipboardList className="text-indigo-400 text-sm" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Assessment Details</h2>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Title Input */}
              <div>
                <label htmlFor="title" className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>
                  Assessment Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={cn("w-full", "bg-input", "backdrop-blur-sm", "border", "border-border", "hover:border-accent/40", "focus:border-indigo-500", "rounded-xl", "px-4", "py-3", "text-secondary-foreground", "placeholder:text-subtle-foreground", "text-sm", "transition-all", "duration-200", "focus:outline-none", "focus:ring-2", "focus:ring-indigo-500/30", "disabled:opacity-50", "disabled:cursor-not-allowed")}
                  placeholder="e.g., Data Structures Final Exam"
                  disabled={currentAssessment.is_executed}
                />
              </div>

              {/* Prompt Textarea */}
              <div>
                <label htmlFor="prompt" className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>
                  AI Prompt <span className={cn("text-muted-foreground", "font-normal")}>(Optional if using resources or links)</span>
                </label>
                <textarea
                  name="prompt"
                  id="prompt"
                  value={formData.prompt}
                  onChange={handleInputChange}
                  rows={5}
                  className={cn("w-full", "bg-input", "backdrop-blur-sm", "border", "border-border", "hover:border-accent/40", "focus:border-indigo-500", "rounded-xl", "px-4", "py-3", "text-secondary-foreground", "placeholder:text-subtle-foreground", "text-sm", "transition-all", "duration-200", "focus:outline-none", "focus:ring-2", "focus:ring-indigo-500/30", "resize-none", "disabled:opacity-50", "disabled:cursor-not-allowed")}
                  placeholder="Provide a detailed prompt for question generation..."
                  disabled={currentAssessment.is_executed}
                />
              </div>

              {/* External Links */}
              <div className="bg-input rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FaLink className="text-indigo-400 text-sm" />
                  <label className={cn("text-secondary-foreground", "text-sm", "font-semibold")}>External Links</label>
                </div>
                <div className="space-y-3">
                  {formData.externalLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <FaLink className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm")} />
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => handleLinkChange(index, e.target.value)}
                          placeholder="https://example.com/resource"
                          className={cn("w-full", "bg-input", "backdrop-blur-sm", "border", "border-border", "hover:border-accent/40", "focus:border-indigo-500", "rounded-xl", "pl-11", "pr-4", "py-3", "text-secondary-foreground", "placeholder:text-subtle-foreground", "text-sm", "transition-all", "duration-200", "focus:outline-none", "focus:ring-2", "focus:ring-indigo-500/30", "disabled:opacity-50", "disabled:cursor-not-allowed")}
                          disabled={currentAssessment.is_executed}
                        />
                      </div>
                      {formData.externalLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExternalLink(index)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/15 border border-transparent hover:border-red-500/20 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={currentAssessment.is_executed}
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addExternalLink}
                  className={cn("mt-4", "px-4", "py-2.5", "bg-btn-secondary", "hover:bg-surface-elevated", "border", "border-border", "text-secondary-foreground", "hover:text-foreground", "rounded-xl", "font-medium", "text-sm", "transition-all", "duration-200", "active:scale-95", "cursor-pointer", "inline-flex", "items-center", "gap-2", "disabled:opacity-50", "disabled:cursor-not-allowed")}
                  disabled={currentAssessment.is_executed}
                >
                  <FaPlus className="text-xs" />
                  Add Link
                </button>
              </div>

              {/* Resources Section */}
              <div className="bg-input rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-5">
                  <FaBook className="text-indigo-400 text-sm" />
                  <label className={cn("text-secondary-foreground", "text-sm", "font-semibold")}>Resources</label>
                </div>
                <div className="space-y-6">
                  {/* Upload Files */}
                  <div>
                    <label htmlFor="new_files" className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-2")}>
                      Upload New Files
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="new_files"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                        onChange={handleFileChange}
                        className={cn("w-full", "bg-input", "border", "border-dashed", "border-border", "hover:border-indigo-500/50", "rounded-xl", "px-4", "py-4", "text-muted-foreground", "text-sm", "transition-all", "duration-200", "focus:outline-none", "focus:ring-2", "focus:ring-indigo-500/30", "cursor-pointer", "file:mr-4", "file:py-1.5", "file:px-3", "file:rounded-lg", "file:border-0", "file:text-xs", "file:font-semibold", "file:bg-indigo-500/15", "file:text-indigo-400", "hover:file:bg-indigo-500/25", "disabled:opacity-50", "disabled:cursor-not-allowed")}
                        disabled={currentAssessment.is_executed}
                      />
                    </div>
                    {newFiles.length > 0 && (
                      <div className="mt-3 bg-card rounded-xl p-3 border border-border">
                        <p className={cn("text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-widest", "mb-2")}>Selected Files</p>
                        <ul className="space-y-1.5">
                          {newFiles.map((file, index) => (
                            <li key={index} className={cn("text-sm", "text-secondary-foreground", "flex", "items-center", "gap-2")}>
                              <FaFile className="text-indigo-400 text-xs flex-shrink-0" />
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Existing Resources */}
                  <div>
                    <label className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-2")}>Select Existing Resources</label>
                    {resourcesLoading ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner size="sm" type="dots" color="blue" />
                      </div>
                    ) : resources.length > 0 ? (
                      <div className="space-y-1.5 max-h-64 overflow-y-auto bg-slate-900/40 border border-border rounded-xl p-3">
                        {resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="flex items-center p-2.5 hover:bg-indigo-500/5 rounded-lg transition-colors duration-150 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              id={`resource-${resource.id}`}
                              checked={selectedResources.includes(resource.id)}
                              onChange={() => handleResourceToggle(resource.id)}
                              className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              disabled={currentAssessment.is_executed}
                            />
                            <label
                              htmlFor={`resource-${resource.id}`}
                              className={cn("ml-3", "text-sm", "text-secondary-foreground", "cursor-pointer", "flex-1", "flex", "items-center", "gap-2")}
                            >
                              <span className="font-medium">{resource.name}</span>
                              <span className={cn("inline-flex", "items-center", "gap-1", "px-2", "py-0.5", "rounded-full", "text-xs", "bg-btn-secondary", "text-muted-foreground", "border", "border-border")}>
                                {resource.content_type}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-xl bg-slate-900/30">
                        <FaBook className="text-slate-600 text-2xl mb-2" />
                        <p className={cn("text-muted-foreground", "text-sm")}>No resources available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Blocks Card */}
          <div className={cn(card, cardInteractive, "shadow-2xl", "overflow-hidden")}>
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-border bg-input flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/20">
                <FaQuestionCircle className="text-violet-400 text-sm" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Question Configuration</h2>
            </div>

            <div className="p-6 sm:p-8">
              <div className="space-y-5">
                {questionBlocks.map((block, index) => (
                  <div
                    key={index}
                    className="bg-input rounded-xl border border-border hover:border-indigo-500/30 p-5 transition-all duration-200"
                  >
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                          Block {index + 1}
                        </span>
                        <h3 className={cn("text-base", "font-semibold", "text-secondary-foreground")}>
                          {block.question_type === "multiple_choice" && "Multiple Choice"}
                          {block.question_type === "short_answer" && "Short Answer"}
                          {block.question_type === "true_false" && "True / False"}
                        </h3>
                      </div>
                      {questionBlocks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestionBlock(index)}
                          className="px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={currentAssessment.is_executed}
                        >
                          <FaTrash className="text-xs" />
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Question Type */}
                      <div>
                        <label className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>Question Type</label>
                        <select
                          value={block.question_type}
                          onChange={(e) => handleBlockChange(index, "question_type", e.target.value)}
                          className={cn("w-full", "appearance-none", "bg-input", "border", "border-border", "hover:border-accent/40", "focus:border-indigo-500", "rounded-xl", "px-4", "py-3", "text-secondary-foreground", "text-sm", "transition-all", "duration-200", "focus:outline-none", "focus:ring-2", "focus:ring-indigo-500/30", "cursor-pointer", "disabled:opacity-50", "disabled:cursor-not-allowed")}
                          disabled={currentAssessment.is_executed}
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="short_answer">Short Answer</option>
                          <option value="true_false">True/False</option>
                        </select>
                      </div>

                      {/* Question Count */}
                      <div>
                        <label className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>Question Count</label>
                        <input
                          type="number"
                          value={block.question_count}
                          onChange={(e) => handleBlockChange(index, "question_count", e.target.value)}
                          min="1"
                          placeholder="e.g. 5"
                          className={cn("w-full", "bg-input", "backdrop-blur-sm", "border", "border-border", "hover:border-accent/40", "focus:border-indigo-500", "rounded-xl", "px-4", "py-3", "text-secondary-foreground", "placeholder:text-subtle-foreground", "text-sm", "transition-all", "duration-200", "focus:outline-none", "focus:ring-2", "focus:ring-indigo-500/30", "disabled:opacity-50", "disabled:cursor-not-allowed")}
                          disabled={currentAssessment.is_executed}
                        />
                      </div>

                      {/* Duration */}
                      <div>
                        <label className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>Duration (seconds)</label>
                        <input
                          type="number"
                          value={block.duration_per_question}
                          onChange={(e) => handleBlockChange(index, "duration_per_question", e.target.value)}
                          min="30"
                          placeholder="e.g. 120"
                          className={cn("w-full", "bg-input", "backdrop-blur-sm", "border", "border-border", "hover:border-accent/40", "focus:border-indigo-500", "rounded-xl", "px-4", "py-3", "text-secondary-foreground", "placeholder:text-subtle-foreground", "text-sm", "transition-all", "duration-200", "focus:outline-none", "focus:ring-2", "focus:ring-indigo-500/30", "disabled:opacity-50", "disabled:cursor-not-allowed")}
                          disabled={currentAssessment.is_executed}
                        />
                      </div>

                      {/* Number of Options (MCQ only) */}
                      {block.question_type === "multiple_choice" && (
                        <div>
                          <label className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>Number of Options</label>
                          <input
                            type="number"
                            value={block.num_options}
                            onChange={(e) => handleBlockChange(index, "num_options", e.target.value)}
                            min="2"
                            max="6"
                            placeholder="2 to 6"
                            className={cn("w-full", "bg-input", "backdrop-blur-sm", "border", "border-border", "hover:border-accent/40", "focus:border-indigo-500", "rounded-xl", "px-4", "py-3", "text-secondary-foreground", "placeholder:text-subtle-foreground", "text-sm", "transition-all", "duration-200", "focus:outline-none", "focus:ring-2", "focus:ring-indigo-500/30", "disabled:opacity-50", "disabled:cursor-not-allowed")}
                            disabled={currentAssessment.is_executed}
                          />
                        </div>
                      )}

                      {/* Negative Marks */}
                      <div>
                        <label className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>Negative Marks</label>
                        <input
                          type="number"
                          value={block.negative_marks || ""}
                          onChange={(e) => handleBlockChange(index, "negative_marks", e.target.value)}
                          min="0"
                          step="0.1"
                          placeholder="e.g. 0.25"
                          className={cn("w-full", "bg-input", "backdrop-blur-sm", "border", "border-border", "hover:border-accent/40", "focus:border-indigo-500", "rounded-xl", "px-4", "py-3", "text-secondary-foreground", "placeholder:text-subtle-foreground", "text-sm", "transition-all", "duration-200", "focus:outline-none", "focus:ring-2", "focus:ring-indigo-500/30", "disabled:opacity-50", "disabled:cursor-not-allowed")}
                          disabled={currentAssessment.is_executed}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Block Button */}
                <button
                  type="button"
                  onClick={addQuestionBlock}
                  className={cn("w-full", "py-3", "bg-card/60", "border", "border-dashed", "border-border", "hover:border-indigo-500/40", "hover:bg-indigo-500/5", "text-muted-foreground", "hover:text-indigo-300", "rounded-xl", "font-medium", "text-sm", "transition-all", "duration-200", "active:scale-95", "cursor-pointer", "inline-flex", "items-center", "justify-center", "gap-2", "disabled:opacity-50", "disabled:cursor-not-allowed")}
                  disabled={currentAssessment.is_executed}
                >
                  <FaPlus className="text-xs" />
                  Add Question Block
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/instructor/assessments")}
              className={cn("px-4", "py-2.5", "bg-btn-secondary", "hover:bg-surface-elevated", "border", "border-border", "text-secondary-foreground", "hover:text-foreground", "rounded-xl", "font-medium", "text-sm", "transition-all", "duration-200", "active:scale-95", "cursor-pointer", "order-2", "sm:order-1", "disabled:opacity-50", "disabled:cursor-not-allowed")}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || isProcessing || currentAssessment.is_executed}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" color="white" type="gradient" />
                  <span>Processing...</span>
                </>
              ) : loading ? (
                <>
                  <LoadingSpinner size="sm" color="white" type="gradient" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Update Assessment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

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
export default EditAssessment;
