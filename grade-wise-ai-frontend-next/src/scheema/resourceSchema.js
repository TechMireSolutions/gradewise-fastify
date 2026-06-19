import { z } from "zod";
import {
  FILE_CONSTANTS,
  fileSchema,
  filesArraySchema,
  validateFiles,
} from "./fileSchemas.js";

export { FILE_CONSTANTS as RESOURCE_CONSTANTS, fileSchema, filesArraySchema, validateFiles };

export const resourceSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  type: z.enum(["file", "link", "text"], { required_error: "Resource type is required" }),
  content: z.string().optional(),
  link: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});
