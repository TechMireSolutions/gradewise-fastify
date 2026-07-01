import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { signInWithPopup } from "firebase/auth";
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

      logout: async () => {
        try {
          await logoutApi();
        } finally {
          set({ user: null });
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
