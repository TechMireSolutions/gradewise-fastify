export const INSTRUCTOR_ROLES = ["instructor", "admin", "super_admin"] as const;
export const ADMIN_ROLES = ["admin", "super_admin"] as const;
export const SUPER_ADMIN_ROLES = ["super_admin"] as const;

export type InstructorRole = (typeof INSTRUCTOR_ROLES)[number];
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role: string): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

export function isInstructorRole(role: string): boolean {
  return (INSTRUCTOR_ROLES as readonly string[]).includes(role);
}
