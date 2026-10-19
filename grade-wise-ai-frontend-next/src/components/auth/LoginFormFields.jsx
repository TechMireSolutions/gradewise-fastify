"use client";

import { cn } from "@/lib/cn.js";
import { headingGradient, iconBadgeTeal } from "@/lib/ui.js";
import { Button, Input, Label, PasswordInput } from "@/components/ui";
import { FaEnvelope, FaExclamationTriangle } from "react-icons/fa";

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
        <Label htmlFor="login-email">{emailLabel}</Label>
        <div className="relative">
          <FaEnvelope
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none z-10"
          />
          <Input
            id="login-email"
            {...register("email")}
            type="email"
            autoComplete="email"
            error={Boolean(errors.email)}
            aria-errormessage={errors.email ? "login-email-error" : undefined}
            placeholder={emailPlaceholder}
          />
        </div>
        {errors.email && (
          <p
            id="login-email-error"
            role="alert"
            className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5"
          >
            <FaExclamationTriangle className="flex-shrink-0" />
            <span>{errors.email.message}</span>
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="login-password">{passwordLabel}</Label>
        <PasswordInput
          id="login-password"
          {...register("password")}
          autoComplete="current-password"
          error={Boolean(errors.password)}
          aria-errormessage={errors.password ? "login-password-error" : undefined}
          placeholder={passwordPlaceholder}
        />
        {errors.password && (
          <p
            id="login-password-error"
            role="alert"
            className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5"
          >
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
    <Button
      type="submit"
      variant="primary"
      disabled={loading || disabled}
      className="w-full"
    >
      {Icon && <Icon />}
      <span>{label}</span>
    </Button>
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

