import { cn } from "@/lib/cn.js";
import { focusRing, input, inputError } from "@/lib/ui.js";

export default function Input({ className = "", error = false, ...props }) {
  return (
    <input
      className={cn(input, error && inputError, focusRing, className)}
      {...props}
    />
  );
}
