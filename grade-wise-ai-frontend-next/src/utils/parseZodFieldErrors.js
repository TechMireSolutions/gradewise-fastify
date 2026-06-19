import { ZodError } from "zod";

export function parseZodFieldErrors(error) {
  if (!(error instanceof ZodError)) return null;
  const fieldErrors = {};
  error.errors.forEach((err) => {
    const key = err.path[0];
    if (key) fieldErrors[key] = err.message;
  });
  return fieldErrors;
}
