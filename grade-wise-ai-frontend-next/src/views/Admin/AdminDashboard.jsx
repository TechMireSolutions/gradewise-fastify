import { useState, useEffect } from "react";
import useAuthStore from "@/features/auth/store.js";
import { Card, CardHeader, CardContent } from "../../components/ui/Card.jsx";
import LoadingSpinner from "../../components/ui/LoadingSpinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import {
  FaUser,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaUserShield,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaSync,
  FaCrown,
  FaCalendarAlt
} from "react-icons/fa";

function AdminDashboard() {
  const { user, getUsers, changeUserRole } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });
  const [roleChangeLoading, setRoleChangeLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const showModal = (type, title, message) => {
    setModal({ isOpen: true, type, title, message });
  };

  const handleRoleChange = async (userId, newRole, userName) => {
    try {
      setRoleChangeLoading(userId);
      await changeUserRole({ userId, newRole });
      await fetchUsers();
      showModal("success", "Success", `Successfully changed ${userName}'s role to ${newRole}.`);
    } catch (error) {
      showModal("error", "Error", error.response?.data?.message || "Failed to change role.");
    } finally {
      setRoleChangeLoading(null);
    }
  };

  const filteredUsers = users.filter(u => u.role !== "super_admin");

  const getUserStats = () => {
    return filteredUsers.reduce(
      (acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        u.verified ? acc.verified++ : acc.unverified++;
        return acc;
      },
      { admin: 0, instructor: 0, student: 0, verified: 0, unverified: 0 }
    );
  };

  const stats = getUserStats();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":       return "bg-red-500/15 text-red-400 border border-red-500/20";
      case "instructor":  return "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20";
      case "student":     return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
      default:            return "bg-slate-700/60 text-slate-400 border border-slate-600/40";
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
      cardClass: "bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur-sm border border-violet-500/30 rounded-xl p-3 sm:p-4",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25 text-white",
    },
    {
      value: stats.student,
      label: "Students",
      icon: <FaUserGraduate className="w-5 h-5" />,
      cardClass: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-3 sm:p-4",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 text-white",
    },
    {
      value: stats.verified,
      label: "Verified",
      icon: <FaCheckCircle className="w-5 h-5" />,
      cardClass: "bg-gradient-to-br from-sky-500/20 to-blue-500/20 backdrop-blur-sm border border-sky-500/30 rounded-xl p-3 sm:p-4",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25 text-white",
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

        {/* Welcome Section */}
        <div className="mb-8 sm:mb-10">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 hover:border-indigo-500/30 transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Admin Portal</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2 sm:mb-3 flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 text-white">
                    <FaCrown className="w-5 h-5" />
                  </span>
                  Admin Dashboard
                </h1>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  Welcome back, <span className="text-indigo-400 font-semibold">{user?.name}</span>! Manage your platform and oversee all operations.
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/40 rounded-xl p-4 lg:p-6 text-center">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 inline-flex items-center justify-center mb-3">
                    <FaUsers className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white leading-none">{filteredUsers.length}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Total Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10">
          {statsData.map((stat, index) => (
            <div key={index} className={`${stat.cardClass} hover:scale-105 transition-all duration-200`}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className={stat.iconClass}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white leading-none">{stat.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Users List Card */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-200">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Management</p>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaUsers className="text-indigo-400" />
                  All Users
                </h2>
              </div>
              <button
                onClick={fetchUsers}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 cursor-pointer min-h-[44px]"
              >
                <FaSync className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <LoadingSpinner size="lg" type="spinner" color="blue" />
              </div>
              <p className="text-slate-400 text-sm">Loading users...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="overflow-x-auto hidden lg:block">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-slate-800/60">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <FaUser />
                          User
                        </div>
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <FaUserShield />
                          Role
                        </div>
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <FaCheckCircle />
                          Status
                        </div>
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt />
                          Joined
                        </div>
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-28 text-center">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center">
                              <FaUsers className="w-8 h-8 text-indigo-400" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white mb-2">No users yet</h3>
                              <p className="text-slate-400 max-w-sm">No users have been registered on this platform.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {filteredUsers.map((userData) => (
                      <tr key={userData.id} className="hover:bg-indigo-500/5 transition-colors duration-150">
                        <td className="px-6 py-4 text-sm text-slate-300">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                              userData.role === "admin" ? "bg-gradient-to-br from-red-500 to-rose-600" :
                              userData.role === "instructor" ? "bg-gradient-to-br from-indigo-500 to-violet-600" :
                              "bg-gradient-to-br from-emerald-500 to-teal-600"
                            }`}>
                              {userData.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-200">{userData.name}</div>
                              <div className="text-xs text-slate-500">{userData.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(userData.role)}`}>
                            {userData.role === "admin" && <FaCrown className="text-xs" />}
                            {userData.role === "instructor" && <FaChalkboardTeacher className="text-xs" />}
                            {userData.role === "student" && <FaUserGraduate className="text-xs" />}
                            {userData.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            userData.verified
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                          }`}>
                            {userData.verified ? <FaCheckCircle /> : <FaClock />}
                            {userData.verified ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          <div className="flex items-center gap-2 text-slate-400">
                            <FaCalendarAlt className="text-slate-500" />
                            {new Date(userData.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {userData.id !== user?.id && (
                            <div className="flex flex-wrap gap-2">
                              {userData.role !== "admin" && (
                                <button
                                  onClick={() => handleRoleChange(userData.id, "admin", userData.name)}
                                  disabled={roleChangeLoading === userData.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]"
                                >
                                  {roleChangeLoading === userData.id ? <FaSync className="animate-spin" /> : <FaCrown className="text-xs" />}
                                  {roleChangeLoading === userData.id ? "..." : "Admin"}
                                </button>
                              )}
                              {userData.role !== "instructor" && (
                                <button
                                  onClick={() => handleRoleChange(userData.id, "instructor", userData.name)}
                                  disabled={roleChangeLoading === userData.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]"
                                >
                                  {roleChangeLoading === userData.id ? <FaSync className="animate-spin" /> : <FaChalkboardTeacher className="text-xs" />}
                                  {roleChangeLoading === userData.id ? "..." : "Instructor"}
                                </button>
                              )}
                              {userData.role !== "student" && (
                                <button
                                  onClick={() => handleRoleChange(userData.id, "student", userData.name)}
                                  disabled={roleChangeLoading === userData.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]"
                                >
                                  {roleChangeLoading === userData.id ? <FaSync className="animate-spin" /> : <FaUserGraduate className="text-xs" />}
                                  {roleChangeLoading === userData.id ? "..." : "Student"}
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-slate-700/30">
                {filteredUsers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-28 text-center px-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                      <FaUsers className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No users yet</h3>
                    <p className="text-slate-400 max-w-sm">No users have been registered on this platform.</p>
                  </div>
                )}
                {filteredUsers.map((userData) => (
                  <div
                    key={userData.id}
                    className="p-4 sm:p-5 hover:bg-indigo-500/5 transition-colors duration-150"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0 ${
                        userData.role === "admin" ? "bg-gradient-to-br from-red-500 to-rose-600" :
                        userData.role === "instructor" ? "bg-gradient-to-br from-indigo-500 to-violet-600" :
                        "bg-gradient-to-br from-emerald-500 to-teal-600"
                      }`}>
                        {userData.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-200 text-base sm:text-lg mb-0.5">{userData.name}</h3>
                        <p className="text-xs sm:text-sm text-slate-500 truncate mb-2">{userData.email}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(userData.role)}`}>
                            {userData.role === "admin" && <FaCrown className="text-xs" />}
                            {userData.role === "instructor" && <FaChalkboardTeacher className="text-xs" />}
                            {userData.role === "student" && <FaUserGraduate className="text-xs" />}
                            {userData.role}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                            userData.verified
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                          }`}>
                            {userData.verified ? <FaCheckCircle /> : <FaClock />}
                            {userData.verified ? "Verified" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-4 pl-15">
                      <FaCalendarAlt className="text-slate-500" />
                      <span>Joined: {new Date(userData.created_at).toLocaleDateString()}</span>
                    </div>

                    {userData.id !== user?.id && (
                      <div className="flex flex-wrap gap-2 pl-15">
                        {userData.role !== "admin" && (
                          <button
                            onClick={() => handleRoleChange(userData.id, "admin", userData.name)}
                            disabled={roleChangeLoading === userData.id}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]"
                          >
                            {roleChangeLoading === userData.id ? <FaSync className="animate-spin" /> : <FaCrown className="text-xs" />}
                            {roleChangeLoading === userData.id ? "..." : "Admin"}
                          </button>
                        )}
                        {userData.role !== "instructor" && (
                          <button
                            onClick={() => handleRoleChange(userData.id, "instructor", userData.name)}
                            disabled={roleChangeLoading === userData.id}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]"
                          >
                            {roleChangeLoading === userData.id ? <FaSync className="animate-spin" /> : <FaChalkboardTeacher className="text-xs" />}
                            {roleChangeLoading === userData.id ? "..." : "Instructor"}
                          </button>
                        )}
                        {userData.role !== "student" && (
                          <button
                            onClick={() => handleRoleChange(userData.id, "student", userData.name)}
                            disabled={roleChangeLoading === userData.id}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]"
                          >
                            {roleChangeLoading === userData.id ? <FaSync className="animate-spin" /> : <FaUserGraduate className="text-xs" />}
                            {roleChangeLoading === userData.id ? "..." : "Student"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
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

export default AdminDashboard;
