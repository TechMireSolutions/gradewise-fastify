import { z } from "zod";

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const AssessmentIdParamSchema = z.object({
  assessmentId: z.coerce.number().int().positive(),
});

export const ResourceIdParamSchema = z.object({
  resourceId: z.coerce.number().int().positive(),
});

export const StudentIdParamSchema = z.object({
  studentId: z.coerce.number().int().positive(),
});

export const UserIdParamSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export const SubmissionIdParamSchema = z.object({
  submissionId: z.coerce.number().int().positive(),
});

export const ResetIdParamSchema = z.object({
  resetId: z.string().min(1),
});

export const IdStudentIdParamSchema = IdParamSchema.extend({
  studentId: z.coerce.number().int().positive(),
});

export const VerifyTokenParamSchema = z.object({
  token: z.string().min(1),
});
