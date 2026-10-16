import { cn } from "@/lib/cn.js";
import { card } from "@/lib/ui.js";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className={cn(card, "p-12 text-center flex flex-col items-center justify-center")}>
      {Icon && <Icon className="text-4xl text-muted-foreground mb-4" />}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
