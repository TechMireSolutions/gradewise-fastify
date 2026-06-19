export function getRoleBadgeColor(role) {
  const colors = {
    super_admin:
      "bg-purple-500/15 text-purple-700 border-purple-500/25 dark:text-purple-300 dark:border-purple-500/30",
    admin:
      "bg-red-500/15 text-red-700 border-red-500/25 dark:text-red-300 dark:border-red-500/30",
    instructor:
      "bg-blue-500/15 text-blue-700 border-blue-500/25 dark:text-blue-300 dark:border-blue-500/30",
    student:
      "bg-emerald-500/15 text-emerald-700 border-emerald-500/25 dark:text-emerald-300 dark:border-emerald-500/30",
  };
  return (
    colors[role] ||
    "bg-slate-500/15 text-slate-700 border-slate-500/25 dark:text-secondary-foreground dark:border-slate-500/30"
  );
}

export function getRoleAvatarBg(role) {
  const colors = {
    super_admin: "from-purple-500 to-violet-600",
    admin: "from-red-500 to-rose-600",
    instructor: "from-indigo-50 dark:from-indigo-950/300 to-indigo-600",
    student: "from-emerald-500 to-teal-600",
  };
  return colors[role] || "from-slate-500 to-slate-600";
}

export function formatRole(role) {
  if (!role) return "Unknown";
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
