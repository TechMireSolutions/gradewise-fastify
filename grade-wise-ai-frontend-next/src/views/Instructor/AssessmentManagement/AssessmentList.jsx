import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAssessmentStore from "@/features/assessments/store.js";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Modal from "../../../components/ui/Modal";
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
  FaSearch,
} from "react-icons/fa";

// Import Physical Paper Modal
import PhysicalPaperModal from "../../../components/PhysicalPaperModal.jsx";

function AssessmentList() {
  const { assessments, loading, getInstructorAssessments, deleteAssessment } = useAssessmentStore();
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });
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
setModal({
  isOpen: true,
  type: "error",
  title: "Error",
  message: "Failed to fetch assessments. Please try again.",
});

      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getInstructorAssessments]);



const handleDeleteAssessment = (assessmentId, assessmentTitle) => {
  setDeleteTarget({ id: assessmentId, title: assessmentTitle });
  setModal({
    isOpen: true,
    type: "warning",
    title: "Confirm Deletion",
    message: `Are you sure you want to delete "${assessmentTitle}"? This action cannot be undone.`,
  });
};

  const filteredAssessments = assessments?.filter(a =>
    a && a.id && a.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Instructor Portal</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">My Assessments</h1>
            <p className="text-slate-400">Manage and view all your assessments</p>
          </div>
          <Link
            to="/instructor/assessments/create"
            className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
          >
            <FaPlus className="w-3.5 h-3.5" />
            <span>Create Assessment</span>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-5">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
            <input
              type="text"
              placeholder="Search assessments by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        {/* Loading or Content */}
        {isLoading || loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <LoadingSpinner size="lg" type="spinner" color="blue" />
            </div>
            <p className="text-slate-400 text-sm">Loading assessments...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center px-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
              <FaClipboardList className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchTerm ? "No assessments found" : "No assessments yet"}
            </h3>
            <p className="text-slate-400 max-w-sm mb-8">
              {searchTerm ? "Try a different search term or clear your search" : "Start by creating your first assessment to get started"}
            </p>
            {!searchTerm && (
              <Link
                to="/instructor/assessments/create"
                className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>Create Your First Assessment</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    All Assessments
                    <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                      {filteredAssessments.length}
                    </span>
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-800/60">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                          Title
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                          Created
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                          Status
                        </th>
                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50 pr-8">
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
                              <span className="font-semibold text-slate-200">{assessment.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">
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
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-indigo-500/20 border border-slate-600/50 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 rounded-lg font-medium text-xs transition-all duration-200 cursor-pointer"
                              >
                                <FaEye className="w-3 h-3" /> View
                              </Link>
                              <Link
                                to={`/instructor/assessments/${assessment.id}/enroll`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-emerald-500/20 border border-slate-600/50 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 rounded-lg font-medium text-xs transition-all duration-200 cursor-pointer"
                              >
                                <FaUserPlus className="w-3 h-3" /> Enroll
                              </Link>
                              {!assessment.is_executed && (
                                <Link
                                  to={`/instructor/assessments/${assessment.id}/edit`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-violet-500/20 border border-slate-600/50 hover:border-violet-500/40 text-slate-300 hover:text-violet-300 rounded-lg font-medium text-xs transition-all duration-200 cursor-pointer"
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
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-violet-500/20 border border-slate-600/50 hover:border-violet-500/40 text-slate-300 hover:text-violet-300 rounded-lg font-medium text-xs transition-all duration-200 cursor-pointer"
                                >
                                  <FaChartBar className="w-3 h-3" /> Analytics
                                </Link>
                              )}
                              <button
                                onClick={() => openPaperModal(assessment)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-amber-500/20 border border-slate-600/50 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 rounded-lg font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer"
                              >
                                <FaFilePdf className="w-3 h-3" /> Paper
                              </button>
                              {!assessment.is_executed && (
                                <Link
                                  to={`/instructor/assessments/${assessment.id}/preview`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-sky-500/20 border border-slate-600/50 hover:border-sky-500/40 text-slate-300 hover:text-sky-300 rounded-lg font-medium text-xs transition-all duration-200 cursor-pointer"
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
                  className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 p-5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 flex-shrink-0">
                        <FaClipboardList className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-200 truncate">{assessment.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
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
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/60 hover:bg-indigo-500/20 border border-slate-600/50 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 rounded-xl font-medium transition-all duration-200 cursor-pointer"
                    >
                      <FaEye className="w-3.5 h-3.5" /> View
                    </Link>
                    <Link
                      to={`/instructor/assessments/${assessment.id}/enroll`}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/60 hover:bg-emerald-500/20 border border-slate-600/50 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 rounded-xl font-medium transition-all duration-200 cursor-pointer"
                    >
                      <FaUserPlus className="w-3.5 h-3.5" /> Enroll
                    </Link>
                    {!assessment.is_executed && (
                      <>
                        <Link
                          to={`/instructor/assessments/${assessment.id}/edit`}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/60 hover:bg-violet-500/20 border border-slate-600/50 hover:border-violet-500/40 text-slate-300 hover:text-violet-300 rounded-xl font-medium transition-all duration-200 cursor-pointer"
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
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/60 hover:bg-sky-500/20 border border-slate-600/50 hover:border-sky-500/40 text-slate-300 hover:text-sky-300 rounded-xl font-medium transition-all duration-200 cursor-pointer col-span-2"
                        >
                          <FaBinoculars className="w-3.5 h-3.5" /> Preview
                        </Link>
                      </>
                    )}
                    {assessment.is_executed && (
                      <Link
                        to={`/instructor/assessments/${assessment.id}/analytics`}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/60 hover:bg-violet-500/20 border border-slate-600/50 hover:border-violet-500/40 text-slate-300 hover:text-violet-300 rounded-xl font-medium transition-all duration-200 cursor-pointer"
                      >
                        <FaChartBar className="w-3.5 h-3.5" /> Analytics
                      </Link>
                    )}
                    <button
                      onClick={() => openPaperModal(assessment)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/60 hover:bg-amber-500/20 border border-slate-600/50 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 rounded-xl font-medium transition-all duration-200 active:scale-95 cursor-pointer col-span-2"
                    >
                      <FaFilePdf className="w-3.5 h-3.5" /> Physical Paper
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>


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
    setModal({ ...modal, isOpen: false });
    setDeleteTarget(null);
  }}
  type={modal.type}
  title={modal.title}
  onConfirm={
    deleteTarget
      ? async () => {
          await deleteAssessment(deleteTarget.id);
          setModal({
            isOpen: true,
            type: "success",
            title: "Deleted",
            message: "Assessment deleted successfully!",
          });
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

    </div>
  );
}

export default AssessmentList;
