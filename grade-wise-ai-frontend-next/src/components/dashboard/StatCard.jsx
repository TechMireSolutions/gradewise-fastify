import { cn } from "@/lib/cn.js";
import { statCard } from "@/lib/ui.js";

export default function StatCard({ label, value, icon: Icon, cardClass, iconClass }) {
  return (
    <div className={cn(statCard, cardClass ?? "bg-card")}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        {Icon && (
          <div className={cn("rounded-xl p-3", iconClass)}>
            <Icon className="text-xl" />
          </div>
        )}
      </div>
    </div>
  );
}

export function StatCardGrid({ children, columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" }) {
  return <div className={cn("grid gap-4 mb-8", columns)}>{children}</div>;
}
