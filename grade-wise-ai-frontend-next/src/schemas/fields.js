import { z } from "zod";

export const emailField = z.string().email("Please enter a valid email address");

export const requiredEmailField = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

export const nameField = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters");

export const confirmPasswordRefine = (data) => data.newPassword === data.confirmPassword;

export const confirmPasswordRefineConfig = {
  path: ["confirmPassword"],
  message: "Passwords do not match",
};
