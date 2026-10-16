import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCompletedAttempt, getAttemptQuestionsWithAnswers } from "./shared.js";
import { db } from "../../db/index.js";
import { NotFoundError } from "../../utils/errors.js";

describe("Analytics Shared Queries", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getCompletedAttempt", () => {
    it("throws NotFoundError when no completed attempt exists", async () => {
      const mockQueryChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      vi.spyOn(db, "select").mockReturnValue(mockQueryChain as never);

      await expect(getCompletedAttempt(10, 42)).rejects.toThrow(NotFoundError);
      await expect(getCompletedAttempt(10, 42)).rejects.toThrow("Completed attempt");
    });

    it("returns attempt record when completed attempt is found", async () => {
      const mockAttempt = {
        id: 99,
        assessmentId: 10,
        studentId: 42,
        status: "completed",
        score: "85.00",
        completedAt: new Date(),
      };

      const mockQueryChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockAttempt]),
      };
      vi.spyOn(db, "select").mockReturnValue(mockQueryChain as never);

      const result = await getCompletedAttempt(10, 42);
      expect(result).toEqual(mockAttempt);
    });
  });

  describe("getAttemptQuestionsWithAnswers", () => {
    it("returns questions joined with student answers", async () => {
      const mockQuestionsAnswers = [
        {
          questionId: 1,
          questionText: "What is 2+2?",
          questionType: "multiple_choice",
          correctAnswer: "4",
          options: ["2", "3", "4", "5"],
          studentAnswer: "4",
          isCorrect: true,
          score: "1.00",
        },
      ];

      const mockQueryChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockQuestionsAnswers),
      };
      vi.spyOn(db, "select").mockReturnValue(mockQueryChain as never);

      const result = await getAttemptQuestionsWithAnswers(99);
      expect(result).toEqual(mockQuestionsAnswers);
    });
  });
});
