import { cn } from "@/lib/cn.js";
import { focusRing, select as selectClass } from "@/lib/ui.js";
import { FiChevronDown } from "react-icons/fi";

export default function Select({ className = "", error = false, containerClassName = "", ...props }) {
  return (
    <div className={cn("relative w-full", containerClassName)}>
      <select
        className={cn(
          selectClass,
          "pr-10",
          error && "border-red-500/55 focus:border-red-500 focus:ring-red-500/15",
          focusRing,
          className
        )}
        {...props}
      />
      <FiChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-subtle-foreground text-sm" aria-hidden="true" />
    </div>
  );
}

