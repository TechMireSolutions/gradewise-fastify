import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { signInWithRedirect, getRedirectResult, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase.js";

import {
  loginApi,
  signupApi,
  googleAuthApi,
  verifyEmailApi,
  forgotPasswordApi,
  changePasswordApi,
  registerStudentApi,
  fetchUsersApi,
  changeUserRoleApi,
  deleteUserApi,
  logoutApi,
  meApi,
} from "./api.js";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,

      setUser: (user) => set({ user }),

      fetchMe: async () => {
        const response = await meApi();
        set({ user: response.data.user });
        return response.data.user;
      },

      login: async (credentials) => {
        try {
          const response = await loginApi(credentials);
          set({ user: response.data.user });
          return response.data.user;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      googleAuth: async () => {
        try {
          if (!auth) {
            throw {
              message:
                "Google sign-in is not configured. Please set up Firebase environment variables.",
            };
          }
          const result = await signInWithPopup(auth, googleProvider);
          const idToken = await result.user.getIdToken();
          const response = await googleAuthApi({ idToken });
          set({ user: response.data.user });
          return response.data.user;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      completeGoogleRedirect: async () => {
        if (!auth) return null;
        try {
          const result = await getRedirectResult(auth);
          if (!result?.user) return null;
          const idToken = await result.user.getIdToken();
          const response = await googleAuthApi({ idToken });
          set({ user: response.data.user });
          return response.data.user;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      signup: async (data) => {
        try {
          const response = await signupApi(data);
          if (response.data.user) {
            set({ user: response.data.user });
          }
          return response.data;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      registerStudent: async (studentData) => {
        try {
          const cleanedData = { ...studentData };
          delete cleanedData.role;
          const response = await registerStudentApi(cleanedData);
          return response.data;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      verifyEmail: async (token) => {
        try {
          const response = await verifyEmailApi(token);
          return response.data;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      forgotPassword: async (data) => {
        try {
          const response = await forgotPasswordApi(data);
          return response.data;
        } catch (error) {
          throw {
            status: error.response?.status || 500,
            message:
              error.response?.data?.message ||
              "Failed to send reset link",
          };
        }
      },

      changePassword: async (payload) => {
        try {
          const response = await changePasswordApi(payload);
          return response.data;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      getUsers: async () => {
        try {
          const response = await fetchUsersApi();
          return response.data;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      changeUserRole: async (data) => {
        try {
          const response = await changeUserRoleApi(data);
          return response.data;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      deleteUser: async (userId) => {
        try {
          const response = await deleteUserApi(userId);
          return response.data;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      cachedUsers: [],
      hasLoadedUsers: false,
      aiSummary: null,
      isBootstrapped: false,

      setIsBootstrapped: (isBootstrapped) => set({ isBootstrapped }),

      fetchAndCacheUsers: async () => {
        try {
          const response = await fetchUsersApi();
          const users = response.data?.users || [];
          set({ cachedUsers: users, hasLoadedUsers: true });
          return users;
        } catch (error) {
          throw error.response?.data || error;
        }
      },

      clearSession: async () => {
        try {
          await logoutApi();
        } catch {
          // ignore network error on logout
        } finally {
          set({
            user: null,
            cachedUsers: [],
            hasLoadedUsers: false,
            aiSummary: null,
            isBootstrapped: false,
          });
        }
      },

      logout: async () => {
        try {
          await logoutApi();
        } finally {
          set({
            user: null,
            cachedUsers: [],
            hasLoadedUsers: false,
            aiSummary: null,
            isBootstrapped: false,
          });
        }
      },

      isAuthenticated: () => Boolean(get().user?.role),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;
