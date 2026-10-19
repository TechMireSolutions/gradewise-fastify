import { page, pageInner } from "@/lib/ui.js";
import { useEffect } from "react";
import Modal from "@/components/ui/Modal.jsx";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import useUserManagement from "@/hooks/useUserManagement.js";
import AdminHeader from "./components/AdminHeader.jsx";
import AdminStatsSection from "./components/AdminStatsSection.jsx";
import AdminUsersSection from "./components/AdminUsersSection.jsx";

function AdminDashboard() {
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
    stats,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
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

  return (
    <div className={page}>
      <AmbientBackground />

      <div className={pageInner}>
        <AdminHeader user={user} totalUsers={totalUsers} />

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
          onRefresh={() => fetchUsers()}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          roleFilter={roleFilter}
          onRoleFilterChange={handleRoleFilterChange}
        />
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
