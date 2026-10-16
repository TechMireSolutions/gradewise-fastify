import { z } from "zod";
import { IdParamSchema, IdStudentIdParamSchema } from "../../schemas/common.js";

export const AssessmentIdParamsSchema = IdParamSchema;
export const AssessmentStudentParamsSchema = IdStudentIdParamSchema;

export const InstructorOverviewSchema = z.object({
  totalAssessments: z.number().int().min(0),
  totalStudents: z.number().int().min(0),
  totalAttempts: z.number().int().min(0),
  averageScore: z.number().min(0).max(100).optional(),
});
export type InstructorOverview = z.infer<typeof InstructorOverviewSchema>;
