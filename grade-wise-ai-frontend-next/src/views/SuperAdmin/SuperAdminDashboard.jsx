"use client";

import { useEffect } from "react";
import { page, pageInner } from "@/lib/ui.js";
import Modal from "@/components/ui/Modal.jsx";
import PageLoader from "@/components/ui/PageLoader.jsx";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import { UserStatsGrid } from "@/components/admin/UserManagementTable.jsx";
import useUserManagement from "@/hooks/useUserManagement.js";
import useSuperAdminApiConfig from "./hooks/useSuperAdminApiConfig.js";
import SuperAdminHeader from "./components/SuperAdminHeader.jsx";
import SuperAdminUsersSection from "./components/SuperAdminUsersSection.jsx";
import AddUserModal from "./components/AddUserModal.jsx";
import ChangeRoleModal from "./components/ChangeRoleModal.jsx";
import DeleteUserModal from "./components/DeleteUserModal.jsx";
import ProviderSettingsModal from "./components/ProviderSettingsModal.jsx";

export default function SuperAdminDashboard() {
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

  const apiConfig = useSuperAdminApiConfig();

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
        <SuperAdminHeader
          user={user}
          totalUsers={totalUsers}
          onOpenCreateModal={openCreateModal}
          onOpenApiConfigModal={apiConfig.openSettingsModal}
        />

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

      {/* 4. Quick AI Key Configuration Popup Modal */}
      <ProviderSettingsModal
        isOpen={apiConfig.isSettingsModalOpen}
        onClose={apiConfig.closeSettingsModal}
        purpose={apiConfig.purpose}
        provider={apiConfig.provider}
        card={apiConfig.card}
        pStyle={apiConfig.pStyle}
        aiState={apiConfig.aiState}
        configLoading={apiConfig.configLoading}
        inlineTestStatus={apiConfig.inlineTestStatus}
        onChangeProvider={(p) =>
          apiConfig.setActiveProvider((prev) => ({ ...prev, [apiConfig.purpose]: p }))
        }
        onUpdateCard={apiConfig.updateActiveCard}
        onTestInlineKey={apiConfig.handleTestInlineKey}
        onSaveCard={apiConfig.handleSaveCard}
      />

      {/* 5. General Notification Alert Modal */}
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
