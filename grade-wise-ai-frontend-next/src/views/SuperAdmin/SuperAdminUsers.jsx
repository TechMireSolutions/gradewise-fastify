"use client";

import { useEffect } from "react";
import { page, pageInner } from "@/lib/ui.js";
import Modal from "@/components/ui/Modal.jsx";
import PageLoader from "@/components/ui/PageLoader.jsx";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import { UserStatsGrid } from "@/components/admin/UserManagementTable.jsx";
import useUserManagement from "@/hooks/useUserManagement.js";
import SuperAdminNavTabs from "./components/SuperAdminNavTabs.jsx";
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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (term) => {
    setSearchQuery(term);
    fetchUsers({ search: term });
  };

  const handleRoleFilterChange = (role) => {
    setRoleFilter(role);
    fetchUsers({ role: role || undefined });
  };

  if (loading && users.length === 0) {
    return <PageLoader message="Loading users..." />;
  }

  return (
    <div className={page}>
      <AmbientBackground />

      <MainLandmark className={pageInner}>
        <SuperAdminNavTabs />

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
          </div>
        </div>

        <UserStatsGrid stats={stats} totalUsers={totalUsers} />

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
