"use client";

import { useState } from "react";
import { cn } from "@/lib/cn.js";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Input from "./Input.jsx";

export default function PasswordInput({
  id,
  name = "password",
  value,
  onChange,
  error = false,
  className = "",
  placeholder = "Enter password",
  autoComplete = "current-password",
  required = false,
  leftIcon: LeftIcon = FaLock,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      {LeftIcon && (
        <LeftIcon
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none z-10"
          )}
        />
      )}
      <Input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        {...(value !== undefined ? { value } : {})}
        onChange={onChange}
        error={error}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        className={cn("pr-12", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword((prev) => !prev)}
        className={cn(
          "absolute right-1.5 top-1/2 -translate-y-1/2 min-h-11 min-w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20"
        )}
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
  );
}
