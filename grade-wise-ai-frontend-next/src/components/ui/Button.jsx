import { cn } from "@/lib/cn.js";
import { btn, focusRing } from "@/lib/ui.js";

const VARIANTS = {
  primary: btn.primary,
  secondary: btn.secondary,
  google: btn.google,
  success: btn.success,
  danger: btn.danger,
};

export default function Button({
  variant = "primary",
  className = "",
  as: Component = "button",
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <Component
      className={cn(VARIANTS[variant] ?? btn.primary, focusRing, className)}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </Component>
  );
}
