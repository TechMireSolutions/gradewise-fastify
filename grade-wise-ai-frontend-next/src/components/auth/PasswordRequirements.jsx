"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn.js";
import { statusTone } from "@/lib/ui.js";
import { FaCheck, FaShieldAlt } from "react-icons/fa";

export default function PasswordRequirements({
  password = "",
  className = "",
  showStrengthBar = true,
}) {
  const requirements = useMemo(() => {
    return [
      {
        id: "length",
        label: "At least 8 characters",
        met: password.length >= 8,
      },
      {
        id: "uppercase",
        label: "One uppercase letter (A-Z)",
        met: /[A-Z]/.test(password),
      },
      {
        id: "lowercase",
        label: "One lowercase letter (a-z)",
        met: /[a-z]/.test(password),
      },
      {
        id: "number",
        label: "One number (0-9)",
        met: /\d/.test(password),
      },
    ];
  }, [password]);

  const metCount = requirements.filter((r) => r.met).length;
  const strengthPercentage = (metCount / requirements.length) * 100;

  const strengthColor =
    metCount === 0
      ? "bg-border"
      : metCount <= 2
      ? "bg-red-500"
      : metCount === 3
      ? "bg-amber-500"
      : "bg-emerald-500";

  const strengthText =
    metCount === 0
      ? "Enter a password"
      : metCount <= 2
      ? "Weak"
      : metCount === 3
      ? "Fair"
      : "Strong";

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-input/50 p-3.5 transition-colors duration-200",
        className
      )}
      aria-live="polite"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <FaShieldAlt className="text-indigo-600 dark:text-indigo-400 text-xs shrink-0" />
          <span>Password Requirements</span>
        </div>
        {password.length > 0 && showStrengthBar && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full border",
              metCount <= 2
                ? statusTone.danger
                : metCount === 3
                ? statusTone.warning
                : statusTone.success
            )}
          >
            {strengthText}
          </span>
        )}
      </div>

      {showStrengthBar && password.length > 0 && (
        <div
          className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden mb-3"
          role="progressbar"
          aria-valuenow={strengthPercentage}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Password strength"
        >
          <div
            className={cn("h-full transition-all duration-300", strengthColor)}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      )}

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {requirements.map((req) => (
          <li
            key={req.id}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors duration-200",
              req.met
                ? "text-emerald-600 dark:text-emerald-400 font-medium"
                : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200",
                req.met
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-border text-muted-foreground/40"
              )}
            >
              {req.met ? (
                <FaCheck className="w-2.5 h-2.5" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              )}
            </span>
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
