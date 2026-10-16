import { cn } from "@/lib/cn.js";
import { focusRing, select as selectClass } from "@/lib/ui.js";

export default function Select({ className = "", error = false, ...props }) {
  return (
    <select
      className={cn(
        selectClass,
        error && "border-red-500/55 focus:border-red-500 focus:ring-red-500/15",
        focusRing,
        className
      )}
      {...props}
    />
  );
}
