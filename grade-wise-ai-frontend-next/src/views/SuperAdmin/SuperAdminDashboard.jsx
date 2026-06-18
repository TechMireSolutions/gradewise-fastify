import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "@/features/auth/store.js";
import { Card, CardHeader, CardContent } from "../../components/ui/Card.jsx";
import LoadingSpinner from "../../components/ui/LoadingSpinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import {
  FaUsers,
  FaCheckCircle,
  FaTrash,
  FaCrown,
  FaUserShield,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaSync,
  FaShieldAlt,
  FaKey,
  FaArrowRight,
} from "react-icons/fa";

function SuperAdminDashboard() {
  const { user, getUsers, changeUserRole, deleteUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const showModal = (type, title, message) =>
    setModal({ isOpen: true, type, title, message });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.users);
    } catch {
      showModal("error", "Error", "Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole, userName, userEmail) => {
    try {
      setActionLoading(`role-${userId}`);
      await changeUserRole({ userId, newRole, userEmail });
      await fetchUsers();
      showModal("success", "Success", `Successfully changed ${userName}'s role to ${newRole}.`);
    } catch (error) {
      showModal(
        "error",
        "Error",
        `Failed to change user role. ${error.response?.data?.message || "Please try again."}`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = (userId, userName) => {
    setPendingDelete({ userId, userName });
    showModal(
      "warning",
      "Confirm Deletion",
      `Are you sure you want to delete ${userName}? This action cannot be undone.`
    );
  };

  const confirmDeleteUser = async () => {
    if (!pendingDelete) return;
    try {
      setActionLoading(`delete-${pendingDelete.userId}`);
      await deleteUser(pendingDelete.userId);
      await fetchUsers();
      showModal("success", "User Deleted", `${pendingDelete.userName} has been deleted successfully.`);
    } catch (error) {
      showModal("error", "Error", error.response?.data?.message || "Failed to delete user.");
    } finally {
      setActionLoading(null);
      setPendingDelete(null);
    }
  };

  const filteredUsers = users.filter(u => u.role !== "super_admin");

  const getUserStats = () =>
    filteredUsers.reduce(
      (acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        acc.verified += u.verified ? 1 : 0;
        return acc;
      },
      { admin: 0, instructor: 0, student: 0, verified: 0 }
    );

  const stats = getUserStats();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "super_admin": return "bg-violet-500/15 text-violet-400 border border-violet-500/20";
      case "admin":       return "bg-red-500/15 text-red-400 border border-red-500/20";
      case "instructor":  return "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20";
      case "student":     return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
      default:            return "bg-slate-700/60 text-slate-400 border border-slate-600/40";
    }
  };

  const getRoleAvatarBg = (role) => {
    switch (role) {
      case "super_admin": return "bg-gradient-to-br from-violet-500 to-purple-600";
      case "admin":       return "bg-gradient-to-br from-red-500 to-rose-600";
      case "instructor":  return "bg-gradient-to-br from-indigo-500 to-violet-600";
      case "student":     return "bg-gradient-to-br from-emerald-500 to-teal-600";
      default:            return "bg-slate-600";
    }
  };

  const formatRole = (role) => {
    switch (role) {
      case "super_admin": return "Super Admin";
      case "admin":       return "Admin";
      case "instructor":  return "Instructor";
      case "student":     return "Student";
      default:            return role;
    }
  };

  const statsData = [
    {
      value: filteredUsers.length,
      label: "Total Users",
      icon: <FaUsers className="w-5 h-5" />,
      cardClass: "bg-gradient-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-3 sm:p-4",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 text-white",
    },
    {
      value: stats.admin,
      label: "Admins",
      icon: <FaUserShield className="w-5 h-5" />,
      cardClass: "bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-3 sm:p-4",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25 text-white",
    },
    {
      value: stats.instructor,
      label: "Instructors",
      icon: <FaChalkboardTeacher className="w-5 h-5" />,
      cardClass: "bg-gradient-to-br from-sky-500/20 to-blue-500/20 backdrop-blur-sm border border-sky-500/30 rounded-xl p-3 sm:p-4",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25 text-white",
    },
    {
      value: stats.student,
      label: "Students",
      icon: <FaUserGraduate className="w-5 h-5" />,
      cardClass: "bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 rounded-xl p-3 sm:p-4",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25 text-white",
    },
    {
      value: stats.verified,
      label: "Verified",
      icon: <FaCheckCircle className="w-5 h-5" />,
      cardClass: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-3 sm:p-4",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <div className="mb-8 sm:mb-10">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex-1">
                {/* Eyebrow */}
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                  System Control
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3 mb-2">
                  <span className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                    <FaCrown className="w-5 h-5 text-yellow-300" />
                  </span>
                  Super Admin Dashboard
                </h1>
                <p className="text-slate-300 leading-relaxed mb-5">
                  Welcome back, <span className="text-white font-semibold">{user?.name}</span>
                </p>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4 inline-flex items-start gap-3">
                  <FaShieldAlt className="text-amber-400 text-lg flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <strong className="block text-amber-300 mb-0.5">Role Permissions</strong>
                    <span className="text-slate-400">
                      Manage users, promote/demote roles, and configure system API keys.
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick-access cards */}
              <div className="flex flex-row sm:flex-col gap-3 flex-shrink-0">
                <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4 text-center min-w-[90px]">
                  <FaUsers className="w-7 h-7 mx-auto mb-1.5 text-indigo-400" />
                  <p className="text-2xl font-bold text-white leading-none mb-1">{filteredUsers.length}</p>
                  <p className="text-xs text-slate-400 font-medium">Total Users</p>
                </div>
                <Link
                  to="/super-admin/api-config"
                  className="inline-flex flex-col items-center gap-1.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 hover:border-indigo-500/30 backdrop-blur-sm rounded-2xl p-4 text-center transition-all duration-200 group min-w-[90px]"
                >
                  <FaKey className="w-7 h-7 text-indigo-400 group-hover:scale-110 transition-transform duration-150" />
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors whitespace-nowrap">API Keys</span>
                  <FaArrowRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {statsData.map((stat, index) => (
            <div key={index} className={stat.cardClass}>
              <div className="flex flex-col items-center text-center gap-2">
                <div className={stat.iconClass}>
                  {stat.icon}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white leading-none">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Users Table ─────────────────────────────────────────────────── */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                  <FaUsers className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Platform Users Management</h2>
                  <p className="text-slate-400 text-xs mt-0.5">{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} (excluding super admins)</p>
                </div>
              </div>
              <button
                onClick={fetchUsers}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer min-h-[44px]"
              >
                <FaSync className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <LoadingSpinner size="lg" type="spinner" color="blue" />
              </div>
              <p className="text-slate-400 text-sm">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-28 text-center px-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                    <FaUsers className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No users yet</h3>
                  <p className="text-slate-400 max-w-sm mb-8">No platform users have been registered. Users will appear here once they sign up.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800/60">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">User</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Role</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Status</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Joined</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {filteredUsers.map(userData => (
                      <tr
                        key={userData.id}
                        className="hover:bg-indigo-500/5 transition-colors duration-150"
                      >
                        {/* User cell */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg ${getRoleAvatarBg(userData.role)}`}
                            >
                              {userData.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-200">
                                {userData.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {userData.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role cell */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(userData.role)}`}>
                            {formatRole(userData.role)}
                          </span>
                        </td>

                        {/* Status cell */}
                        <td className="px-6 py-4">
                          {userData.verified ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              <FaCheckCircle className="w-2.5 h-2.5" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Joined cell */}
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(userData.created_at).toLocaleDateString()}
                        </td>

                        {/* Actions cell */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {userData.role !== "admin" && (
                              <button
                                onClick={() => handleRoleChange(userData.id, "admin", userData.name, userData.email)}
                                disabled={actionLoading === `role-${userData.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]"
                              >
                                {actionLoading === `role-${userData.id}` ? "..." : (
                                  <><FaArrowRight className="w-2.5 h-2.5" /> Admin</>
                                )}
                              </button>
                            )}
                            {userData.role !== "instructor" && (
                              <button
                                onClick={() => handleRoleChange(userData.id, "instructor", userData.name, userData.email)}
                                disabled={actionLoading === `role-${userData.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]"
                              >
                                {actionLoading === `role-${userData.id}` ? "..." : (
                                  <><FaArrowRight className="w-2.5 h-2.5" /> Instructor</>
                                )}
                              </button>
                            )}
                            {userData.role !== "student" && (
                              <button
                                onClick={() => handleRoleChange(userData.id, "student", userData.name, userData.email)}
                                disabled={actionLoading === `role-${userData.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]"
                              >
                                {actionLoading === `role-${userData.id}` ? "..." : (
                                  <><FaArrowRight className="w-2.5 h-2.5" /> Student</>
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(userData.id, userData.name)}
                              aria-label={`Delete user ${userData.name}`}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                            >
                              <FaTrash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => {
          setModal({ ...modal, isOpen: false });
          setPendingDelete(null);
        }}
        onConfirm={pendingDelete ? confirmDeleteUser : undefined}
        type={modal.type}
        title={modal.title}
        loading={pendingDelete && actionLoading === `delete-${pendingDelete.userId}`}
        confirmText="Delete User"
      >
        {modal.message}
      </Modal>
    </div>
  );
}

export default SuperAdminDashboard;
