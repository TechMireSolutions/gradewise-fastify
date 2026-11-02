import { useState, useCallback, useRef } from "react";
import useAuthStore from "@/features/auth/store.js";
import useAdminStore from "@/features/admin/store.js";
import useModal from "./useModal.js";

export default function useUserManagement(options = {}) {
  const { user } = useAuthStore();
  const {
    overview,
    users: storeUsers,
    totalUsers: storeTotalUsers,
    getAdminOverview,
    getAdminUsers,
    changeUserRole: changeRoleInStore,
    deleteUser: deleteUserInStore,
    createAdminUser: createAdminUserInStore,
  } = useAdminStore();

  const { modal, showModal, closeModal: closeModalBase } = useModal();

  const [users, setUsers] = useState(() => storeUsers || []);
  const [totalUsers, setTotalUsers] = useState(() => storeTotalUsers || 0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const queryRef = useRef({ searchQuery: "", roleFilter: "" });
  queryRef.current = { searchQuery, roleFilter };

  // Popup modal state
  const [activeModal, setActiveModal] = useState(null); // 'create' | 'change-role' | 'delete' | 'api-config' | null
  const [selectedUser, setSelectedUser] = useState(null);

  const closeModal = useCallback(() => {
    closeModalBase();
    setPendingDelete(null);
  }, [closeModalBase]);

  const closeActiveModal = useCallback(() => {
    setActiveModal(null);
    setSelectedUser(null);
  }, []);

  const openCreateModal = useCallback(() => {
    setActiveModal("create");
  }, []);

  const openRoleModal = useCallback((targetUser) => {
    setSelectedUser(targetUser);
    setActiveModal("change-role");
  }, []);

  const openDeleteModal = useCallback((targetUser) => {
    setSelectedUser(targetUser);
    setPendingDelete({ userId: targetUser.id, userName: targetUser.name });
    setActiveModal("delete");
  }, []);

  const openApiConfigModal = useCallback(() => {
    setActiveModal("api-config");
  }, []);

  const fetchUsers = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = {
        search: (params.search !== undefined ? params.search : queryRef.current.searchQuery) || undefined,
        role: (params.role !== undefined ? params.role : queryRef.current.roleFilter) || undefined,
        limit: params.limit !== undefined ? params.limit : undefined,
        page: params.page !== undefined ? params.page : undefined,
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
  }, [getAdminUsers, getAdminOverview, showModal]);

  const handleRoleChange = async (userId, newRole, userName, userEmail) => {
    try {
      setActionLoading(`role-${userId}`);
      await changeRoleInStore(userId, newRole);
      closeActiveModal();
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

  const handleCreateUser = async (formData) => {
    try {
      setActionLoading("create-user");
      await createAdminUserInStore({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role || "student",
      });
      closeActiveModal();
      await fetchUsers();
      showModal("success", "User Created", `Successfully created ${formData.name} as ${formData.role || "student"}.`);
    } catch (error) {
      showModal(
        "error",
        "Failed to Create User",
        error.message || "An unexpected error occurred while creating the user."
      );
      throw error;
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = (userId, userName) => {
    setPendingDelete({ userId, userName });
    setSelectedUser({ id: userId, name: userName });
    setActiveModal("delete");
  };

  const confirmDeleteUser = async () => {
    const target = selectedUser || pendingDelete;
    if (!target) return;
    try {
      setActionLoading(`delete-${target.userId || target.id}`);
      await deleteUserInStore(target.userId || target.id);
      closeActiveModal();
      await fetchUsers();
      showModal("success", "User Deleted", `${target.userName || target.name} has been deleted successfully.`);
    } catch (error) {
      showModal("error", "Error", error.message || "Failed to delete user.");
    } finally {
      setActionLoading(null);
      setPendingDelete(null);
      setSelectedUser(null);
    }
  };

  const shouldIncludeSuperAdmin =
    options.includeSuperAdmin !== undefined
      ? Boolean(options.includeSuperAdmin)
      : user?.role === "super_admin";

  const visibleUsers = shouldIncludeSuperAdmin
    ? users
    : users.filter((u) => u.role !== "super_admin");

  const superAdminCount = users.filter((u) => u.role === "super_admin").length;

  // Prefer database-aggregated KPI stats from /api/admin/overview
  const stats = overview?.users
    ? {
        super_admin: overview.users.superAdmins ?? superAdminCount,
        admin: overview.users.admins || 0,
        instructor: overview.users.instructors || 0,
        student: overview.users.students || 0,
        verified: overview.users.verified || 0,
        unverified: overview.users.unverified || 0,
      }
    : visibleUsers.reduce(
        (acc, u) => {
          acc[u.role] = (acc[u.role] || 0) + 1;
          if (u.verified) acc.verified++;
          else acc.unverified++;
          return acc;
        },
        { super_admin: 0, admin: 0, instructor: 0, student: 0, verified: 0, unverified: 0 }
      );

  return {
    user,
    users: visibleUsers,
    totalUsers: overview?.users?.total ?? totalUsers,
    loading,
    actionLoading,
    modal,
    showModal,
    closeModal,
    fetchUsers,
    handleRoleChange,
    handleCreateUser,
    handleDeleteUser,
    confirmDeleteUser,
    pendingDelete,
    stats,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    // Popup modal controls
    activeModal,
    setActiveModal,
    selectedUser,
    setSelectedUser,
    openCreateModal,
    openRoleModal,
    openDeleteModal,
    openApiConfigModal,
    closeActiveModal,
  };
}
