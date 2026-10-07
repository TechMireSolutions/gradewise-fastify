export function parseZodFieldErrors(error) {
  if (!error) return null;
  const issues = Array.isArray(error.errors)
    ? error.errors
    : Array.isArray(error.issues)
    ? error.issues
    : [];
  if (issues.length === 0) return null;
  const fieldErrors = {};
  issues.forEach((err) => {
    const key = err.path?.[0];
    if (key) fieldErrors[key] = err.message;
  });
  return fieldErrors;
}
