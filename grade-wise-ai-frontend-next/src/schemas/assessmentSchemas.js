// assessmentSchemas.js
import { z } from "zod";

export const createAssessmentSchema = z
  .object({
    title: z.string().min(3, "Title is required"),
    prompt: z.string().optional(),
selectedResources: z.array(z.number()).optional(),

    externalLinks: z.array(z.string().url("Invalid URL")).optional(),

    questionBlocks: z
      .array(
        z.object({
          questionType: z.enum(["multiple_choice", "true_false"]),
          questionCount: z.number().min(1),
          durationPerQuestion: z.number().min(30),
          numOptions: z.number().min(2).optional(),
          positiveMarks: z.number().min(0),
          negativeMarks: z.number().min(0),
        })
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
