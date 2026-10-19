import { useState, useCallback } from "react";
import useAuthStore from "@/features/auth/store.js";
import useAdminStore from "@/features/admin/store.js";
import useModal from "./useModal.js";

export default function useUserManagement() {
  const { user } = useAuthStore();
  const {
    overview,
    users: storeUsers,
    totalUsers: storeTotalUsers,
    getAdminOverview,
    getAdminUsers,
    changeUserRole: changeRoleInStore,
    deleteUser: deleteUserInStore,
  } = useAdminStore();

  const { modal, showModal, closeModal: closeModalBase } = useModal();

  const [users, setUsers] = useState(() => storeUsers || []);
  const [totalUsers, setTotalUsers] = useState(() => storeTotalUsers || 0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const closeModal = useCallback(() => {
    closeModalBase();
    setPendingDelete(null);
  }, [closeModalBase]);

  const fetchUsers = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = {
        search: params.search !== undefined ? params.search : searchQuery,
        role: params.role !== undefined ? params.role : (roleFilter || undefined),
      };

      const [usersRes] = await Promise.all([
        getAdminUsers(queryParams),
        getAdminOverview().catch(() => null),
      ]);

      const list = usersRes?.users || [];
      setUsers(list);
      setTotalUsers(typeof usersRes?.total === "number" ? usersRes.total : list.length);
    } catch {
      showModal("error", "Error", "Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [getAdminUsers, getAdminOverview, searchQuery, roleFilter, showModal]);

  const handleRoleChange = async (userId, newRole, userName, userEmail) => {
    try {
      setActionLoading(`role-${userId}`);
      await changeRoleInStore(userId, newRole);
      await fetchUsers();
      showModal("success", "Success", `Successfully changed ${userName || userEmail}'s role to ${newRole}.`);
    } catch (error) {
      showModal(
        "error",
        "Error",
        error.message || "Failed to change user role. Please try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = (userId, userName) => {
    setPendingDelete({ userId, userName });
    showModal(
      "warning",
      "Confirm Deletion",
      `Are you sure you want to delete ${userName}? This action cannot be undone.`
    );
  };

  const confirmDeleteUser = async () => {
    if (!pendingDelete) return;
    try {
      setActionLoading(`delete-${pendingDelete.userId}`);
      await deleteUserInStore(pendingDelete.userId);
      await fetchUsers();
      showModal("success", "User Deleted", `${pendingDelete.userName} has been deleted successfully.`);
    } catch (error) {
      showModal("error", "Error", error.message || "Failed to delete user.");
    } finally {
      setActionLoading(null);
      setPendingDelete(null);
    }
  };

  const filteredUsers = users.filter((u) => u.role !== "super_admin");

  // Prefer database-aggregated KPI stats from /api/admin/overview
  const stats = overview?.users
    ? {
        admin: overview.users.admins || 0,
        instructor: overview.users.instructors || 0,
        student: overview.users.students || 0,
        verified: overview.users.verified || 0,
        unverified: overview.users.unverified || 0,
      }
    : filteredUsers.reduce(
        (acc, u) => {
          acc[u.role] = (acc[u.role] || 0) + 1;
          if (u.verified) acc.verified++;
          else acc.unverified++;
          return acc;
        },
        { admin: 0, instructor: 0, student: 0, verified: 0, unverified: 0 }
      );

  return {
    user,
    users: filteredUsers,
    totalUsers: overview?.users?.total ?? totalUsers,
    loading,
    actionLoading,
    modal,
    showModal,
    closeModal,
    fetchUsers,
    handleRoleChange,
    handleDeleteUser,
    confirmDeleteUser,
    pendingDelete,
    stats,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
  };
}
