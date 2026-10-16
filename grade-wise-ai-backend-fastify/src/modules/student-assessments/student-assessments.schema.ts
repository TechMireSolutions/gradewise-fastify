import { z } from "zod";
import { AssessmentIdParamSchema } from "../../schemas/common.js";

export const StartAssessmentSchema = z.object({
  language: z.string().optional().default("en"),
});
export type StartAssessmentInput = z.infer<typeof StartAssessmentSchema>;

export const SubmitAnswerItemSchema = z.object({
  questionId: z.number().int().positive(),
  answer: z.string(),
});
export type SubmitAnswerItem = z.infer<typeof SubmitAnswerItemSchema>;

export const SubmitAssessmentSchema = z.object({
  attemptId: z.number().int().positive(),
  answers: z.array(SubmitAnswerItemSchema),
});
export type SubmitAssessmentInput = z.infer<typeof SubmitAssessmentSchema>;

export const AttemptStatusParamSchema = AssessmentIdParamSchema.extend({
  attemptId: z.coerce.number().int().positive(),
});
export type AttemptStatusParam = z.infer<typeof AttemptStatusParamSchema>;
