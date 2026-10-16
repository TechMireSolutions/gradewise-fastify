import { cn } from "@/lib/cn.js";
import { focusRing, input, inputError, inputPlain } from "@/lib/ui.js";

export default function Input({
  className = "",
  error = false,
  hasIcon = true,
  ...props
}) {
  return (
    <input
      className={cn(
        hasIcon ? input : inputPlain,
        error && inputError,
        focusRing,
        className
      )}
      {...props}
    />
  );
}
