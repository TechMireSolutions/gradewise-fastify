import { cn } from "@/lib/cn.js";
import { label as labelClass } from "@/lib/ui.js";

export default function Label({ className = "", children, ...props }) {
  return (
    <label className={cn(labelClass, className)} {...props}>
      {children}
    </label>
  );
}
