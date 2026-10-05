// assessmentSchemas.js
import { z } from "zod";

export const assessmentLanguages = [
  { value: "en", label: "English" },
  { value: "ur", label: "اردو (Urdu)" },
  { value: "ar", label: "العربية (Arabic)" },
  { value: "fa", label: "فارسی (Persian)" },
];

export const createAssessmentSchema = z
  .object({
    title: z.string().min(3, "Title is required"),
    prompt: z.string().optional(),
    language: z.enum(["en", "ur", "ar", "fa"]).default("en"),
selectedResources: z.array(z.number()).optional(),

    externalLinks: z.array(z.string().url("Invalid URL")).optional(),

    questionBlocks: z
      .array(
        z
          .object({
            questionType: z.enum(["multiple_choice", "short_answer", "true_false", "matching", "fill_in_the_blank"]),
            questionCount: z.coerce.number().min(1, "Question count must be at least 1"),
            durationPerQuestion: z.coerce.number().min(30, "Duration must be at least 30 seconds").max(600),
            numOptions: z.coerce.number().min(2).optional(),
            positiveMarks: z.coerce
              .number()
              .transform((v) => Math.abs(v))
              .refine((v) => v > 0, "Positive marks must be greater than 0")
              .refine((v) => v <= 100, "Positive marks cannot exceed 100")
              .default(1),
            negativeMarks: z.coerce
              .number()
              .refine((v) => Math.abs(v) <= 100, "Negative marks deduction cannot exceed 100")
              .default(0.25),
          })
          .refine(
            (b) => Math.abs(Number(b.negativeMarks ?? 0)) <= Number(b.positiveMarks ?? 1),
            {
              message: "Negative marks deduction cannot exceed positive marks per question (total number)",
              path: ["negativeMarks"],
            }
          )
      )
      .min(1, "At least one question block is required"),
  })
  .superRefine((data, ctx) => {
    const hasPrompt = data.prompt?.trim();
    const hasResources = data.selectedResources?.length > 0;
    const hasLinks = data.externalLinks?.some((l) => l.trim());

    if (!hasPrompt && !hasResources && !hasLinks) {
      ctx.addIssue({
        path: ["prompt"],
        message: "Provide a Prompt, Resources, or External Links",
      });
    }
  });
