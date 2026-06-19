import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAssessmentStore from "@/features/assessments/store.js";
import useResourceStore from "@/features/resources/store.js";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Modal from "../../../components/ui/Modal";
import { createAssessmentSchema } from "../../../scheema/assessmentSchemas.js";
import { FiFileText, FiList, FiLink, FiPlus, FiTrash2, FiBook, FiZap, FiX, FiArrowLeft } from "react-icons/fi";

function CreateAssessment() {
  const navigate = useNavigate();
  const { createAssessment, loading } = useAssessmentStore();
  const { resources, fetchAllResources, loading: resourcesLoading } = useResourceStore();
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAllResources();
  }, [fetchAllResources]);

  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
    externalLinks: [""],
  });

  const [questionBlocks, setQuestionBlocks] = useState([
    {
      questionType: "multiple_choice",
      questionCount: 1,
      durationPerQuestion: 120,
      numOptions: 4,
      positiveMarks: 1,
      negativeMarks: 0,
    },
  ]);

  const [selectedResources, setSelectedResources] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlockChange = (index, field, value) => {
    setQuestionBlocks((prev) =>
      prev.map((block, i) =>
        i === index
          ? {
            ...block,
            [field]:
              field === "questionCount" || field === "durationPerQuestion" || field === "numOptions"
                ? Math.max(Number.parseInt(value) || 1, 1)
                : field === "positiveMarks" || field === "negativeMarks"
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
    setQuestionBlocks((prev) => [
      ...prev,
      {
        questionType: "multiple_choice",
        questionCount: 1,
        durationPerQuestion: 120,
        numOptions: 4,
        positiveMarks: 1,
        negativeMarks: 0,
      },
    ]);
  };

  const removeQuestionBlock = (index) => {
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

  const handleResourceToggle = (resourceId) => {
    setSelectedResources((prev) =>
      prev.includes(resourceId) ? prev.filter((id) => id !== resourceId) : [...prev, resourceId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationResult = createAssessmentSchema.safeParse({
      title: formData.title,
      prompt: formData.prompt,
      selectedResources,
      externalLinks: formData.externalLinks.filter((l) => l.trim() !== ""),
      questionBlocks,
    });

    if (!validationResult.success) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Validation Error",
        message: validationResult.error.issues?.[0]?.message || "Invalid data",
      });
      return;
    }

    setIsProcessing(true);

    const payload = {
      title: formData.title.trim(),
      prompt: formData.prompt.trim(),
      externalLinks: formData.externalLinks.filter((link) => link.trim()),
      selectedResources,
      questionBlocks: questionBlocks.map((block) => ({
        questionType: block.questionType,
        questionCount: Number(block.questionCount),
        durationPerQuestion: Number(block.durationPerQuestion),
        ...(block.questionType === "multiple_choice" ? { numOptions: Number(block.numOptions) } : {}),
        positiveMarks: Number(block.positiveMarks ?? 1),
        negativeMarks: Number(block.negativeMarks ?? 0),
      })),
    };

    try {
      await createAssessment(payload);

      setModal({
        isOpen: true,
        type: "success",
        title: "Success",
        message: "Assessment created successfully!",
      });

      setTimeout(() => {
        navigate("/instructor/assessments");
      }, 1500);
    } catch (err) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: err.message || "Failed to create assessment",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Instructor Portal</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">Create New Assessment</h1>
            <p className="text-slate-400 leading-relaxed">Design a comprehensive assessment with customizable question blocks</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/instructor/assessments")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <FiArrowLeft className="text-base" />
            Back to Assessments
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assessment Details Card */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <FiFileText className="text-white text-base" />
              </div>
              <h2 className="text-xl font-bold text-white">Assessment Details</h2>
            </div>
            <div className="p-6 sm:p-8">
              <div className="space-y-6">
                {/* Title Input */}
                <div>
                  <label htmlFor="title" className="block text-slate-400 text-sm font-medium mb-1.5">
                    Assessment Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    placeholder="e.g., Data Structures Final Exam"
                    required
                  />
                </div>

                {/* Prompt Textarea */}
                <div>
                  <label htmlFor="prompt" className="block text-slate-400 text-sm font-medium mb-1.5">
                    Prompt <span className="text-slate-500 font-normal">(Optional if using resources or links)</span>
                  </label>
                  <textarea
                    name="prompt"
                    id="prompt"
                    value={formData.prompt}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                    placeholder="Provide a detailed prompt for question generation. Describe the topics, difficulty level, and any specific requirements..."
                  />
                </div>

                {/* Resources Section */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FiBook className="text-indigo-400 text-sm" />
                    <label className="block text-slate-400 text-sm font-medium">Select Existing Resources</label>
                    {selectedResources.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 ml-auto">
                        {selectedResources.length} selected
                      </span>
                    )}
                  </div>
                  {resourcesLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="sm" type="dots" color="blue" />
                    </div>
                  ) : resources.length > 0 ? (
                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {resources.map((resource) => (
                        <div
                          key={resource.id}
                          className={`flex items-center p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                            selectedResources.includes(resource.id)
                              ? "bg-indigo-500/10 border-indigo-500/30"
                              : "bg-slate-900/30 border-slate-700/40 hover:bg-indigo-500/5 hover:border-indigo-500/20"
                          }`}
                          onClick={() => !isProcessing && handleResourceToggle(resource.id)}
                        >
                          <input
                            type="checkbox"
                            id={`resource-${resource.id}`}
                            checked={selectedResources.includes(resource.id)}
                            onChange={() => handleResourceToggle(resource.id)}
                            className="h-4 w-4 accent-indigo-500 border-slate-600 rounded focus:ring-indigo-500 cursor-pointer"
                            disabled={isProcessing}
                          />
                          <label htmlFor={`resource-${resource.id}`} className="ml-3 text-sm cursor-pointer flex-1 flex items-center gap-2">
                            <span className="font-medium text-slate-200">{resource.name}</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-700/60 text-slate-400 border border-slate-600/40">{resource.content_type}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-3">
                        <FiBook className="text-indigo-400 text-lg" />
                      </div>
                      <p className="text-slate-400 text-sm">No resources available.</p>
                      <p className="text-slate-500 text-xs mt-1">Upload them from the Resources page.</p>
                    </div>
                  )}
                </div>

                {/* External Links */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FiLink className="text-indigo-400 text-sm" />
                    <label className="block text-slate-400 text-sm font-medium">External Links</label>
                  </div>
                  <div className="space-y-3">
                    {formData.externalLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <FiLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                          <input
                            type="url"
                            value={link}
                            onChange={(e) => handleLinkChange(index, e.target.value)}
                            placeholder="https://example.com/resource"
                            className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            disabled={isProcessing}
                          />
                        </div>
                        {formData.externalLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExternalLink(index)}
                            className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-all duration-200 active:scale-95 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                            disabled={isProcessing}
                          >
                            <FiX className="text-base" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addExternalLink}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer"
                    disabled={isProcessing}
                  >
                    <FiPlus className="text-base" />
                    Add Link
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Question Blocks Card */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                <FiList className="text-white text-base" />
              </div>
              <h2 className="text-xl font-bold text-white">Question Configuration</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-400 border border-slate-600/40 ml-auto">
                {questionBlocks.length} {questionBlocks.length === 1 ? "Block" : "Blocks"}
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="space-y-5">
                {questionBlocks.map((block, index) => (
                  <div key={index} className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-5 hover:border-indigo-500/25 transition-all duration-200">
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                          Block {index + 1}
                        </span>
                        <h3 className="text-base font-semibold text-slate-200">
                          {block.questionType === "multiple_choice" ? "Multiple Choice" : "True / False"}
                        </h3>
                      </div>
                      {questionBlocks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestionBlock(index)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer"
                          disabled={isProcessing}
                        >
                          <FiTrash2 className="text-sm" />
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1.5">Question Type</label>
                        <select
                          value={block.questionType}
                          onChange={(e) => handleBlockChange(index, "questionType", e.target.value)}
                          className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 appearance-none cursor-pointer"
                          disabled={isProcessing}
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="true_false">True/False</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1.5">Question Count</label>
                        <input
                          type="number"
                          value={block.questionCount}
                          onChange={(e) => handleBlockChange(index, "questionCount", e.target.value)}
                          min="1"
                          placeholder="e.g. 5"
                          className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          required
                          disabled={isProcessing}
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1.5">Duration (seconds)</label>
                        <input
                          type="number"
                          value={block.durationPerQuestion}
                          onChange={(e) => handleBlockChange(index, "durationPerQuestion", e.target.value)}
                          min="30"
                          placeholder="e.g. 120"
                          className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          required
                          disabled={isProcessing}
                        />
                      </div>

                      {block.questionType === "multiple_choice" && (
                        <div>
                          <label className="block text-slate-400 text-sm font-medium mb-1.5">Number of Options</label>
                          <input
                            type="number"
                            value={block.numOptions}
                            onChange={(e) => handleBlockChange(index, "numOptions", e.target.value)}
                            min="2"
                            max="6"
                            placeholder="2 to 6"
                            className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            required
                            disabled={isProcessing}
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1.5">Positive Marks</label>
                        <input
                          type="number"
                          value={block.positiveMarks || ""}
                          onChange={(e) => handleBlockChange(index, "positiveMarks", e.target.value)}
                          min="0"
                          step="0.1"
                          placeholder="e.g. 1"
                          className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          disabled={isProcessing}
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1.5">Negative Marks</label>
                        <input
                          type="number"
                          value={block.negativeMarks || ""}
                          onChange={(e) => handleBlockChange(index, "negativeMarks", e.target.value)}
                          min="0"
                          step="0.1"
                          placeholder="e.g. 0.25"
                          className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addQuestionBlock}
                  className="w-full py-3.5 flex items-center justify-center gap-2 bg-slate-800/40 hover:bg-indigo-500/10 border-2 border-dashed border-slate-600/60 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-400 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer"
                  disabled={isProcessing}
                >
                  <FiPlus className="text-base" />
                  Add Question Block
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2 pb-4">
            <button
              type="button"
              onClick={() => navigate("/instructor/assessments")}
              className="px-6 py-3 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer order-2 sm:order-1"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              disabled={loading || isProcessing}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" color="white" type="gradient" />
                  <span>Processing...</span>
                </>
              ) : loading ? (
                <>
                  <LoadingSpinner size="sm" color="white" type="gradient" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FiZap className="text-base" />
                  <span>Create Assessment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
      >
        {modal.message}
      </Modal>
    </div>
  );
}

export default CreateAssessment;
