import { describe, it, expect } from "vitest";
import {
  IdParamSchema,
  AssessmentIdParamSchema,
  ResourceIdParamSchema,
  ResetIdParamSchema,
  IdStudentIdParamSchema,
} from "./common.js";

describe("common param schemas", () => {
  it("coerces string numbers into positive integers for IdParamSchema", () => {
    const parsed = IdParamSchema.safeParse({ id: "42" });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.id).toBe(42);
    }
  });

  it("fails on negative or zero ids", () => {
    expect(IdParamSchema.safeParse({ id: "0" }).success).toBe(false);
    expect(IdParamSchema.safeParse({ id: "-5" }).success).toBe(false);
    expect(IdParamSchema.safeParse({ id: "not-a-number" }).success).toBe(false);
  });

  it("validates AssessmentIdParamSchema", () => {
    const res = AssessmentIdParamSchema.safeParse({ assessmentId: "101" });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.assessmentId).toBe(101);
    }
  });

  it("validates ResourceIdParamSchema", () => {
    const res = ResourceIdParamSchema.safeParse({ resourceId: "7" });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.resourceId).toBe(7);
    }
  });

  it("validates string-based ResetIdParamSchema", () => {
    expect(ResetIdParamSchema.safeParse({ resetId: "uuid-12345" }).success).toBe(true);
    expect(ResetIdParamSchema.safeParse({ resetId: "" }).success).toBe(false);
  });

  it("validates composite IdStudentIdParamSchema", () => {
    const res = IdStudentIdParamSchema.safeParse({ id: "10", studentId: "20" });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.id).toBe(10);
      expect(res.data.studentId).toBe(20);
    }
  });
});
