import { cn } from "@/lib/cn.js";
import { btn, headingGradient, iconBadgeTeal, input, inputError, label } from "@/lib/ui.js";
import { FaEnvelope, FaLock, FaExclamationTriangle } from "react-icons/fa";
import LoadingSpinner from "../ui/LoadingSpinner.jsx";

export default function LoginFormFields({
  register,
  errors,
  emailLabel = "Email Address",
  passwordLabel = "Password",
  emailPlaceholder = "Enter your email address",
  passwordPlaceholder = "Enter your password",
}) {
  return (
    <>
      <div>
        <label className={label}>{emailLabel}</label>
        <div className="relative">
          <FaEnvelope className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none")} />
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            className={cn(input, errors.email && inputError)}
            placeholder={emailPlaceholder}
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="flex-shrink-0" />
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className={label}>{passwordLabel}</label>
        <div className="relative">
          <FaLock className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none")} />
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            className={cn(input, errors.password && inputError)}
            placeholder={passwordPlaceholder}
          />
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="flex-shrink-0" />
            {errors.password.message}
          </p>
        )}
      </div>
    </>
  );
}

export function LoginSubmitButton({ loading, label = "Sign In", icon: Icon, disabled = false }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={cn(btn.primary, "w-full", "disabled:opacity-50", "disabled:cursor-not-allowed")}
    >
      {loading ? (
        <LoadingSpinner size="sm" color="white" type="dots" />
      ) : (
        <>
          {Icon && <Icon />}
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export function AuthCardHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-8 text-center">
      <div className={cn(iconBadgeTeal, "w-16", "h-16", "mx-auto", "mb-5")}>
        <Icon className="text-white text-2xl" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-1">
        <span className={headingGradient}>{title}</span>
      </h1>
      {subtitle && <p className={cn("text-muted-foreground", "text-sm", "mt-2")}>{subtitle}</p>}
    </div>
  );
}
