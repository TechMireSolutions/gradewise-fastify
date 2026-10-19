"use client";

import { useState } from "react";
import { cn } from "@/lib/cn.js";
import { btn, headingGradient, iconBadgeTeal, input, inputError, label } from "@/lib/ui.js";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle } from "react-icons/fa";

export default function LoginFormFields({
  register,
  errors,
  emailLabel = "Email Address",
  passwordLabel = "Password",
  emailPlaceholder = "Enter your email address",
  passwordPlaceholder = "Enter your password",
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleKeyDown = (event) => {
    // Guard against IME composition session (Urdu, Arabic, Persian keyboards)
    if (event.nativeEvent?.isComposing) {
      return;
    }
  };

  return (
    <>
      <div>
        <label htmlFor="login-email" className={label}>
          {emailLabel}
        </label>
        <div className="relative">
          <FaEnvelope className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none", "z-10")} />
          <input
            id="login-email"
            {...register("email")}
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email) ? "true" : undefined}
            aria-errormessage={errors.email ? "login-email-error" : undefined}
            onKeyDown={handleKeyDown}
            className={cn(input, errors.email && inputError)}
            placeholder={emailPlaceholder}
          />
        </div>
        {errors.email && (
          <p id="login-email-error" role="alert" className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="flex-shrink-0" />
            <span>{errors.email.message}</span>
          </p>
        )}
      </div>

      <div>
        <label htmlFor="login-password" className={label}>
          {passwordLabel}
        </label>
        <div className="relative">
          <FaLock className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none", "z-10")} />
          <input
            id="login-password"
            {...register("password")}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password) ? "true" : undefined}
            aria-errormessage={errors.password ? "login-password-error" : undefined}
            onKeyDown={handleKeyDown}
            className={cn(input, "pr-12", errors.password && inputError)}
            placeholder={passwordPlaceholder}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-11 min-w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <FaEyeSlash className="w-4 h-4" />
            ) : (
              <FaEye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p id="login-password-error" role="alert" className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="flex-shrink-0" />
            <span>{errors.password.message}</span>
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
      {Icon && <Icon />}
      <span>{label}</span>
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
