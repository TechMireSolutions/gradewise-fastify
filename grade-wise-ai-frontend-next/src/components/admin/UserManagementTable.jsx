import {
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaCrown,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaSync,
  FaTrash,
  FaCalendarAlt,
} from "react-icons/fa";
import { getRoleBadgeColor, getRoleAvatarBg, formatRole } from "../../utils/roleDisplay.js";
import { formatDate } from "../../utils/formatDate.js";

function RoleActions({ userData, currentUserId, actionLoading, onRoleChange, onDelete, canDelete }) {
  const isSelf = userData.id === currentUserId;
  const loadingKey = `role-${userData.id}`;
  const isLoading = actionLoading === userData.id || actionLoading === loadingKey;

  if (isSelf) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {userData.role !== "admin" && (
        <button
          onClick={() => onRoleChange(userData.id, "admin", userData.name, userData.email)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]"
        >
          {isLoading ? <FaSync className="animate-spin" /> : <FaCrown className="text-xs" />}
          {isLoading ? "..." : "Admin"}
        </button>
      )}
      {userData.role !== "instructor" && (
        <button
          onClick={() => onRoleChange(userData.id, "instructor", userData.name, userData.email)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]"
        >
          {isLoading ? <FaSync className="animate-spin" /> : <FaChalkboardTeacher className="text-xs" />}
          {isLoading ? "..." : "Instructor"}
        </button>
      )}
      {userData.role !== "student" && (
        <button
          onClick={() => onRoleChange(userData.id, "student", userData.name, userData.email)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]"
        >
          {isLoading ? <FaSync className="animate-spin" /> : <FaUserGraduate className="text-xs" />}
          {isLoading ? "..." : "Student"}
        </button>
      )}
      {canDelete && onDelete && (
        <button
          onClick={() => onDelete(userData.id, userData.name)}
          aria-label={`Delete user ${userData.name}`}
          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <FaTrash className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function EmptyUsersState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
        <FaUsers className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">No users yet</h3>
      <p className="text-slate-400 max-w-sm">No users have been registered on this platform.</p>
    </div>
  );
}

export default function UserManagementTable({
  users,
  currentUserId,
  actionLoading,
  onRoleChange,
  onDelete,
  canDelete = false,
}) {
  if (users.length === 0) {
    return <EmptyUsersState />;
  }

  return (
    <>
      <div className="overflow-x-auto hidden lg:block">
        <table className="min-w-full">
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
            {users.map((userData) => (
              <tr key={userData.id} className="hover:bg-indigo-500/5 transition-colors duration-150">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-br ${getRoleAvatarBg(userData.role)}`}>
                      {userData.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-200">{userData.name}</div>
                      <div className="text-xs text-slate-500">{userData.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(userData.role)}`}>
                    {formatRole(userData.role)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    userData.verified
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  }`}>
                    {userData.verified ? <FaCheckCircle /> : <FaClock />}
                    {userData.verified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-slate-500" />
                    {formatDate(userData.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <RoleActions
                    userData={userData}
                    currentUserId={currentUserId}
                    actionLoading={actionLoading}
                    onRoleChange={onRoleChange}
                    onDelete={onDelete}
                    canDelete={canDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden divide-y divide-slate-700/30">
        {users.map((userData) => (
          <div key={userData.id} className="p-4 sm:p-5 hover:bg-indigo-500/5 transition-colors duration-150">
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 bg-gradient-to-br ${getRoleAvatarBg(userData.role)}`}>
                {userData.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-200">{userData.name}</h3>
                <p className="text-xs text-slate-500 truncate mb-2">{userData.email}</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(userData.role)}`}>
                  {formatRole(userData.role)}
                </span>
              </div>
            </div>
            <RoleActions
              userData={userData}
              currentUserId={currentUserId}
              actionLoading={actionLoading}
              onRoleChange={onRoleChange}
              onDelete={onDelete}
              canDelete={canDelete}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export function UserStatsGrid({ stats, totalUsers }) {
  const cards = [
    { value: totalUsers, label: "Total Users", icon: FaUsers, gradient: "from-indigo-500 to-violet-600", border: "border-indigo-500/30", bg: "from-indigo-500/20 to-violet-500/20" },
    { value: stats.admin, label: "Admins", icon: FaCrown, gradient: "from-red-500 to-rose-600", border: "border-red-500/30", bg: "from-red-500/20 to-rose-500/20" },
    { value: stats.instructor, label: "Instructors", icon: FaChalkboardTeacher, gradient: "from-violet-500 to-purple-600", border: "border-violet-500/30", bg: "from-violet-500/20 to-purple-500/20" },
    { value: stats.student, label: "Students", icon: FaUserGraduate, gradient: "from-emerald-500 to-teal-600", border: "border-emerald-500/30", bg: "from-emerald-500/20 to-teal-500/20" },
    { value: stats.verified, label: "Verified", icon: FaCheckCircle, gradient: "from-sky-500 to-blue-600", border: "border-sky-500/30", bg: "from-sky-500/20 to-blue-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
      {cards.map(({ value, label, icon: Icon, gradient, border, bg }) => (
        <div key={label} className={`bg-gradient-to-br ${bg} backdrop-blur-sm border ${border} rounded-xl p-3 sm:p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1">{label}</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
            </div>
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg text-white`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
