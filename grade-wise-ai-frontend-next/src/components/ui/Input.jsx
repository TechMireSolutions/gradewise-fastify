import { cn } from "@/lib/cn.js";
import { focusRing, input, inputError, inputPlain } from "@/lib/ui.js";

export default function Input({
  className = "",
  error = false,
  hasIcon = true,
  onKeyDown,
  ...props
}) {
  const hasError = Boolean(error);
  const errorMessageId = props.id && hasError ? props["aria-errormessage"] || `${props.id}-error` : undefined;

  const handleKeyDown = (event) => {
    // Guard against IME composition session (Urdu, Arabic, Persian, CJK keyboards)
    if (event.nativeEvent?.isComposing) {
      return;
    }
    onKeyDown?.(event);
  };

  return (
    <input
      aria-invalid={hasError ? "true" : undefined}
      aria-errormessage={errorMessageId}
      className={cn(
        hasIcon ? input : inputPlain,
        hasError && inputError,
        focusRing,
        className
      )}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}
