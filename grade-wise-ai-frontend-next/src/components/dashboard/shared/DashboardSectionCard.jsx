import { cn } from "@/lib/cn.js";
import { card, cardHeader, iconBadge } from "@/lib/ui.js";

export default function DashboardSectionCard({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  className,
  headerClassName,
  bodyClassName = "p-4 sm:p-6 lg:p-8",
}) {
  return (
    <div className={cn(card, "shadow-xl overflow-hidden mb-8 sm:mb-10", className)}>
      <div className={cn(cardHeader, headerClassName)}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={cn(iconBadge, "p-2")}>
                {typeof Icon === "function" ? (
                  <Icon className="w-4 h-4 text-white" aria-hidden="true" />
                ) : (
                  Icon
                )}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-foreground text-balance">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5 text-pretty">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
