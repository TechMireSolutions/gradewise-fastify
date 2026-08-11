import { create } from "zustand";
import jsPDF from "jspdf";
import useAuthStore from "@/features/auth/store.js";

const useStudentAnalyticsStore = create((set) => ({
  assessments: [],
  selectedAssessment: null,
  analytics: null,
  performance: [],
  recommendations: null,
  selectedAssessmentDetails: null,
  loading: false,
  error: null,

  fetchAssessments: async () => {
    try {
      set({ loading: true, error: null });
      const { default: apiClient } = await import("@/lib/apiClient.js");
      const res = await apiClient.get("/student-analytics/assessments");
      set({ assessments: res.data.data || [] });
    } catch (err) {
      set({ assessments: [], error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  setSelectedAssessment: (id) => set({ selectedAssessment: id }),

  downloadReport: async (assessmentId, clientSideDetails = null) => {
    try {
      set({ loading: true });
      const { user } = useAuthStore.getState();
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();

      const mergedDetails = { ...clientSideDetails };
      const titleText = mergedDetails.title || mergedDetails.assessmentTitle || "Assessment Report";
      
      const scorePct = mergedDetails.scorePercentage !== undefined 
        ? mergedDetails.scorePercentage 
        : (mergedDetails.score !== undefined ? mergedDetails.score : 0);
        
      const correctAnswers = mergedDetails.correctAnswersCount !== undefined 
        ? mergedDetails.correctAnswersCount 
        : (mergedDetails.correct_answers !== undefined ? mergedDetails.correct_answers : 0);
        
      const totalQuestions = mergedDetails.totalQuestionsCount !== undefined 
        ? mergedDetails.totalQuestionsCount 
        : (mergedDetails.total_questions !== undefined ? mergedDetails.total_questions : 5);

      // startedAt aur completedAt ka difference seconds mein calculate ho raha hai
      let timeTakenSecs = 0;
      if (mergedDetails.startedAt && mergedDetails.completedAt) {
        const start = new Date(mergedDetails.startedAt).getTime();
        const end = new Date(mergedDetails.completedAt).getTime();
        if (!isNaN(start) && !isNaN(end) && end > start) {
          timeTakenSecs = Math.floor((end - start) / 1000);
        }
      }

      // Backend response ka accurate "results" array
      const reportQuestions = mergedDetails.results || [];

      // PDF Design Header
      doc.setFillColor(67, 24, 255); 
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("Gradewise AI - Performance Report", 15, 25);

      // Metadata Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text("Assessment: " + titleText, 15, 55);
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text("Student: " + (user?.name || "Student") + " (" + (user?.email || "") + ")", 15, 65);
      doc.text("Date: " + new Date().toLocaleDateString(), 15, 72);

      // Overview Matrix Table
      autoTable(doc, {
        startY: 80,
        head: [["Metric", "Value"]],
        body: [
          ["Score Achieved", correctAnswers + " / " + totalQuestions],
          ["Percentage", scorePct + "%"],
          ["Total Questions", totalQuestions],
          ["Correct Answers", correctAnswers],
          ["Incorrect Answers", Math.max(0, totalQuestions - correctAnswers)],
          ["Time Taken", Math.floor(timeTakenSecs / 60) + "m " + (timeTakenSecs % 60) + "s"],
        ],
        headStyles: { fillColor: [67, 24, 255] },
      });

      // Questions & Answers Loop Section
      let nextStartY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(16);
      doc.setTextColor(67, 24, 255);
      doc.text("Questions & Answers Detailed Review", 15, nextStartY);

      if (reportQuestions.length > 0) {
        const questionRows = reportQuestions.map((q, idx) => {
          const qText = q.questionText || "Question Text Missing";
          const studentAns = q.studentAnswer || "Not Answered";
          const correctAns = q.correctAnswer || "N/A";
          return [
            (idx + 1) + ". " + qText,
            studentAns,
            correctAns
          ];
        });

        autoTable(doc, {
          startY: nextStartY + 8,
          head: [["Question", "Your Answer", "Correct Answer"]],
          body: questionRows,
          headStyles: { fillColor: [79, 70, 229] },
          columnStyles: {
            0: { cellWidth: 95 },
            1: { cellWidth: 42 },
            2: { cellWidth: 42 }
          },
          styles: { overflow: "wrap", fontSize: 9 }
        });
      } else {
        doc.setFontSize(11);
        doc.setTextColor(120, 120, 120);
        doc.text("No question summary logs found inside this attempt payload.", 15, nextStartY + 10);
      }

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(
          "Page " + i + " of " + pageCount + " - Generated by Gradewise AI",
          105,
          290,
          { align: "center" }
        );
      }

      const safeFileName = String(titleText).replace(/\s+/g, "_");
      doc.save("Gradewise_Report_" + safeFileName + ".pdf");
    } catch (err) {
      console.error("Report generation error:", err);
    } finally {
      set({ loading: false });
    }
  },
}));

export default useStudentAnalyticsStore;
