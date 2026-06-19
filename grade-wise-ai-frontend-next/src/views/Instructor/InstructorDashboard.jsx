import { cn } from "@/lib/cn.js";
import { btn, card, cardHeader, cardInteractive, iconBadge, page, tableHead, tableRowHover } from "@/lib/ui.js";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/features/auth/store.js";
import useAssessmentStore from "@/features/assessments/store.js";
import useInstructorAnalyticsStore from "@/features/instructor-analytics/store.js";
import LoadingState from "../../components/ui/LoadingState.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Modal from "../../components/ui/Modal.jsx";
import WelcomeBanner from "../../components/layout/WelcomeBanner.jsx";
import AmbientBackground from "../../components/layout/AmbientBackground.jsx";
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
import useModal from "../../hooks/useModal.js";

function InstructorDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { assessments, getInstructorAssessments } = useAssessmentStore();
  const { overview, loading, getInstructorOverview } = useInstructorAnalyticsStore();
  const { modal, showModal, closeModal } = useModal();
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
        showModal("error", "Error", errorMessage);
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
      color: "bg-gradient-to-br from-indigo-50 dark:from-indigo-950/300 to-blue-600 hover:from-blue-600 hover:to-blue-700",
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
      valueClass: "text-2xl sm:text-3xl font-bold text-foreground leading-none",
    },
    {
      value: overview.resources || 0,
      label: "Resources",
      icon: <FaBook className="w-6 h-6 text-white" />,
      cardClass: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-4 sm:p-5",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25",
      valueClass: "text-2xl sm:text-3xl font-bold text-foreground leading-none",
    },
    {
      value: overview.executedAssessments || 0,
      label: "Executed Assessments",
      icon: <FaChartBar className="w-6 h-6 text-white" />,
      cardClass: "bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 rounded-xl p-4 sm:p-5",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25",
      valueClass: "text-2xl sm:text-3xl font-bold text-foreground leading-none",
    },
  ];

  return (
    <div className={page}>
      {/* Ambient background blobs */}
      <AmbientBackground />

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <WelcomeBanner
          eyebrow="Instructor Portal"
          title={`Welcome back, ${user?.name}!`}
          description="Manage assessments, track student progress, and create engaging learning experiences."
          aside={
            <div className={cn("hidden", "sm:flex", "flex-col", "items-center", card, "p-5", "min-w-[120px]")}>
              <div className={cn(iconBadge, "mb-3", "p-2.5")}>
                <FaCalendarAlt className="w-6 h-6 text-white" />
              </div>
              <p className={cn("text-xs", "font-semibold", "text-muted-foreground", "text-center")}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          }
        />

        {isLoading || loading ? (
          <LoadingState message="Loading dashboard data..." />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
              {statsData.map((stat, index) => (
                <div key={index} className={stat.cardClass}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={stat.valueClass}>{stat.value}</div>
                      <div className={cn("text-xs", "text-muted-foreground", "mt-1")}>{stat.label}</div>
                    </div>
                    <div className={stat.iconClass}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className={cn(card, cardInteractive, "shadow-2xl", "mb-8", "sm:mb-10")}>
              <div className={cardHeader}>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
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
            <div className={cn(card, cardInteractive, "shadow-2xl")}>
              <div className={cardHeader}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
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
                  <EmptyState
                    icon={FaPen}
                    title="No assessments yet"
                    description="Create your first assessment to start evaluating your students' progress and performance."
                    action={
                      <Link href="/instructor/assessments/create" className={cn(btn.primary)}>
                        <FaPen aria-hidden="true" />
                        Create your first assessment
                      </Link>
                    }
                  />
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className={cn("hidden", "lg:block", card, "overflow-hidden")}>
                      <table className="min-w-full">
                        <thead className={tableHead}>
                          <tr>
                            <th className={cn("px-6", "py-3.5", "text-left", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border")}>
                              Assessment Title
                            </th>
                            <th className={cn("px-6", "py-3.5", "text-left", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border")}>
                              Created On
                            </th>
                            <th className={cn("px-6", "py-3.5", "text-left", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border")}>
                              Status
                            </th>
                            <th className={cn("px-6", "py-3.5", "text-left", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border")}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {assessments.slice(0, 5).map((assessment) => (
                            <tr key={assessment.id} className={cn("hover:bg-indigo-500/5", tableRowHover, "transition-colors", "duration-150")}>
                              <td className={cn("px-6", "py-4", "text-sm", "text-secondary-foreground")}>
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex-shrink-0">
                                    <FaClipboardList className="w-4 h-4 text-indigo-400" />
                                  </div>
                                  <span className={cn("font-semibold", "text-secondary-foreground")}>{assessment.title}</span>
                                </div>
                              </td>
                              <td className={cn("px-6", "py-4", "text-sm", "text-secondary-foreground")}>
                                <div className={cn("flex", "items-center", "gap-2", "text-muted-foreground")}>
                                  <FaCalendarAlt className={cn("text-muted-foreground", "text-xs")} />
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
                          className="bg-input rounded-xl border border-border p-4 sm:p-5 hover:border-indigo-500/30 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-4 gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex-shrink-0">
                                <FaClipboardList className="w-4 h-4 text-indigo-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={cn("text-sm", "sm:text-base", "font-semibold", "text-secondary-foreground", "mb-1", "break-words")}>
                                  {assessment.title}
                                </h3>
                                <div className={cn("flex", "items-center", "gap-2", "text-xs", "text-muted-foreground")}>
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
        onClose={closeModal}
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
