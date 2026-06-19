import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useAssessmentStore from "@/features/assessments/store.js";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Modal from "../../../components/ui/Modal";
import { FaInfoCircle, FaCalendarAlt, FaLink, FaQuestionCircle, FaFileAlt, FaExclamationCircle, FaEdit, FaUsers, FaPrint, FaArrowLeft, FaCheckCircle, FaLock, FaGlobe } from "react-icons/fa";

// THIS IS THE MISSING IMPORT — NOW ADDED
import PhysicalPaperModal from "../../../components/PhysicalPaperModal.jsx";


function AssessmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentAssessment, getAssessmentById, loading, error } = useAssessmentStore();
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);

  // THIS STATE CONTROLS THE PHYSICAL PAPER MODAL
  const [paperModal, setPaperModal] = useState({
    isOpen: false,
    assessmentId: null,
    title: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!id || isNaN(parseInt(id))) {
          setModal({
            isOpen: true,
            type: "error",
            title: "Invalid Assessment",
            message: "Invalid assessment ID.",
          });
          navigate("/instructor/assessments");
          return;
        }

        await getAssessmentById(parseInt(id));
      } catch (error) {
        const msg = error.response?.data?.message || error.message || "Failed to load assessment";
        setModal({
          isOpen: true,
          type: "error",
          title: "Error",
          message: msg,
        });

        if (error.response?.status === 404) navigate("/instructor/assessments");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps




  // THIS OPENS THE PHYSICAL PAPER MODAL
  const openPaperModal = (assessment) => {
    setPaperModal({
      isOpen: true,
      assessmentId: assessment.id,
      title: assessment.title,
    });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className="text-slate-400 text-sm">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !currentAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 py-16">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl">
            <div className="flex flex-col items-center justify-center py-28 text-center px-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center mb-6">
                <FaExclamationCircle className="text-red-400 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Assessment Not Found</h3>
              <p className="text-slate-400 max-w-sm mb-8">
                The requested assessment could not be loaded. It may have been deleted or you don&apos;t have access to it.
              </p>
              <Link
                to="/instructor/assessments"
                className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <FaArrowLeft /> Back to Assessments
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link
              to="/instructor/assessments"
              className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors duration-150 cursor-pointer inline-flex items-center gap-1.5"
            >
              <FaArrowLeft className="text-xs" /> Back to Assessments
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">Assessment Details</h1>
          <p className="text-slate-400 text-sm">View and manage this assessment configuration</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-800/60">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white mb-3 break-words">{currentAssessment.title}</h2>
                <div className="flex flex-wrap gap-2">
                  {currentAssessment.is_executed ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      <FaCheckCircle className="text-xs" /> Executed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                      <FaEdit className="text-xs" /> Draft
                    </span>
                  )}
                  {currentAssessment.is_published ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                      <FaGlobe className="text-xs" /> Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-400 border border-slate-600/40">
                      <FaLock className="text-xs" /> Unpublished
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {!currentAssessment.is_executed && (
                  <Link
                    to={`/instructor/assessments/${id}/edit`}
                    className="px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer inline-flex items-center gap-2"
                  >
                    <FaEdit /> Edit
                  </Link>
                )}
                <Link
                  to={`/instructor/assessments/${id}/enroll`}
                  className="px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer inline-flex items-center gap-2"
                >
                  <FaUsers /> Enroll
                </Link>
                <button
                  onClick={() => openPaperModal(currentAssessment)}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                >
                  <FaPrint /> Print PDF
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Basic Info */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                  <FaInfoCircle className="text-white text-sm" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4 sm:p-5 hover:border-indigo-500/30 transition-all duration-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Title</span>
                  <p className="mt-2 font-semibold text-white text-base">{currentAssessment.title}</p>
                </div>
                {currentAssessment.prompt && (
                  <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4 sm:p-5 hover:border-indigo-500/30 transition-all duration-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Prompt</span>
                    <p className="mt-2 text-slate-300 leading-relaxed">{currentAssessment.prompt}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-slate-700/50" />

            {/* Dates */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                  <FaCalendarAlt className="text-white text-sm" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200">Dates</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-3 sm:p-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Created</span>
                  <p className="mt-1.5 text-white font-medium text-sm">{new Date(currentAssessment.created_at).toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-3 sm:p-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Updated</span>
                  <p className="mt-1.5 text-white font-medium text-sm">{currentAssessment.updated_at ? new Date(currentAssessment.updated_at).toLocaleString() : "—"}</p>
                </div>
              </div>
            </section>

            {/* External Links */}
            {currentAssessment.external_links?.length > 0 && (
              <>
                <div className="border-t border-slate-700/50" />
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                      <FaLink className="text-white text-sm" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200">External Links</h3>
                  </div>
                  <div className="space-y-3">
                    {currentAssessment.external_links.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-slate-800/60 border border-slate-700/40 hover:border-indigo-500/30 rounded-xl transition-all duration-200 group"
                      >
                        <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/20 flex-shrink-0 group-hover:bg-violet-500/25 transition-colors duration-200">
                          <FaLink className="text-violet-400 text-sm" />
                        </div>
                        <span className="text-indigo-400 hover:text-indigo-300 font-medium text-sm break-all flex-1 transition-colors duration-150">{link}</span>
                        <span className="text-slate-500 group-hover:text-slate-300 transition-colors duration-200 text-sm">→</span>
                      </a>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Divider */}
            <div className="border-t border-slate-700/50" />

            {/* Question Blocks - Desktop */}
            <section className="hidden lg:block">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                  <FaQuestionCircle className="text-white text-sm" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200">Question Blocks</h3>
              </div>
              {currentAssessment.question_blocks?.length > 0 ? (
                <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-slate-800/60">
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Type</th>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Count</th>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Time/Q</th>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Options</th>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">+Marks</th>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">-Marks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {currentAssessment.question_blocks.map((b, i) => (
                          <tr key={i} className="hover:bg-indigo-500/5 transition-colors duration-150">
                            <td className="px-6 py-4 text-sm text-slate-300">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                                {b.question_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-300 font-medium">{b.question_count}</td>
                            <td className="px-6 py-4 text-sm text-slate-400">{b.duration_per_question}s</td>
                            <td className="px-6 py-4 text-sm text-slate-400">
                              {b.question_type === "multiple_choice" ? b.num_options :
                                b.question_type === "matching" ? `${b.num_first_side}/${b.num_second_side}` : "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                +{b.positive_marks ?? "—"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
                                -{b.negative_marks ?? "—"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                    <FaQuestionCircle className="text-indigo-400 text-2xl" />
                  </div>
                  <p className="text-slate-500 text-sm italic">No question blocks configured</p>
                </div>
              )}
            </section>

            {/* Question Blocks - Mobile */}
            <section className="lg:hidden space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                  <FaQuestionCircle className="text-white text-sm" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200">Question Blocks</h3>
              </div>
              {currentAssessment.question_blocks?.length > 0 ? (
                currentAssessment.question_blocks.map((b, i) => (
                  <div key={i} className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4 sm:p-5 hover:border-indigo-500/30 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                        Block {i + 1}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-400 border border-slate-600/40">
                        {b.question_type}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Count</span>
                        <p className="text-white font-semibold mt-0.5">{b.question_count}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Time/Q</span>
                        <p className="text-white font-semibold mt-0.5">{b.duration_per_question}s</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Options</span>
                        <p className="text-white font-semibold mt-0.5">
                          {b.question_type === "multiple_choice" ? b.num_options : b.question_type === "matching" ? `${b.num_first_side}/${b.num_second_side}` : "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">+/- Marks</span>
                        <p className="font-semibold mt-0.5">
                          <span className="text-emerald-400">+{b.positive_marks ?? "—"}</span>
                          <span className="text-slate-500 mx-1">/</span>
                          <span className="text-red-400">-{b.negative_marks ?? "—"}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                    <FaQuestionCircle className="text-indigo-400 text-2xl" />
                  </div>
                  <p className="text-slate-500 text-sm italic">No question blocks configured</p>
                </div>
              )}
            </section>

            {/* Resources */}
            {currentAssessment.resources?.length > 0 && (
              <>
                <div className="border-t border-slate-700/50" />
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
                      <FaFileAlt className="text-white text-sm" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200">Resources</h3>
                  </div>
                  <div className="space-y-3">
                    {currentAssessment.resources.map((r, i) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800/60 rounded-xl border border-slate-700/40 p-4 sm:p-5 hover:border-amber-500/30 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex-shrink-0">
                            <FaFileAlt className="text-amber-400 text-sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-200 truncate">{r.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Physical Paper Modal */}
      <PhysicalPaperModal
        isOpen={paperModal.isOpen}
        onClose={() => setPaperModal({ ...paperModal, isOpen: false })}
        assessmentId={paperModal.assessmentId}
        assessmentTitle={paperModal.title}
      />

      {/* Error/Success Modal */}
      <Modal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} type={modal.type} title={modal.title}>
        {modal.message}
      </Modal>
    </div>
  );
}

export default AssessmentDetail;
