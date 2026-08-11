import { create } from "zustand";
import toast from "react-hot-toast";
import {
  fetchInstructorAssessmentsAPI,
  fetchAssessmentStudentsAPI,
  fetchStudentQuestionsAPI,
  fetchInstructorOverviewAPI,
} from "./api.js";

const useInstructorAnalyticsStore = create((set) => ({
  overview: {
    assessments: 0,
    executedAssessments: 0,
    resources: 0,
  },
  loading: false,
  error: null,
  assessments: [],
  students: [],
  studentQuestions: [],
  selectedAssessmentId: null,
  selectedStudentId: null,

  getInstructorOverview: async () => {
    try {
      set({ loading: true, error: null });
      const res = await fetchInstructorOverviewAPI();
      const data = res.data.data || {};
      
      // Mapping Backend Keys to Frontend UI Keys
      set({
        overview: {
          assessments: data.totalAssessments || 0,
          executedAssessments: data.completedAttempts || 0,
          resources: data.totalResources || 0, // Assuming backend sends totalResources or you can map from elsewhere
        },
        loading: false,
      });
    } catch (err) {
      const msg = err.message || "Failed to fetch overview";
      set({ error: msg, loading: false });
      toast.error(msg);
      throw err;
    }
  },

  fetchAssessments: async () => {
    try {
      set({ loading: true, error: null, students: [], studentQuestions: [], selectedAssessmentId: null, selectedStudentId: null });
      const res = await fetchInstructorAssessmentsAPI();
      set({ assessments: res.data.data || [], loading: false });
    } catch (err) {
      const msg = err.message || "Failed to fetch assessments";
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  fetchAssessmentStudents: async (assessmentId) => {
    try {
      set({ loading: true, error: null, students: [], studentQuestions: [], selectedStudentId: null });
      const res = await fetchAssessmentStudentsAPI(assessmentId);
      set({ students: res.data.data || [], selectedAssessmentId: assessmentId, loading: false });
    } catch (err) {
      const msg = err.message || "Failed to fetch students";
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  fetchStudentQuestions: async (assessmentId, studentId) => {
    try {
      set({ loading: true, error: null, studentQuestions: [], selectedStudentId: null });
      const res = await fetchStudentQuestionsAPI(assessmentId, studentId);
      set({ studentQuestions: res.data.data || [], selectedStudentId: studentId, loading: false });
    } catch (err) {
      const msg = err.message || "Failed to load answers";
      set({ error: msg, studentQuestions: [], selectedStudentId: null, loading: false });
      toast.error(msg);
    }
  },

  clearError: () => set({ error: null }),
}));

export default useInstructorAnalyticsStore;
