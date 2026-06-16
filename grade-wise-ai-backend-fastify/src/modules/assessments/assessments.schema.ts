import { z } from "zod";

export const QuestionBlockSchema = z.object({
  questionType: z.enum(["multiple_choice", "short_answer", "true_false", "matching"]),
  questionCount: z.number().int().min(1).max(50).default(5),
  durationPerQuestion: z.number().int().min(30).max(600).default(60),
  numOptions: z.number().int().min(2).max(6).optional().default(4),
  leftCount: z.number().int().min(2).max(10).optional().default(3),
  rightCount: z.number().int().min(2).max(10).optional().default(4),
  positiveMarks: z.number().min(0).max(100).default(1),
  negativeMarks: z.number().min(0).max(100).default(0.25),
});

export const CreateAssessmentSchema = z.object({
  title: z.string().min(1).max(255).trim(),
  prompt: z.string().max(5000).optional(),
  externalLinks: z.array(z.string().url()).optional().default([]),
  questionBlocks: z.array(QuestionBlockSchema).min(1).max(10),
  selectedResources: z.array(z.number().int().positive()).optional().default([]),
});

export const UpdateAssessmentSchema = z.object({
  title: z.string().min(1).max(255).trim().optional(),
  prompt: z.string().max(5000).optional(),
  externalLinks: z.array(z.string().url()).optional(),
  questionBlocks: z.array(QuestionBlockSchema).min(1).max(10).optional(),
  selectedResources: z.array(z.number().int().positive()).optional(),
});

export const EnrollStudentSchema = z.object({
  studentId: z.number().int().positive(),
});

export const PhysicalPaperSchema = z.object({
  instituteName: z.string().min(1),
  teacherName: z.string().min(1),
  subjectName: z.string().min(1),
  paperDate: z.string().min(1),
  paperTime: z.string().min(1),
  paperDuration: z.string().min(1),
  totalMarks: z.number().int().positive(),
  notes: z.string().optional(),
  pageSize: z.enum(["A4", "A5", "LETTER"]).default("A4"),
  headerFontSize: z.number().int().min(8).max(32).default(14),
  bodyFontSize: z.number().int().min(8).max(24).default(11),
  outputFormat: z.enum(["pdf", "docx"]).default("pdf"),
});

export type CreateAssessmentInput = z.infer<typeof CreateAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof UpdateAssessmentSchema>;
export type PhysicalPaperInput = z.infer<typeof PhysicalPaperSchema>;
