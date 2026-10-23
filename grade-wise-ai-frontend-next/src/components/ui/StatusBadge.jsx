import { cn } from "@/lib/cn.js";
import { statusTone } from "@/lib/ui.js";

const VARIANTS = {
  success: statusTone.success,
  warning: statusTone.warning,
  info: statusTone.info,
  purple: statusTone.purple,
  sky: statusTone.sky,
  neutral: statusTone.neutral,
  danger: statusTone.danger,
};

export default function StatusBadge({
  children,
  label,
  variant = "neutral",
  size = "md",
  className = "",
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        size === "sm" && "px-2 py-0.5 text-[11px]",
        VARIANTS[variant] ?? VARIANTS.neutral,
        className
      )}
    >
      {children ?? label}
    </span>
  );
}
