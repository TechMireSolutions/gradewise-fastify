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

export const createUserSchema = z
  .object({
    name: nameField,
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["admin", "instructor", "student"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
