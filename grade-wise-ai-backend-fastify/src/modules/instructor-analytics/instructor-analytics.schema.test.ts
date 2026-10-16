import { describe, it, expect } from "vitest";
import {
  AssessmentIdParamsSchema,
  AssessmentStudentParamsSchema,
  InstructorOverviewSchema,
} from "./instructor-analytics.schema.js";
import {
  TimeRangeEnum,
  StudentPerformanceQuerySchema,
} from "../student-analytics/student-analytics.schema.js";

describe("Analytics Modules Schemas", () => {
  describe("Instructor Analytics Schemas", () => {
    it("validates InstructorOverviewSchema metric summary", () => {
      const overview = {
        totalAssessments: 14,
        totalStudents: 120,
        totalAttempts: 340,
        averageScore: 82.5,
      };
      expect(InstructorOverviewSchema.safeParse(overview).success).toBe(true);
    });

    it("rejects negative counts in InstructorOverviewSchema", () => {
      expect(
        InstructorOverviewSchema.safeParse({
          totalAssessments: -1,
          totalStudents: 10,
          totalAttempts: 5,
        }).success
      ).toBe(false);
    });

    it("validates AssessmentIdParamsSchema and AssessmentStudentParamsSchema route params", () => {
      const singleParam = AssessmentIdParamsSchema.safeParse({ id: "10" });
      expect(singleParam.success).toBe(true);
      if (singleParam.success) {
        expect(singleParam.data.id).toBe(10);
      }

      const dualParams = AssessmentStudentParamsSchema.safeParse({ id: "10", studentId: "42" });
      expect(dualParams.success).toBe(true);
      if (dualParams.success) {
        expect(dualParams.data.id).toBe(10);
        expect(dualParams.data.studentId).toBe(42);
      }
    });
  });

  describe("Student Analytics Schemas", () => {
    it("validates TimeRangeEnum values", () => {
      expect(TimeRangeEnum.safeParse("7d").success).toBe(true);
      expect(TimeRangeEnum.safeParse("30d").success).toBe(true);
      expect(TimeRangeEnum.safeParse("90d").success).toBe(true);
      expect(TimeRangeEnum.safeParse("all").success).toBe(true);
      expect(TimeRangeEnum.safeParse("1y").success).toBe(false);
    });

    it("defaults StudentPerformanceQuerySchema to 30d", () => {
      const result = StudentPerformanceQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timeRange).toBe("30d");
      }
    });
  });
});
