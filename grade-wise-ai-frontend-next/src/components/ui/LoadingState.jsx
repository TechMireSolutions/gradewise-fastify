import { cn } from "@/lib/cn.js";
import { card } from "@/lib/ui.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

export default function LoadingState({
  message = "Loading...",
  size = "lg",
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${compact ? "py-16" : "py-32"}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className={cn("p-4", "rounded-2xl", card, "shadow-none")}>
        <LoadingSpinner size={size} type="spinner" color="blue" />
      </div>
      {message && <p className={cn("text-muted-foreground", "text-sm")}>{message}</p>}
    </div>
  );
}
