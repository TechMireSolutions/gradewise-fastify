import { cn } from "@/lib/cn.js";
import { iconBadge, iconBadgeTeal } from "@/lib/ui.js";

const SIZES = {
  sm: "p-2",
  md: "p-2.5",
  lg: "p-3",
  xl: "p-4",
};

const VARIANTS = {
  indigo: iconBadge,
  teal: iconBadgeTeal,
};

export default function IconBadge({
  icon: Icon,
  variant = "indigo",
  size = "md",
  className = "",
  iconClassName = "text-white text-sm",
}) {
  return (
    <div
      className={cn(VARIANTS[variant] ?? iconBadge, SIZES[size], className)}
      aria-hidden={Icon ? "true" : undefined}
    >
      {Icon && <Icon className={iconClassName} />}
    </div>
  );
}
