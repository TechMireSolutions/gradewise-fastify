import { cn } from "@/lib/cn.js";
import { card, page } from "@/lib/ui.js";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Modal from "../../components/ui/Modal.jsx";
import PageLoader from "../../components/ui/PageLoader.jsx";
import AmbientBackground from "../../components/layout/AmbientBackground.jsx";
import UserManagementTable, { UserStatsGrid } from "../../components/admin/UserManagementTable.jsx";
import useUserManagement from "../../hooks/useUserManagement.js";
import {
  FaUsers,
  FaCrown,
  FaSync,
  FaShieldAlt,
  FaKey,
  FaArrowRight,
} from "react-icons/fa";

function SuperAdminDashboard() {
  const {
    user,
    users,
    loading,
    actionLoading,
    modal,
    closeModal,
    fetchUsers,
    handleRoleChange,
    handleDeleteUser,
    confirmDeleteUser,
    pendingDelete,
    stats,
  } = useUserManagement();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) return <PageLoader message="Loading users..." />;

  return (
    <div className={page}>
      <AmbientBackground />

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 sm:mb-10">
          <div className={cn(card, "shadow-2xl", "p-6", "sm:p-8", "lg:p-10")}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex-1">
                <p className={cn("text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-widest", "mb-3")}>
                  System Control
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight flex items-center gap-3 mb-2">
                  <span className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                    <FaCrown className="w-5 h-5 text-yellow-300" />
                  </span>
                  Super Admin Dashboard
                </h1>
                <p className={cn("text-secondary-foreground", "leading-relaxed", "mb-5")}>
                  Welcome back, <span className="text-white font-semibold">{user?.name}</span>
                </p>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4 inline-flex items-start gap-3">
                  <FaShieldAlt className="text-amber-400 text-lg flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <strong className="block text-amber-300 mb-0.5">Role Permissions</strong>
                    <span className={"text-muted-foreground"}>
                      Manage users, promote/demote roles, and configure system API keys.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col gap-3 flex-shrink-0">
                <div className="bg-input border border-border rounded-2xl p-4 text-center min-w-[90px]">
                  <FaUsers className="w-7 h-7 mx-auto mb-1.5 text-indigo-400" />
                  <p className="text-2xl font-bold text-foreground leading-none mb-1">{users.length}</p>
                  <p className={cn("text-xs", "text-muted-foreground", "font-medium")}>Total Users</p>
                </div>
                <Link
                  to="/super-admin/api-config"
                  className="inline-flex flex-col items-center gap-1.5 bg-input hover:bg-btn-secondary border border-border hover:border-indigo-500/30 backdrop-blur-sm rounded-2xl p-4 text-center transition-all duration-200 group min-w-[90px]"
                >
                  <FaKey className="w-7 h-7 text-indigo-400 group-hover:scale-110 transition-transform duration-150" />
                  <span className={cn("text-xs", "font-semibold", "text-secondary-foreground", "group-hover:text-foreground", "transition-colors", "whitespace-nowrap")}>API Keys</span>
                  <FaArrowRight className={cn("w-3", "h-3", "text-muted-foreground", "group-hover:text-indigo-400", "transition-colors")} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <UserStatsGrid stats={stats} totalUsers={users.length} />

        <div className={cn(card, "shadow-2xl", "overflow-hidden")}>
          <div className="px-6 py-4 border-b border-border bg-input">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                  <FaUsers className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Platform Users Management</h2>
                  <p className={cn("text-muted-foreground", "text-xs", "mt-0.5")}>
                    {users.length} user{users.length !== 1 ? "s" : ""} (excluding super admins)
                  </p>
                </div>
              </div>
              <button
                onClick={fetchUsers}
                className={cn("inline-flex", "items-center", "gap-2", "px-4", "py-2.5", "bg-btn-secondary", "hover:bg-surface-elevated", "border", "border-border", "text-secondary-foreground", "hover:text-foreground", "rounded-xl", "font-medium", "text-sm", "transition-all", "duration-200", "active:scale-95", "cursor-pointer", "min-h-[44px]")}
              >
                <FaSync />
                Refresh
              </button>
            </div>
          </div>

          <UserManagementTable
            users={users}
            currentUserId={user?.id}
            actionLoading={actionLoading}
            onRoleChange={handleRoleChange}
            onDelete={handleDeleteUser}
            canDelete
          />
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
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
