import { cn } from "@/lib/cn.js";
import { card, page } from "@/lib/ui.js";
import { useEffect } from "react";
import Modal from "../../components/ui/Modal.jsx";
import PageLoader from "../../components/ui/PageLoader.jsx";
import AmbientBackground from "../../components/layout/AmbientBackground.jsx";
import UserManagementTable, { UserStatsGrid } from "../../components/admin/UserManagementTable.jsx";
import useUserManagement from "../../hooks/useUserManagement.js";
import { FaUsers, FaCrown, FaSync } from "react-icons/fa";

function AdminDashboard() {
  const {
    user,
    users,
    loading,
    actionLoading,
    modal,
    closeModal,
    fetchUsers,
    handleRoleChange,
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
          <div className={cn(card, "shadow-2xl", "p-6", "sm:p-8", "lg:p-10", "hover:border-indigo-500/30", "transition-all", "duration-200")}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className={cn("text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-widest", "mb-2")}>Admin Portal</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2 sm:mb-3 flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 text-white">
                    <FaCrown className="w-5 h-5" />
                  </span>
                  Admin Dashboard
                </h1>
                <p className={cn("text-secondary-foreground", "leading-relaxed", "text-sm", "sm:text-base")}>
                  Welcome back, <span className="text-indigo-400 font-semibold">{user?.name}</span>! Manage your platform and oversee all operations.
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="bg-input backdrop-blur-sm border border-border rounded-xl p-4 lg:p-6 text-center">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 inline-flex items-center justify-center mb-3">
                    <FaUsers className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground leading-none">{users.length}</p>
                  <p className={cn("text-xs", "text-muted-foreground", "mt-0.5")}>Total Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <UserStatsGrid stats={stats} totalUsers={users.length} />

        <div className={cn(card, "shadow-2xl", "overflow-hidden", "hover:border-indigo-500/30", "transition-all", "duration-200")}>
          <div className="px-6 py-4 border-b border-border bg-input">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <p className={cn("text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-widest", "mb-1")}>Management</p>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <FaUsers className="text-indigo-400" />
                  All Users
                </h2>
              </div>
              <button
                onClick={fetchUsers}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 cursor-pointer min-h-[44px]"
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
          />
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
      >
        {modal.message}
      </Modal>
    </div>
  );
}

export default AdminDashboard;
