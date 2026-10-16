import { create } from "zustand";
import {
  fetchResourcesAPI,
  fetchAllResourcesAPI,
  uploadResourcesAPI,
  deleteResourceAPI,
} from "./api.js";

const useResourceStore = create((set) => ({
  resources: [],
  currentResource: null,
  loading: false,
  error: null,

  fetchResources: async () => {
    try {
      set({ loading: true, error: null });
      const res = await fetchResourcesAPI();
      
      // Safe dynamic target array extraction flow
      const extractedData = res.data?.data || res.data?.resources || (Array.isArray(res.data) ? res.data : []);
      
      set({ resources: extractedData, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchAllResources: async () => {
    try {
      set({ loading: true, error: null });
      const res = await fetchAllResourcesAPI();
      
      const extractedData = res.data?.data || res.data?.resources || (Array.isArray(res.data) ? res.data : []);
      
      set({ resources: extractedData, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  uploadResources: async (files) => {
    try {
      set({ loading: true, error: null });
      const res = await uploadResourcesAPI(files);
      set({ loading: false });
      return res.data?.resources || res.data?.data || [];
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  deleteResource: async (resourceId) => {
    try {
      set({ loading: true, error: null });
      await deleteResourceAPI(resourceId);

      set((state) => ({
        resources: state.resources.filter(
          (r) => r.id !== resourceId
        ),
        loading: false,
      }));

    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  clearCurrentResource: () => set({ currentResource: null }),
}));

export default useResourceStore;
