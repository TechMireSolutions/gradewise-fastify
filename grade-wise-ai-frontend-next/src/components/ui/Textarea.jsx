import { cn } from "@/lib/cn.js";
import { focusRing, inputError, textarea as textareaClass } from "@/lib/ui.js";

export default function Textarea({ className = "", error = false, ...props }) {
  const hasError = Boolean(error);
  const errorMessageId = props.id && hasError ? props["aria-errormessage"] || `${props.id}-error` : undefined;

  return (
    <textarea
      aria-invalid={hasError ? "true" : undefined}
      aria-errormessage={errorMessageId}
      className={cn(textareaClass, hasError && inputError, focusRing, className)}
      {...props}
    />
  );
}
