import { cn } from "@/lib/cn.js";
import { tableHead, focusRing } from "@/lib/ui.js";
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
  FaShieldAlt,
} from "react-icons/fa";
import { getRoleBadgeColor, getRoleAvatarBg, formatRole } from "../../utils/roleDisplay.js";
import { formatDate } from "../../utils/formatDate.js";
import EmptyState from "../ui/EmptyState.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";
import { DashboardStatCard, DashboardStatGrid } from "@/components/dashboard/shared/index.js";

function RoleActions({
  userData,
  currentUserId,
  actionLoading,
  onRoleChange,
  onOpenRoleModal,
  onDelete,
  canDelete,
}) {
  const isSelf = userData.id === currentUserId;
  const loadingKey = `role-${userData.id}`;
  const isLoading = actionLoading === userData.id || actionLoading === loadingKey;

  if (isSelf) return null;

  if (onOpenRoleModal) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenRoleModal(userData)}
          disabled={isLoading}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2 bg-btn-secondary hover:bg-surface-elevated text-secondary-foreground hover:text-foreground border border-border rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]",
            focusRing
          )}
        >
          <FaShieldAlt className="text-xs text-indigo-500 dark:text-indigo-400" />
          Change Role
        </button>

        {canDelete && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(userData.id, userData.name)}
            aria-label={`Delete user ${userData.name}`}
            className={cn(
              "p-2 rounded-lg text-muted-foreground hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center",
              focusRing
            )}
          >
            <FaTrash className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {userData.role !== "admin" && (
        <button
          onClick={() => onRoleChange(userData.id, "admin", userData.name, userData.email)}
          disabled={isLoading}
          className={cn("inline-flex items-center gap-1.5 px-3 py-2.5 bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]", focusRing)}
        >
          {isLoading ? <FaSync className="animate-spin" /> : <FaCrown className="text-xs" />}
          {isLoading ? "..." : "Admin"}
        </button>
      )}
      {userData.role !== "instructor" && (
        <button
          onClick={() => onRoleChange(userData.id, "instructor", userData.name, userData.email)}
          disabled={isLoading}
          className={cn("inline-flex items-center gap-1.5 px-3 py-2.5 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]", focusRing)}
        >
          {isLoading ? <FaSync className="animate-spin" /> : <FaChalkboardTeacher className="text-xs" />}
          {isLoading ? "..." : "Instructor"}
        </button>
      )}
      {userData.role !== "student" && (
        <button
          onClick={() => onRoleChange(userData.id, "student", userData.name, userData.email)}
          disabled={isLoading}
          className={cn("inline-flex items-center gap-1.5 px-3 py-2.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]", focusRing)}
        >
          {isLoading ? <FaSync className="animate-spin" /> : <FaUserGraduate className="text-xs" />}
          {isLoading ? "..." : "Student"}
        </button>
      )}
      {canDelete && onDelete && (
        <button
          onClick={() => onDelete(userData.id, userData.name)}
          aria-label={`Delete user ${userData.name}`}
          className={cn("p-2", "rounded-lg", "text-muted-foreground", "hover:text-red-700 dark:hover:text-red-400", "hover:bg-red-500/10", "border", "border-transparent", "hover:border-red-500/20", "transition-all", "duration-150", "cursor-pointer", "min-w-[44px]", "min-h-[44px]", "flex", "items-center", "justify-center", focusRing)}
        >
          <FaTrash className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function EmptyUsersState() {
  return (
    <EmptyState
      icon={FaUsers}
      title="No users yet"
      description="No users have been registered on this platform."
    />
  );
}

export default function UserManagementTable({
  users,
  currentUserId,
  actionLoading,
  onRoleChange,
  onOpenRoleModal,
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
            <tr className={tableHead}>
              <th className={cn("px-6", "py-3.5", "text-start", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border")}>User</th>
              <th className={cn("px-6", "py-3.5", "text-start", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border")}>Role</th>
              <th className={cn("px-6", "py-3.5", "text-start", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border")}>Status</th>
              <th className={cn("px-6", "py-3.5", "text-start", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border")}>Joined</th>
              <th className={cn("px-6", "py-3.5", "text-start", "text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-wider", "border-b", "border-border")}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((userData) => (
              <tr key={userData.id} className="hover:bg-indigo-500/5 transition-colors duration-150">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-br ${getRoleAvatarBg(userData.role)}`}>
                      {userData.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={cn("text-sm", "font-semibold", "text-secondary-foreground")}>{userData.name}</div>
                      <div className={cn("text-xs", "text-muted-foreground")}>{userData.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(userData.role)}`}>
                    {formatRole(userData.role)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge variant={userData.verified ? "success" : "warning"}>
                    {userData.verified ? <FaCheckCircle /> : <FaClock />}
                    {userData.verified ? "Verified" : "Pending"}
                  </StatusBadge>
                </td>
                <td className={cn("px-6", "py-4", "text-sm", "text-muted-foreground")}>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className={"text-muted-foreground"} />
                    {formatDate(userData.createdAt || userData.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <RoleActions
                    userData={userData}
                    currentUserId={currentUserId}
                    actionLoading={actionLoading}
                    onRoleChange={onRoleChange}
                    onOpenRoleModal={onOpenRoleModal}
                    onDelete={onDelete}
                    canDelete={canDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden divide-y divide-border">
        {users.map((userData) => (
          <div key={userData.id} className="p-4 sm:p-5 hover:bg-indigo-500/5 transition-colors duration-150">
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 bg-gradient-to-br ${getRoleAvatarBg(userData.role)}`}>
                {userData.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={cn("font-semibold", "text-secondary-foreground")}>{userData.name}</h3>
                <p className={cn("text-xs", "text-muted-foreground", "truncate", "mb-2")}>{userData.email}</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(userData.role)}`}>
                  {formatRole(userData.role)}
                </span>
                <div className={cn("flex", "items-center", "gap-2", "text-xs", "text-muted-foreground", "mt-2")}>
                  <FaCalendarAlt />
                  Joined: {formatDate(userData.createdAt || userData.created_at)}
                </div>
              </div>
            </div>
            <RoleActions
              userData={userData}
              currentUserId={currentUserId}
              actionLoading={actionLoading}
              onRoleChange={onRoleChange}
              onOpenRoleModal={onOpenRoleModal}
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
    { value: totalUsers, label: "Total Users", icon: FaUsers, tone: "indigo" },
    { value: stats.admin, label: "Admins", icon: FaCrown, tone: "rose" },
    { value: stats.instructor, label: "Instructors", icon: FaChalkboardTeacher, tone: "purple" },
    { value: stats.student, label: "Students", icon: FaUserGraduate, tone: "emerald" },
    { value: stats.verified, label: "Verified", icon: FaCheckCircle, tone: "sky" },
  ];

  return (
    <DashboardStatGrid columns={5}>
      {cards.map(({ value, label, icon, tone }) => (
        <DashboardStatCard
          key={label}
          label={label}
          value={value}
          icon={icon}
          tone={tone}
        />
      ))}
    </DashboardStatGrid>
  );
}

