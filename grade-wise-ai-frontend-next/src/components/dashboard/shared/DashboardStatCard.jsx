import { cn } from "@/lib/cn.js";
import { statSurface } from "@/lib/ui.js";

const toneStyles = {
  indigo: {
    surface: statSurface?.indigo ?? "rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-4 sm:p-5 backdrop-blur-sm",
    icon: "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/25",
  },
  emerald: {
    surface: statSurface?.emerald ?? "rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-4 sm:p-5 backdrop-blur-sm",
    icon: "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25",
  },
  amber: {
    surface: statSurface?.amber ?? "rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-4 sm:p-5 backdrop-blur-sm",
    icon: "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25",
  },
  purple: {
    surface: "rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-4 sm:p-5 backdrop-blur-sm",
    icon: "bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-500/25",
  },
  rose: {
    surface: "rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/20 to-rose-500/20 p-4 sm:p-5 backdrop-blur-sm",
    icon: "bg-gradient-to-br from-red-500 to-rose-600 shadow-rose-500/25",
  },
  sky: {
    surface: "rounded-xl border border-sky-500/30 bg-gradient-to-br from-sky-500/20 to-blue-500/20 p-4 sm:p-5 backdrop-blur-sm",
    icon: "bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-500/25",
  },
};

export default function DashboardStatCard({
  label,
  value,
  icon: Icon,
  tone = "indigo",
  loading = false,
  className,
}) {
  const selectedTone = toneStyles[tone] || toneStyles.indigo;

  if (loading) {
    return (
      <div className={cn("rounded-xl border border-border bg-card/60 p-4 sm:p-5 backdrop-blur-sm animate-pulse", className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-14 rounded-xl bg-muted-foreground/20" />
            <div className="h-3 w-24 rounded bg-muted-foreground/15" />
          </div>
          <div className="h-11 w-11 rounded-xl bg-muted-foreground/20" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("@container", selectedTone.surface, "transition-all duration-200", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-2xl @xs:text-3xl font-bold text-foreground leading-none truncate">
            {value}
          </div>
          <div className="text-xs font-medium text-muted-foreground mt-1 text-pretty break-words">
            {label}
          </div>
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-xl text-white shadow-lg shrink-0", selectedTone.icon)}>
            {typeof Icon === "function" ? (
              <Icon className="w-5 h-5" aria-hidden="true" />
            ) : (
              Icon
            )}
          </div>
        )}
      </div>
    </div>
  );
}
