import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useAssessmentStore from "@/features/assessments/store.js";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Modal from "../../../components/ui/Modal";
import AddStudent from "../AddStudent.jsx";
import { FaUserGraduate, FaUserMinus, FaUsers } from "react-icons/fa";

function EnrollStudents() {
  const { assessmentId } = useParams();
  const { getEnrolledStudents, unenrollStudent, enrolledStudents, loading } = useAssessmentStore();
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });

  useEffect(() => {
    const fetch = async () => {
      try {
        await getEnrolledStudents(assessmentId);
      } catch (err) {
        showModal("error", "Error", err.message || "Failed to load students");
      }
    };
    fetch();
  }, [assessmentId, getEnrolledStudents]);

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

  const showModal = (type, title, message) => {
    setModal({ isOpen: true, type, title, message });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
              <FaUsers className="text-white text-lg" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Assessment Management</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Enroll Students</h1>
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed ml-14">Add or remove students from this assessment</p>
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
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 h-fit">
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
                  <FaUserGraduate className="text-emerald-400 text-sm" />
                </div>
                <h2 className="text-xl font-bold text-white">Add Student</h2>
              </div>
            </div>
            <div className="p-6">
              <AddStudent compact assessmentId={assessmentId} onStudentAdded={handleStudentAdded} />
            </div>
          </div>

          {/* Right: Enrolled Students */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 h-fit">
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20">
                  <FaUsers className="text-indigo-400 text-sm" />
                </div>
                <h2 className="text-xl font-bold text-white">Enrolled Students</h2>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    <LoadingSpinner size="lg" type="spinner" color="blue" />
                  </div>
                  <p className="text-slate-400 text-sm">Loading students...</p>
                </div>
              ) : enrolledStudents?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-28 text-center px-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                    <FaUserGraduate className="text-indigo-400 text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Students Enrolled</h3>
                  <p className="text-slate-400 max-w-sm mb-8">Add students using the form to the left to get started.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-slate-800/60">
                        <tr>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Name</th>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Email</th>
                          <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {enrolledStudents.map((s) => (
                          <tr key={s.id} className="hover:bg-indigo-500/5 transition-colors duration-150">
                            <td className="px-6 py-4 text-sm font-medium text-slate-200">{s.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-400">{s.email}</td>
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
                      <div key={s.id} className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 sm:p-5 hover:border-indigo-500/30 transition-all duration-200">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                              <FaUserGraduate className="text-indigo-400 text-sm" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-200 text-sm truncate">{s.name}</p>
                              <p className="text-xs text-slate-500 truncate">{s.email}</p>
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

      <Modal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} type={modal.type} title={modal.title}>
        {modal.message}
      </Modal>
    </div>
  );
}

export default EnrollStudents;
