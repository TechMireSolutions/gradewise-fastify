import { cn } from "@/lib/cn.js";

const VARIANTS = {
  success:
    "border-emerald-500/20 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  warning:
    "border-amber-500/20 bg-amber-500/15 text-amber-700 dark:text-amber-400",
  info: "border-indigo-500/20 bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  purple:
    "border-purple-500/20 bg-purple-500/15 text-purple-700 dark:text-purple-300",
  neutral:
    "border-border bg-btn-secondary text-muted-foreground",
  danger: "border-red-500/20 bg-red-500/15 text-red-700 dark:text-red-400",
};

export default function StatusBadge({
  children,
  variant = "neutral",
  className = "",
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        VARIANTS[variant] ?? VARIANTS.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}
