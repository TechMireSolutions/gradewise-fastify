import { describe, it, expect } from "vitest";
import {
  TimeRangeEnum,
  StudentPerformanceQuerySchema,
} from "./student-analytics.schema.js";

describe("Student Analytics Schema", () => {
  describe("TimeRangeEnum", () => {
    it("accepts valid time range values", () => {
      expect(TimeRangeEnum.safeParse("7d").success).toBe(true);
      expect(TimeRangeEnum.safeParse("30d").success).toBe(true);
      expect(TimeRangeEnum.safeParse("90d").success).toBe(true);
      expect(TimeRangeEnum.safeParse("all").success).toBe(true);
    });

    it("rejects invalid time range values", () => {
      expect(TimeRangeEnum.safeParse("1y").success).toBe(false);
      expect(TimeRangeEnum.safeParse("14d").success).toBe(false);
      expect(TimeRangeEnum.safeParse("").success).toBe(false);
      expect(TimeRangeEnum.safeParse(null).success).toBe(false);
    });
  });

  describe("StudentPerformanceQuerySchema", () => {
    it("defaults timeRange to '30d' when omitted", () => {
      const result = StudentPerformanceQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timeRange).toBe("30d");
      }
    });

    it("accepts explicit valid timeRange", () => {
      const result = StudentPerformanceQuerySchema.safeParse({ timeRange: "90d" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timeRange).toBe("90d");
      }
    });

    it("rejects invalid timeRange in query object", () => {
      const result = StudentPerformanceQuerySchema.safeParse({ timeRange: "invalid" });
      expect(result.success).toBe(false);
    });
  });
});
