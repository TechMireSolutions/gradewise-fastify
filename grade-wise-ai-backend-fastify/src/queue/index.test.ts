import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("BullMQ Assessment Generation Queue", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("when Redis is disabled", () => {
    beforeEach(() => {
      delete process.env["REDIS_URL"];
    });

    it("getAssessmentQueue returns null", async () => {
      const { getAssessmentQueue } = await import("./index.js");
      expect(getAssessmentQueue()).toBeNull();
    });

    it("enqueueAssessmentGeneration returns false", async () => {
      const { enqueueAssessmentGeneration } = await import("./index.js");
      const enqueued = await enqueueAssessmentGeneration({
        attemptId: 1,
        assessmentId: 10,
        studentId: 100,
        language: "en",
      });
      expect(enqueued).toBe(false);
    });

    it("startAssessmentWorker returns null", async () => {
      const { startAssessmentWorker } = await import("./index.js");
      expect(startAssessmentWorker()).toBeNull();
    });
  });

  describe("when Redis is enabled", () => {
    it("enqueues jobs to BullMQ queue and creates worker", async () => {
      const mockAdd = vi.fn().mockResolvedValue({ id: "job-123" });
      const mockOn = vi.fn();

      vi.doMock("bullmq", () => {
        return {
          Queue: class {
            add = mockAdd;
          },
          Worker: class {
            on = mockOn;
          },
        };
      });

      process.env["REDIS_URL"] = "redis://127.0.0.1:6379";
      const {
        getAssessmentQueue,
        enqueueAssessmentGeneration,
        startAssessmentWorker,
        ASSESSMENT_GENERATION_QUEUE,
      } = await import("./index.js");

      expect(ASSESSMENT_GENERATION_QUEUE).toBe("assessment-generation");

      const queue = getAssessmentQueue();
      expect(queue).toBeDefined();
      expect(queue).not.toBeNull();

      const enqueued = await enqueueAssessmentGeneration({
        attemptId: 2,
        assessmentId: 20,
        studentId: 200,
        language: "ur",
      });

      expect(enqueued).toBe(true);
      expect(mockAdd).toHaveBeenCalledWith(
        "generate",
        {
          attemptId: 2,
          assessmentId: 20,
          studentId: 200,
          language: "ur",
        },
        expect.objectContaining({
          attempts: 3,
        })
      );

      const worker = startAssessmentWorker();
      expect(worker).toBeDefined();
      expect(worker).not.toBeNull();
      expect(mockOn).toHaveBeenCalledWith("failed", expect.any(Function));
    });
  });
});
