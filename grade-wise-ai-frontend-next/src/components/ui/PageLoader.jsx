import { cn } from "@/lib/cn.js";
import { card, page } from "@/lib/ui.js";
import LoadingSpinner from "./LoadingSpinner.jsx";
import AmbientBackground from "../layout/AmbientBackground.jsx";

export default function PageLoader({ message = "Loading..." }) {
  return (
    <div className={cn(page, "flex", "items-center", "justify-center", "px-4")}>
      <AmbientBackground />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className={cn("p-4", "rounded-2xl", card)}>
          <LoadingSpinner size="lg" type="spinner" color="blue" />
        </div>
        {message && <p className={cn("text-muted-foreground", "text-sm")}>{message}</p>}
      </div>
    </div>
  );
}
