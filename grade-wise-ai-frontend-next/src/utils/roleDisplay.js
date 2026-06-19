export function getRoleBadgeColor(role) {
  const colors = {
    super_admin: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    admin: "bg-red-500/20 text-red-300 border-red-500/30",
    instructor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    student: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  };
  return colors[role] || "bg-slate-500/20 text-slate-300 border-slate-500/30";
}

export function getRoleAvatarBg(role) {
  const colors = {
    super_admin: "from-purple-500 to-violet-600",
    admin: "from-red-500 to-rose-600",
    instructor: "from-blue-500 to-indigo-600",
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
