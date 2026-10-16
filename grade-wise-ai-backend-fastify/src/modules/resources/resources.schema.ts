import { z } from "zod";

export const ResourceVisibilityEnum = z.enum(["private", "public"]);
export type ResourceVisibility = z.infer<typeof ResourceVisibilityEnum>;

export const ResourceUploadMetaSchema = z.object({
  name: z.string().optional(),
  url: z.string().url().optional(),
  visibility: ResourceVisibilityEnum.optional().default("private"),
});
export type ResourceUploadMetaInput = z.infer<typeof ResourceUploadMetaSchema>;

export const ResourceItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  url: z.string().nullable().optional(),
  visibility: ResourceVisibilityEnum,
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
  createdAt: z.string().or(z.date()).optional(),
});
export type ResourceItem = z.infer<typeof ResourceItemSchema>;
