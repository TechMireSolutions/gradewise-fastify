import { cn } from "@/lib/cn.js";
import { focusRing, inputError, textarea as textareaClass } from "@/lib/ui.js";

export default function Textarea({ className = "", error = false, ...props }) {
  return (
    <textarea
      className={cn(textareaClass, error && inputError, focusRing, className)}
      {...props}
    />
  );
}
