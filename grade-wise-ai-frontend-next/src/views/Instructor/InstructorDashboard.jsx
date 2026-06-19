import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/features/auth/store.js";
import useAssessmentStore from "@/features/assessments/store.js";
import useInstructorAnalyticsStore from "@/features/instructor-analytics/store.js";
import LoadingSpinner from "../../components/ui/LoadingSpinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaChartBar,
  FaFilePdf,
  FaPen,
  FaBook,
  FaSchool,
  FaUserGraduate,
  FaChartLine,
  FaUserPlus,
  FaClipboardList,
  FaCalendarAlt,
  FaBinoculars,
} from "react-icons/fa";

// Physical Paper Modal
import PhysicalPaperModal from "../../components/PhysicalPaperModal.jsx";

function InstructorDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { assessments, getInstructorAssessments } = useAssessmentStore();
  const { overview, loading, getInstructorOverview } = useInstructorAnalyticsStore();
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    assessmentId: null,
    title: "",
  });


  const [paperModal, setPaperModal] = useState({
    isOpen: false,
    assessmentId: null,
    title: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          getInstructorAssessments(),
          getInstructorOverview(),
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch dashboard data.";
        setModal({ isOpen: true, type: "error", title: "Error", message: errorMessage });
        if (error.response?.status === 403 || error.message === "No authentication token found") {
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showModal = (type, title, message) => {
    setModal({ isOpen: true, type, title, message });
  };

  const openPaperModal = (assessment) => {
    setPaperModal({
      isOpen: true,
      assessmentId: assessment.id,
      title: assessment.title,
    });
  };

  const quickActions = [
    {
      title: "Create Assessment",
      description: "Add a new assessment",
      icon: <FaPen className="w-7 h-7" />,
      link: "/instructor/assessments/create",
      color: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      shadow: "shadow-blue-200",
    },
    {
      title: "Manage Resources",
      description: "Upload or manage resources",
      icon: <FaBook className="w-7 h-7" />,
      link: "/instructor/resources",
      color: "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      shadow: "shadow-green-200",
    },
    {
      title: "My Assessments",
      description: "View & manage assessments",
      icon: <FaSchool className="w-7 h-7" />,
      link: "/instructor/assessments",
      color: "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      shadow: "shadow-purple-200",
    },
    {
      title: "Add New Student",
      description: "Register a new student",
      icon: <FaUserGraduate className="w-7 h-7" />,
      link: "/instructor/students",
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
      shadow: "shadow-yellow-200",
    },
    {
      title: "View Analytics",
      description: "Analyze performance",
      icon: <FaChartLine className="w-7 h-7" />,
      link: "/instructor/assessments/:assessmentId/analytics",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700",
      shadow: "shadow-indigo-200",
    },
  ];

  const statsData = [
    {
      value: overview.assessments || 0,
      label: "My Assessments",
      icon: <FaClipboardList className="w-6 h-6 text-white" />,
      cardClass: "bg-gradient-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-4 sm:p-5",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25",
      valueClass: "text-2xl sm:text-3xl font-bold text-white leading-none",
    },
    {
      value: overview.resources || 0,
      label: "Resources",
      icon: <FaBook className="w-6 h-6 text-white" />,
      cardClass: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-4 sm:p-5",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25",
      valueClass: "text-2xl sm:text-3xl font-bold text-white leading-none",
    },
    {
      value: overview.executedAssessments || 0,
      label: "Executed Assessments",
      icon: <FaChartBar className="w-6 h-6 text-white" />,
      cardClass: "bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 rounded-xl p-4 sm:p-5",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25",
      valueClass: "text-2xl sm:text-3xl font-bold text-white leading-none",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-10">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 overflow-hidden">
            <div className="relative p-6 sm:p-8 lg:p-10">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-transparent pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Instructor Portal</p>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
                    Welcome Back, {user?.name}!
                  </h1>
                  <p className="text-slate-300 leading-relaxed text-sm sm:text-base max-w-xl">
                    Manage your assessments, track student progress, and create engaging learning experiences.
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-center justify-center bg-slate-800/60 border border-slate-700/40 rounded-2xl p-5 min-w-[120px]">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 mb-3">
                    <FaCalendarAlt className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 text-center">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isLoading || loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <LoadingSpinner size="lg" type="spinner" color="blue" />
            </div>
            <p className="text-slate-400 text-sm">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
              {statsData.map((stat, index) => (
                <div key={index} className={stat.cardClass}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={stat.valueClass}>{stat.value}</div>
                      <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                    </div>
                    <div className={stat.iconClass}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 mb-8 sm:mb-10">
              <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 rounded-t-2xl">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                    <FaSchool className="w-4 h-4 text-white" />
                  </div>
                  Quick Actions
                </h2>
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      href={action.link}
                      className={`${action.color} text-white p-5 sm:p-6 rounded-xl transition-all duration-200 shadow-lg active:scale-95 text-center group hover:shadow-2xl`}
                    >
                      <div className="flex justify-center mb-3 transform group-hover:scale-110 transition-transform duration-200">
                        {action.icon}
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base mb-1">{action.title}</h3>
                      <p className="text-xs opacity-80">{action.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Assessments */}
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200">
              <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 rounded-t-2xl">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
                      <FaClipboardList className="w-4 h-4 text-white" />
                    </div>
                    Recent Assessments
                  </h2>
                  <Link
                    href="/instructor/assessments"
                    className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors duration-150 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    View All
                    <span className="text-xs">→</span>
                  </Link>
                </div>
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                {!assessments || assessments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-28 text-center px-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                      <FaPen className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Assessments Yet</h3>
                    <p className="text-slate-400 max-w-sm mb-8">
                      Create your first assessment to start evaluating your students&apos; progress and performance.
                    </p>
                    <Link
                      href="/instructor/assessments/create"
                      className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                    >
                      <FaPen />
                      Create Your First Assessment
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                      <table className="min-w-full">
                        <thead className="bg-slate-800/60">
                          <tr>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                              Assessment Title
                            </th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                              Created On
                            </th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                              Status
                            </th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                          {assessments.slice(0, 5).map((assessment) => (
                            <tr key={assessment.id} className="hover:bg-indigo-500/5 transition-colors duration-150">
                              <td className="px-6 py-4 text-sm text-slate-300">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex-shrink-0">
                                    <FaClipboardList className="w-4 h-4 text-indigo-400" />
                                  </div>
                                  <span className="font-semibold text-slate-200">{assessment.title}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-300">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <FaCalendarAlt className="text-slate-500 text-xs" />
                                  {new Date(assessment.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${assessment.is_executed
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                  }`}>
                                  {assessment.is_executed ? "Executed" : "Draft"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Link
                                    href={`/instructor/assessments/${assessment.id}`}
                                    className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium text-xs transition-colors duration-150 cursor-pointer"
                                  >
                                    <FaEye />
                                    View
                                  </Link>
                                  <Link
                                    href={`/instructor/assessments/${assessment.id}/enroll`}
                                    className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium text-xs transition-colors duration-150 cursor-pointer"
                                  >
                                    <FaUserPlus />
                                    Enroll
                                  </Link>
                                  {!assessment.is_executed && (
                                    <Link
                                      href={`/instructor/assessments/${assessment.id}/edit`}
                                      className="inline-flex items-center gap-1.5 text-violet-400 hover:text-violet-300 font-medium text-xs transition-colors duration-150 cursor-pointer"
                                    >
                                      <FaEdit />
                                      Edit
                                    </Link>
                                  )}
                                  {!assessment.is_executed && (
                                    <button
                                      onClick={() =>
                                        setDeleteConfirm({
                                          isOpen: true,
                                          assessmentId: assessment.id,
                                          title: assessment.title,
                                        })
                                      }
                                      className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 font-medium text-xs transition-colors duration-150 cursor-pointer"
                                    >
                                      <FaTrash />
                                      Delete
                                    </button>
                                  )}
                                  {assessment.is_executed && (
                                    <Link
                                      href={`/instructor/assessments/${assessment.id}/analytics`}
                                      className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium text-xs transition-colors duration-150 cursor-pointer"
                                    >
                                      <FaChartBar />
                                      Analytics
                                    </Link>
                                  )}
                                  <button
                                    onClick={() => openPaperModal(assessment)}
                                    className="inline-flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-medium text-xs transition-colors duration-150 cursor-pointer"
                                  >
                                    <FaFilePdf />
                                    Paper
                                  </button>
                                  {!assessment.is_executed && (
                                    <Link
                                      href={`/instructor/assessments/${assessment.id}/preview`}
                                      className="inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-medium text-xs transition-colors duration-150 cursor-pointer"
                                    >
                                      <FaBinoculars />
                                      Preview
                                    </Link>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile/Tablet Cards */}
                    <div className="lg:hidden space-y-4">
                      {assessments.slice(0, 5).map((assessment) => (
                        <div
                          key={assessment.id}
                          className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4 sm:p-5 hover:border-indigo-500/30 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-4 gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex-shrink-0">
                                <FaClipboardList className="w-4 h-4 text-indigo-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm sm:text-base font-semibold text-slate-200 mb-1 break-words">
                                  {assessment.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <FaCalendarAlt />
                                  {new Date(assessment.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${assessment.is_executed
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                              }`}>
                              {assessment.is_executed ? "Executed" : "Draft"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <Link
                              href={`/instructor/assessments/${assessment.id}`}
                              className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 rounded-xl font-medium text-xs hover:bg-indigo-500/25 transition-all duration-200 active:scale-95 cursor-pointer"
                            >
                              <FaEye />
                              View
                            </Link>
                            <Link
                              href={`/instructor/assessments/${assessment.id}/enroll`}
                              className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-xl font-medium text-xs hover:bg-emerald-500/25 transition-all duration-200 active:scale-95 cursor-pointer"
                            >
                              <FaUserPlus />
                              Enroll
                            </Link>
                            {!assessment.is_executed && (
                              <>
                                <Link
                                  href={`/instructor/assessments/${assessment.id}/edit`}
                                  className="flex items-center justify-center gap-2 px-3 py-2 bg-violet-500/15 text-violet-400 border border-violet-500/20 rounded-xl font-medium text-xs hover:bg-violet-500/25 transition-all duration-200 active:scale-95 cursor-pointer"
                                >
                                  <FaEdit />
                                  Edit
                                </Link>
                                <button
                                  onClick={() =>
                                    setDeleteConfirm({
                                      isOpen: true,
                                      assessmentId: assessment.id,
                                      title: assessment.title,
                                    })
                                  }
                                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/15 text-red-400 border border-red-500/20 rounded-xl font-medium text-xs hover:bg-red-500/25 transition-all duration-200 active:scale-95 cursor-pointer"
                                >
                                  <FaTrash />
                                  Delete
                                </button>
                                <Link
                                  href={`/instructor/assessments/${assessment.id}/preview`}
                                  className="flex items-center justify-center gap-2 px-3 py-2 bg-teal-500/15 text-teal-400 border border-teal-500/20 rounded-xl font-medium text-xs hover:bg-teal-500/25 transition-all duration-200 active:scale-95 cursor-pointer col-span-2"
                                >
                                  <FaBinoculars />
                                  Preview
                                </Link>
                              </>
                            )}
                            {assessment.is_executed && (
                              <Link
                                href={`/instructor/assessments/${assessment.id}/analytics`}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-xl font-medium text-xs hover:bg-amber-500/25 transition-all duration-200 active:scale-95 cursor-pointer"
                              >
                                <FaChartBar />
                                Analytics
                              </Link>
                            )}
                            <button
                              onClick={() => openPaperModal(assessment)}
                              className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-500/15 text-orange-400 border border-orange-500/20 rounded-xl font-medium text-xs hover:bg-orange-500/25 transition-all duration-200 active:scale-95 cursor-pointer col-span-2"
                            >
                              <FaFilePdf />
                              Physical Paper
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
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

      {/* Error/Success Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
      >
        {modal.message}
      </Modal>

      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({
            isOpen: false,
            assessmentId: null,
            title: "",
          })
        }
        type="warning"
        title="Delete Assessment?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          try {
            await useAssessmentStore
              .getState()
              .deleteAssessment(deleteConfirm.assessmentId);

            showModal("success", "Deleted!", "Assessment removed successfully");
          } catch {
            showModal("error", "Error", "Failed to delete assessment");
          }
        }}
      >
        Are you sure you want to delete{" "}
        <strong>{deleteConfirm.title}</strong>?
        This action cannot be undone.
      </Modal>

    </div>
  );
}

export default InstructorDashboard;
