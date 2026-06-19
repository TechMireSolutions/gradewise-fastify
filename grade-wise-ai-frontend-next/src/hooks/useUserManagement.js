import { useState, useCallback } from "react";
import useAuthStore from "@/features/auth/store.js";
import useModal from "./useModal.js";

export default function useUserManagement() {
  const { user, getUsers, changeUserRole, deleteUser } = useAuthStore();
  const { modal, showModal, closeModal: closeModalBase } = useModal();

  const closeModal = useCallback(() => {
    closeModalBase();
    setPendingDelete(null);
  }, [closeModalBase]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.users);
    } catch {
      showModal("error", "Error", "Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [getUsers, showModal]);

  const handleRoleChange = async (userId, newRole, userName, userEmail) => {
    try {
      setActionLoading(`role-${userId}`);
      await changeUserRole({ userId, newRole, userEmail });
      await fetchUsers();
      showModal("success", "Success", `Successfully changed ${userName}'s role to ${newRole}.`);
    } catch (error) {
      showModal(
        "error",
        "Error",
        error.response?.data?.message || "Failed to change user role. Please try again."
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
      await deleteUser(pendingDelete.userId);
      await fetchUsers();
      showModal("success", "User Deleted", `${pendingDelete.userName} has been deleted successfully.`);
    } catch (error) {
      showModal("error", "Error", error.response?.data?.message || "Failed to delete user.");
    } finally {
      setActionLoading(null);
      setPendingDelete(null);
    }
  };

  const filteredUsers = users.filter((u) => u.role !== "super_admin");

  const getUserStats = () =>
    filteredUsers.reduce(
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
    stats: getUserStats(),
  };
}
