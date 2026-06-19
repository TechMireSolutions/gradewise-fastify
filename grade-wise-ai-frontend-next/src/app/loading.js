import { cn } from "@/lib/cn.js";
import { iconBadge, page } from "@/lib/ui.js";
import LoadingSpinner from "@/components/ui/LoadingSpinner.jsx";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";

export default function Loading() {
  return (
    <div className={cn(page, "flex", "min-h-screen", "items-center", "justify-center")}>
      <AmbientBackground />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className={iconBadge}>
          <LoadingSpinner size="lg" type="spinner" color="blue" />
        </div>
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}
