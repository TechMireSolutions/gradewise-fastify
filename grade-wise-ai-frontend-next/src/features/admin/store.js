import { create } from "zustand";
import {
  fetchAdminOverviewAPI,
  fetchAdminUsersAPI,
  changeUserRoleAPI,
  deleteAdminUserAPI,
  createAdminUserAPI,
} from "./api.js";

const initialOverview = {
  users: {
    total: 0,
    admins: 0,
    instructors: 0,
    students: 0,
    verified: 0,
    unverified: 0,
  },
  assessments: {
    total: 0,
    executed: 0,
  },
  attempts: {
    total: 0,
    completed: 0,
    averageScore: 0,
  },
};

const useAdminStore = create((set, get) => ({
  overview: initialOverview,
  users: [],
  totalUsers: 0,
  page: 1,
  limit: 50,
  loading: false,
  error: null,

  getAdminOverview: async () => {
    try {
      set({ error: null });
      const res = await fetchAdminOverviewAPI();
      const overviewData = res.data?.data || res.data || initialOverview;
      set({ overview: overviewData });
      return overviewData;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to fetch admin overview";
      set({ error: msg });
      throw err;
    }
  },

  getAdminUsers: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const res = await fetchAdminUsersAPI(params);
      const data = res.data || {};
      const userList = Array.isArray(data.users) ? data.users : [];
      const total = typeof data.total === "number" ? data.total : userList.length;

      set({
        users: userList,
        totalUsers: total,
        page: params.page || 1,
        limit: params.limit || 50,
        loading: false,
      });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to fetch admin users";
      set({ error: msg, loading: false });
      throw err;
    }
  },

  changeUserRole: async (userId, newRole) => {
    try {
      const res = await changeUserRoleAPI(userId, newRole);
      // Optimistically update local user list
      set((state) => ({
        users: state.users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      }));
      // Silently refresh overview stats
      get().getAdminOverview().catch(() => {});
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to change user role";
      throw new Error(msg);
    }
  },

  deleteUser: async (userId) => {
    try {
      const res = await deleteAdminUserAPI(userId);
      // Remove from local users list
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
        totalUsers: Math.max(0, state.totalUsers - 1),
      }));
      // Silently refresh overview stats
      get().getAdminOverview().catch(() => {});
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to delete user";
      throw new Error(msg);
    }
  },

  createAdminUser: async (payload) => {
    try {
      const res = await createAdminUserAPI(payload);
      const newUser = res.data?.user || res.data?.data;
      if (newUser) {
        set((state) => ({
          users: [newUser, ...state.users],
          totalUsers: state.totalUsers + 1,
        }));
      }
      get().getAdminOverview().catch(() => {});
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to create user";
      throw new Error(msg);
    }
  },
}));

export default useAdminStore;
