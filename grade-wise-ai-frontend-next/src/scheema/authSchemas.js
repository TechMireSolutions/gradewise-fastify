import { z } from "zod";
import { emailField, nameField, passwordField } from "./fields.js";

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
});
