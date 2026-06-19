import { z } from "zod";
import { emailField, nameField, passwordField } from "./fields.js";

export const registerStudentSchema = z
  .object({
    name: nameField,
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const enrollStudentSchema = z.object({
  email: emailField,
});
