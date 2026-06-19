import { z } from "zod";
import {
  confirmPasswordRefine,
  confirmPasswordRefineConfig,
  passwordField,
  requiredEmailField,
} from "./fields.js";

export const resetPasswordSchema = z.object({
  email: requiredEmailField,
});

export const setNewPasswordSchema = z
  .object({
    newPassword: passwordField,
    confirmPassword: z.string(),
  })
  .refine(confirmPasswordRefine, confirmPasswordRefineConfig);
