const VARIANTS = {
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  info: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  neutral: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/25 dark:border-slate-500/30",
  danger: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
};

export default function StatusBadge({ children, variant = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${VARIANTS[variant] ?? VARIANTS.neutral} ${className}`}
    >
      {children}
    </span>
  );
}
