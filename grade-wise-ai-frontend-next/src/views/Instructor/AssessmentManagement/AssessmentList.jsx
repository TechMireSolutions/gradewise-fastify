import { cn } from "@/lib/cn.js";
import { btn, card, cardHeader, cardInteractive, eyebrow, pageDesc, pageTitle, tableHead } from "@/lib/ui.js";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAssessmentStore from "@/features/assessments/store.js";
import Modal from "../../../components/ui/Modal";
import PageShell from "../../../components/layout/PageShell.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import LoadingState from "../../../components/ui/LoadingState.jsx";
import SearchField from "../../../components/ui/SearchField.jsx";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaChartBar,
  FaFilePdf,
  FaUserPlus,
  FaClipboardList,
  FaBinoculars,
  FaPlus,
} from "react-icons/fa";

// Import Physical Paper Modal
import PhysicalPaperModal from "../../../components/PhysicalPaperModal.jsx";
import useModal from "../../../hooks/useModal.js";

function AssessmentList() {
  const { assessments, loading, getInstructorAssessments, deleteAssessment } = useAssessmentStore();
  const { modal, showModal, closeModal } = useModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Paper Modal State
  const [paperModal, setPaperModal] = useState({
    isOpen: false,
    assessmentId: null,
    title: "",
  });

  const openPaperModal = (assessment) => {
    setPaperModal({
      isOpen: true,
      assessmentId: assessment.id,
      title: assessment.title,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await getInstructorAssessments();
      } catch {
        showModal("error", "Error", "Failed to fetch assessments. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getInstructorAssessments, showModal]);

  const handleDeleteAssessment = (assessmentId, assessmentTitle) => {
    setDeleteTarget({ id: assessmentId, title: assessmentTitle });
    showModal("warning", "Confirm Deletion", `Are you sure you want to delete "${assessmentTitle}"? This action cannot be undone.`);
  };

  const filteredAssessments = assessments?.filter(a =>
    a && a.id && a.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <PageShell>
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className={eyebrow}>Instructor Portal</p>
            <h1 className={cn(pageTitle, "mb-2")}>My Assessments</h1>
            <p className={pageDesc}>Manage and view all your assessments</p>
          </div>
          <Link to="/instructor/assessments/create" className={cn(btn.primary, "shrink-0")}>
            <FaPlus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Create Assessment</span>
          </Link>
        </div>

        <div className={cn("mb-6", card, "shadow-xl", "p-5")}>
          <SearchField
            id="assessment-search"
            label="Search assessments"
            placeholder="Search assessments by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading || loading ? (
          <LoadingState message="Loading assessments..." />
        ) : filteredAssessments.length === 0 ? (
          <EmptyState
            icon={FaClipboardList}
            title={searchTerm ? "No assessments found" : "No assessments yet"}
            description={
              searchTerm
                ? "Try a different search term or clear your search."
                : "Start by creating your first assessment to get started."
            }
            action={
              !searchTerm ? (
                <Link to="/instructor/assessments/create" className={cn(btn.primary)}>
                  <FaPlus className="w-3.5 h-3.5" aria-hidden="true" />
                  Create your first assessment
                </Link>
              ) : null
            }
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className={cn(card, "overflow-hidden", "shadow-2xl")}>
                <div className={cn(cardHeader, "flex", "items-center", "justify-between")}>
                  <h2 className="text-xl font-bold text-foreground">
                    All Assessments
                    <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                      {filteredAssessments.length}
                    </span>
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className={tableHead}>
                      <tr>
                        <th className={cn("px-6", "py-3.5", "text-left", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border")}>
                          Title
                        </th>
                        <th className={cn("px-6", "py-3.5", "text-left", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border")}>
                          Created
                        </th>
                        <th className={cn("px-6", "py-3.5", "text-left", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border")}>
                          Status
                        </th>
                        <th className={cn("px-6", "py-3.5", "text-right", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border", "pr-8")}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {filteredAssessments.map((assessment) => (
                        <tr key={assessment.id} className="hover:bg-indigo-500/5 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                                <FaClipboardList className="w-4 h-4 text-white" />
                              </div>
                              <span className={cn("font-semibold", "text-secondary-foreground")}>{assessment.title}</span>
                            </div>
                          </td>
                          <td className={cn("px-6", "py-4", "text-sm", "text-muted-foreground")}>
                            {new Date(assessment.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4">
                            {assessment.is_executed ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                Executed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                Draft
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-wrap justify-end items-center gap-2">
                              <Link
                                to={`/instructor/assessments/${assessment.id}`}
                                className={cn("inline-flex", "items-center", "gap-1.5", "px-3", "py-1.5", "bg-btn-secondary", "hover:bg-indigo-500/20", "border", "border-border", "hover:border-indigo-500/40", "text-secondary-foreground", "hover:text-indigo-300", "rounded-lg", "font-medium", "text-xs", "transition-all", "duration-200", "cursor-pointer")}
                              >
                                <FaEye className="w-3 h-3" /> View
                              </Link>
                              <Link
                                to={`/instructor/assessments/${assessment.id}/enroll`}
                                className={cn("inline-flex", "items-center", "gap-1.5", "px-3", "py-1.5", "bg-btn-secondary", "hover:bg-emerald-500/20", "border", "border-border", "hover:border-emerald-500/40", "text-secondary-foreground", "hover:text-emerald-300", "rounded-lg", "font-medium", "text-xs", "transition-all", "duration-200", "cursor-pointer")}
                              >
                                <FaUserPlus className="w-3 h-3" /> Enroll
                              </Link>
                              {!assessment.is_executed && (
                                <Link
                                  to={`/instructor/assessments/${assessment.id}/edit`}
                                  className={cn("inline-flex", "items-center", "gap-1.5", "px-3", "py-1.5", "bg-btn-secondary", "hover:bg-violet-500/20", "border", "border-border", "hover:border-violet-500/40", "text-secondary-foreground", "hover:text-violet-300", "rounded-lg", "font-medium", "text-xs", "transition-all", "duration-200", "cursor-pointer")}
                                >
                                  <FaEdit className="w-3 h-3" /> Edit
                                </Link>
                              )}
                              {!assessment.is_executed && (
                                <button
                                  onClick={() => handleDeleteAssessment(assessment.id, assessment.title)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-lg font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer"
                                >
                                  <FaTrash className="w-3 h-3" /> Delete
                                </button>
                              )}
                              {assessment.is_executed && (
                                <Link
                                  to={`/instructor/assessments/${assessment.id}/analytics`}
                                  className={cn("inline-flex", "items-center", "gap-1.5", "px-3", "py-1.5", "bg-btn-secondary", "hover:bg-violet-500/20", "border", "border-border", "hover:border-violet-500/40", "text-secondary-foreground", "hover:text-violet-300", "rounded-lg", "font-medium", "text-xs", "transition-all", "duration-200", "cursor-pointer")}
                                >
                                  <FaChartBar className="w-3 h-3" /> Analytics
                                </Link>
                              )}
                              <button
                                onClick={() => openPaperModal(assessment)}
                                className={cn("inline-flex", "items-center", "gap-1.5", "px-3", "py-1.5", "bg-btn-secondary", "hover:bg-amber-500/20", "border", "border-border", "hover:border-amber-500/40", "text-secondary-foreground", "hover:text-amber-300", "rounded-lg", "font-medium", "text-xs", "transition-all", "duration-200", "active:scale-95", "cursor-pointer")}
                              >
                                <FaFilePdf className="w-3 h-3" /> Paper
                              </button>
                              {!assessment.is_executed && (
                                <Link
                                  to={`/instructor/assessments/${assessment.id}/preview`}
                                  className={cn("inline-flex", "items-center", "gap-1.5", "px-3", "py-1.5", "bg-btn-secondary", "hover:bg-sky-500/20", "border", "border-border", "hover:border-sky-500/40", "text-secondary-foreground", "hover:text-sky-300", "rounded-lg", "font-medium", "text-xs", "transition-all", "duration-200", "cursor-pointer")}
                                >
                                  <FaBinoculars className="w-3 h-3" /> Preview
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className={cn(card, cardInteractive, "shadow-2xl", "p-5")}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 flex-shrink-0">
                        <FaClipboardList className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className={cn("font-semibold", "text-secondary-foreground", "truncate")}>{assessment.title}</h3>
                        <p className={cn("text-xs", "text-muted-foreground", "mt-0.5")}>
                          Created: {new Date(assessment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      {assessment.is_executed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          Executed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Link
                      to={`/instructor/assessments/${assessment.id}`}
                      className={cn("flex", "items-center", "justify-center", "gap-2", "px-4", "py-2.5", "bg-btn-secondary", "hover:bg-indigo-500/20", "border", "border-border", "hover:border-indigo-500/40", "text-secondary-foreground", "hover:text-indigo-300", "rounded-xl", "font-medium", "transition-all", "duration-200", "cursor-pointer")}
                    >
                      <FaEye className="w-3.5 h-3.5" /> View
                    </Link>
                    <Link
                      to={`/instructor/assessments/${assessment.id}/enroll`}
                      className={cn("flex", "items-center", "justify-center", "gap-2", "px-4", "py-2.5", "bg-btn-secondary", "hover:bg-emerald-500/20", "border", "border-border", "hover:border-emerald-500/40", "text-secondary-foreground", "hover:text-emerald-300", "rounded-xl", "font-medium", "transition-all", "duration-200", "cursor-pointer")}
                    >
                      <FaUserPlus className="w-3.5 h-3.5" /> Enroll
                    </Link>
                    {!assessment.is_executed && (
                      <>
                        <Link
                          to={`/instructor/assessments/${assessment.id}/edit`}
                          className={cn("flex", "items-center", "justify-center", "gap-2", "px-4", "py-2.5", "bg-btn-secondary", "hover:bg-violet-500/20", "border", "border-border", "hover:border-violet-500/40", "text-secondary-foreground", "hover:text-violet-300", "rounded-xl", "font-medium", "transition-all", "duration-200", "cursor-pointer")}
                        >
                          <FaEdit className="w-3.5 h-3.5" /> Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteAssessment(assessment.id, assessment.title)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl font-medium transition-all duration-200 active:scale-95 cursor-pointer"
                        >
                          <FaTrash className="w-3.5 h-3.5" /> Delete
                        </button>
                        <Link
                          to={`/instructor/assessments/${assessment.id}/preview`}
                          className={cn("flex", "items-center", "justify-center", "gap-2", "px-4", "py-2.5", "bg-btn-secondary", "hover:bg-sky-500/20", "border", "border-border", "hover:border-sky-500/40", "text-secondary-foreground", "hover:text-sky-300", "rounded-xl", "font-medium", "transition-all", "duration-200", "cursor-pointer", "col-span-2")}
                        >
                          <FaBinoculars className="w-3.5 h-3.5" /> Preview
                        </Link>
                      </>
                    )}
                    {assessment.is_executed && (
                      <Link
                        to={`/instructor/assessments/${assessment.id}/analytics`}
                        className={cn("flex", "items-center", "justify-center", "gap-2", "px-4", "py-2.5", "bg-btn-secondary", "hover:bg-violet-500/20", "border", "border-border", "hover:border-violet-500/40", "text-secondary-foreground", "hover:text-violet-300", "rounded-xl", "font-medium", "transition-all", "duration-200", "cursor-pointer")}
                      >
                        <FaChartBar className="w-3.5 h-3.5" /> Analytics
                      </Link>
                    )}
                    <button
                      onClick={() => openPaperModal(assessment)}
                      className={cn("flex", "items-center", "justify-center", "gap-2", "px-4", "py-2.5", "bg-btn-secondary", "hover:bg-amber-500/20", "border", "border-border", "hover:border-amber-500/40", "text-secondary-foreground", "hover:text-amber-300", "rounded-xl", "font-medium", "transition-all", "duration-200", "active:scale-95", "cursor-pointer", "col-span-2")}
                    >
                      <FaFilePdf className="w-3.5 h-3.5" /> Physical Paper
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      {/* Physical Paper Modal */}
      <PhysicalPaperModal
        isOpen={paperModal.isOpen}
        onClose={() => setPaperModal({ ...paperModal, isOpen: false })}
        assessmentId={paperModal.assessmentId}
        assessmentTitle={paperModal.title}
      />

      {/* General Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => {
          closeModal();
          setDeleteTarget(null);
        }}
        type={modal.type}
        title={modal.title}
        onConfirm={
          deleteTarget
            ? async () => {
                await deleteAssessment(deleteTarget.id);
                showModal("success", "Deleted", "Assessment deleted successfully!");
                setDeleteTarget(null);
                await getInstructorAssessments();
              }
            : undefined
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
      >
        {modal.message}
      </Modal>
    </PageShell>
  );
}

export default AssessmentList;
