"use client";

import { useEffect, useRef } from "react";
import { page, pageInner } from "@/lib/ui.js";
import { FaUserPlus, FaFileCsv } from "react-icons/fa";
import Modal from "@/components/ui/Modal.jsx";
import PageLoader from "@/components/ui/PageLoader.jsx";
import { Button } from "@/components/ui/index.js";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import { UserStatsGrid } from "@/components/admin/UserManagementTable.jsx";
import useUserManagement from "@/hooks/useUserManagement.js";
import SuperAdminUsersSection from "./components/SuperAdminUsersSection.jsx";
import AddUserModal from "./components/AddUserModal.jsx";
import ChangeRoleModal from "./components/ChangeRoleModal.jsx";
import DeleteUserModal from "./components/DeleteUserModal.jsx";

export default function SuperAdminUsers() {
  const {
    user,
    users,
    totalUsers,
    loading,
    actionLoading,
    modal,
    closeModal,
    fetchUsers,
    handleRoleChange,
    handleCreateUser,
    handleDeleteUser,
    confirmDeleteUser,
    stats,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    activeModal,
    selectedUser,
    openCreateModal,
    openRoleModal,
    closeActiveModal,
  } = useUserManagement();

  const isFirstMount = useRef(true);

  // Initial fetch on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search effect (300ms)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      fetchUsers({ search: searchQuery, role: roleFilter || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (term) => {
    setSearchQuery(term);
  };

  const handleRoleFilterChange = (role) => {
    setRoleFilter(role);
    fetchUsers({ role: role || undefined, search: searchQuery || undefined });
  };

  const handleExportCsv = () => {
    if (!users || users.length === 0) return;
    const headers = ["ID", "Name", "Email", "Role", "Verified", "Created At"];
    const rows = users.map((u) => [
      u.id,
      `"${(u.name || "").replace(/"/g, '""')}"`,
      `"${(u.email || "").replace(/"/g, '""')}"`,
      u.role,
      u.verified ? "Yes" : "No",
      u.createdAt || u.created_at || "",
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gradewise_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && users.length === 0) {
    return <PageLoader message="Loading users..." />;
  }

  return (
    <div className={page}>
      <AmbientBackground />

      <MainLandmark className={pageInner}>
        <div className="mb-6 sm:mb-8">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
            Access Control & RBAC
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight text-balance">
                User & Role Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1 text-pretty">
                Search, filter, invite, and reassign roles across all platform accounts.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              <Button
                variant="secondary"
                onClick={handleExportCsv}
                className="gap-2"
                title="Download user directory as CSV"
              >
                <FaFileCsv className="w-3.5 h-3.5 text-emerald-500" />
                Export CSV
              </Button>

              <Button
                variant="primary"
                onClick={openCreateModal}
                className="gap-2"
              >
                <FaUserPlus className="w-3.5 h-3.5" />
                Add New User
              </Button>
            </div>
          </div>
        </div>

        <UserStatsGrid
          stats={stats}
          totalUsers={totalUsers}
          activeRole={roleFilter}
          onSelectRole={handleRoleFilterChange}
        />

        <SuperAdminUsersSection
          users={users}
          currentUserId={user?.id}
          actionLoading={actionLoading}
          onRefresh={() => fetchUsers()}
          onOpenCreateModal={openCreateModal}
          onOpenRoleModal={openRoleModal}
          onDelete={handleDeleteUser}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          roleFilter={roleFilter}
          onRoleFilterChange={handleRoleFilterChange}
        />
      </MainLandmark>

      {/* ─── Popup Modal Forms (Pure Dialogs) ────────────────────────────────── */}

      {/* 1. Add User Popup Form */}
      <AddUserModal
        isOpen={activeModal === "create"}
        onClose={closeActiveModal}
        onSubmit={handleCreateUser}
        loading={actionLoading === "create-user"}
      />

      {/* 2. Change Role Popup Form */}
      <ChangeRoleModal
        isOpen={activeModal === "change-role"}
        onClose={closeActiveModal}
        user={selectedUser}
        onRoleChange={handleRoleChange}
        loading={Boolean(actionLoading?.startsWith("role-"))}
      />

      {/* 3. Delete Confirmation Popup Modal */}
      <DeleteUserModal
        isOpen={activeModal === "delete"}
        onClose={closeActiveModal}
        user={selectedUser}
        onConfirm={confirmDeleteUser}
        loading={Boolean(actionLoading?.startsWith("delete-"))}
      />

      {/* 4. Notification Alert Modal */}
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
