import { cn } from "@/lib/cn.js";
import { card, cardHeader, cardInteractive, page, tableHead, tableRowHover } from "@/lib/ui.js";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useAssessmentStore from "@/features/assessments/store.js";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Modal from "../../../components/ui/Modal";
import AddStudent from "../AddStudent.jsx";
import { FaUserGraduate, FaUserMinus, FaUsers } from "react-icons/fa";
import AmbientBackground from "../../../components/layout/AmbientBackground.jsx";
import useModal from "../../../hooks/useModal.js";

function EnrollStudents() {
  const { assessmentId } = useParams();
  const { getEnrolledStudents, unenrollStudent, enrolledStudents, loading } = useAssessmentStore();
  const { modal, showModal, closeModal } = useModal();

  useEffect(() => {
    const fetch = async () => {
      try {
        await getEnrolledStudents(assessmentId);
      } catch (err) {
        showModal("error", "Error", err.message || "Failed to load students");
      }
    };
    fetch();
  }, [assessmentId, getEnrolledStudents, showModal]);

  const handleUnenroll = async (studentId) => {
    try {
      await unenrollStudent(assessmentId, studentId);
      showModal("success", "Success", "Student removed");
      await getEnrolledStudents(assessmentId);
    } catch (err) {
      showModal("error", "Error", err.message || "Failed to unenroll");
    }
  };

  const handleStudentAdded = () => getEnrolledStudents(assessmentId);

  return (
    <div className={page}>
      {/* Ambient background blobs */}
      <AmbientBackground />

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
              <FaUsers className="text-white text-lg" />
            </div>
            <div>
              <p className={cn("text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-widest", "mb-0.5")}>Assessment Management</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Enroll Students</h1>
            </div>
          </div>
          <p className={cn("text-muted-foreground", "leading-relaxed", "ml-14")}>Add or remove students from this assessment</p>
        </div>

        {/* Stats bar */}
        {!loading && enrolledStudents?.length > 0 && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <FaUserGraduate className="text-xs" />
              {enrolledStudents.length} {enrolledStudents.length === 1 ? "student" : "students"} enrolled
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Add Student Form */}
          <div className={cn(card, cardInteractive, "shadow-2xl", "h-fit")}>
            <div className={cardHeader}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
                  <FaUserGraduate className="text-emerald-400 text-sm" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Add Student</h2>
              </div>
            </div>
            <div className="p-6">
              <AddStudent compact assessmentId={assessmentId} onStudentAdded={handleStudentAdded} />
            </div>
          </div>

          {/* Right: Enrolled Students */}
          <div className={cn(card, cardInteractive, "shadow-2xl", "h-fit")}>
            <div className={cardHeader}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20">
                  <FaUsers className="text-indigo-400 text-sm" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Enrolled Students</h2>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    <LoadingSpinner size="lg" type="spinner" color="blue" />
                  </div>
                  <p className={cn("text-muted-foreground", "text-sm")}>Loading students...</p>
                </div>
              ) : enrolledStudents?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-28 text-center px-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                    <FaUserGraduate className="text-indigo-400 text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">No Students Enrolled</h3>
                  <p className={cn("text-muted-foreground", "max-w-sm", "mb-8")}>Add students using the form to the left to get started.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className={cn("hidden", "lg:block", card, "overflow-hidden")}>
                    <table className="min-w-full">
                      <thead className={tableHead}>
                        <tr>
                          <th className={cn("px-6", "py-3.5", "text-left", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border")}>Name</th>
                          <th className={cn("px-6", "py-3.5", "text-left", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border")}>Email</th>
                          <th className={cn("px-6", "py-3.5", "text-right", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border")}>Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {enrolledStudents.map((s) => (
                          <tr key={s.id} className={cn("hover:bg-indigo-500/5", tableRowHover, "transition-colors", "duration-150")}>
                            <td className={cn("px-6", "py-4", "text-sm", "font-medium", "text-secondary-foreground")}>{s.name}</td>
                            <td className={cn("px-6", "py-4", "text-sm", "text-muted-foreground")}>{s.email}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleUnenroll(s.id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer"
                              >
                                <FaUserMinus className="text-xs" />
                                Unenroll
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-3">
                    {enrolledStudents.map((s) => (
                      <div key={s.id} className="bg-input border border-border rounded-xl p-4 sm:p-5 hover:border-indigo-500/30 transition-all duration-200">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                              <FaUserGraduate className="text-indigo-400 text-sm" />
                            </div>
                            <div className="min-w-0">
                              <p className={cn("font-semibold", "text-secondary-foreground", "text-sm", "truncate")}>{s.name}</p>
                              <p className={cn("text-xs", "text-muted-foreground", "truncate")}>{s.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnenroll(s.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer flex-shrink-0"
                          >
                            <FaUserMinus className="text-xs" />
                            Unenroll
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={modal.isOpen} onClose={closeModal} type={modal.type} title={modal.title}>
        {modal.message}
      </Modal>
    </div>
  );
}

export default EnrollStudents;
