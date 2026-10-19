import {
  FaUser,
  FaCrown,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaUserShield,
} from "react-icons/fa";

export const ROLE_THEME = {
  super_admin: {
    gradient:     "from-violet-600 via-violet-600 to-indigo-700",
    darkGradient: "dark:from-violet-700 dark:via-violet-700 dark:to-indigo-800",
    badge:        "bg-violet-500/15 text-violet-400 border border-violet-500/20",
    label:        "Super Admin",
    Icon:         FaCrown,
  },
  admin: {
    gradient:     "from-rose-500 via-rose-500 to-violet-600",
    darkGradient: "dark:from-rose-600 dark:via-rose-700 dark:to-violet-800",
    badge:        "bg-red-500/15 text-red-400 border border-red-500/20",
    label:        "Admin",
    Icon:         FaUserShield,
  },
  instructor: {
    gradient:     "from-indigo-500 via-indigo-600 to-violet-600",
    darkGradient: "dark:from-indigo-600 dark:via-indigo-700 dark:to-violet-800",
    badge:        "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
    label:        "Instructor",
    Icon:         FaChalkboardTeacher,
  },
  student: {
    gradient:     "from-emerald-500 via-emerald-500 to-indigo-600",
    darkGradient: "dark:from-emerald-600 dark:via-emerald-700 dark:to-indigo-800",
    badge:        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    label:        "Student",
    Icon:         FaGraduationCap,
  },
};

export const DEFAULT_THEME = {
  gradient:     "from-slate-500 to-slate-600",
  darkGradient: "dark:from-slate-600 dark:to-slate-700",
  badge:        "bg-btn-secondary text-muted-foreground border border-border",
  label:        "User",
  Icon:         FaUser,
};

export const DASHBOARD_MAP = {
  super_admin: "/super-admin/dashboard",
  admin:       "/admin/dashboard",
  instructor:  "/instructor/dashboard",
  student:     "/student/dashboard",
};
