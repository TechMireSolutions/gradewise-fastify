import { statusTone } from "../lib/ui.js";

export function getRoleBadgeColor(role) {
  const colors = {
    super_admin: statusTone.purple,
    admin: statusTone.danger,
    instructor: statusTone.info,
    student: statusTone.success,
  };
  return colors[role] || statusTone.neutral;
}

export function getRoleAvatarBg(role) {
  const colors = {
    super_admin: "from-purple-500 to-violet-600",
    admin: "from-red-500 to-rose-600",
    instructor: "from-indigo-500 to-indigo-600",
    student: "from-emerald-500 to-teal-600",
  };
  return colors[role] || "from-indigo-600 to-violet-700";
}

export function formatRole(role) {
  if (!role) return "Unknown";
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
