"use client";

import { useEffect, useRef } from "react";
import { page, pageInner } from "@/lib/ui.js";
import Modal from "@/components/ui/Modal.jsx";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import useUserManagement from "@/hooks/useUserManagement.js";
import AdminHeader from "./components/AdminHeader.jsx";
import AdminStatsSection from "./components/AdminStatsSection.jsx";
import AdminUsersSection from "./components/AdminUsersSection.jsx";
import AddUserModal from "@/views/SuperAdmin/components/AddUserModal.jsx";
import ChangeRoleModal from "@/views/SuperAdmin/components/ChangeRoleModal.jsx";

export default function AdminDashboard() {
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

  return (
    <div className={page}>
      <AmbientBackground />

      <MainLandmark className={pageInner}>
        <AdminHeader
          user={user}
          totalUsers={totalUsers}
          onOpenCreateModal={openCreateModal}
        />

        <AdminStatsSection
          stats={stats}
          totalUsers={totalUsers}
          loading={loading && users.length === 0}
        />

        <AdminUsersSection
          users={users}
          currentUserId={user?.id}
          actionLoading={actionLoading}
          onRoleChange={handleRoleChange}
          onRefresh={() => fetchUsers({ search: searchQuery || undefined, role: roleFilter || undefined })}
          onOpenCreateModal={openCreateModal}
          onOpenRoleModal={openRoleModal}
          onExportCsv={handleExportCsv}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          roleFilter={roleFilter}
          onRoleFilterChange={handleRoleFilterChange}
        />
      </MainLandmark>

      {/* Accessible Modals */}
      <AddUserModal
        isOpen={activeModal === "create"}
        onClose={closeActiveModal}
        onSubmit={handleCreateUser}
        loading={actionLoading === "create"}
      />

      <ChangeRoleModal
        isOpen={activeModal === "role"}
        onClose={closeActiveModal}
        user={selectedUser}
        onRoleChange={handleRoleChange}
        loading={Boolean(actionLoading && actionLoading.startsWith("role-"))}
      />

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
