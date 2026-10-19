"use client";

import { cn } from "@/lib/cn.js";
import { btn } from "@/lib/ui.js";
import { FaGoogle } from "react-icons/fa";
import LoadingSpinner from "@/components/ui/LoadingSpinner.jsx";

export default function GoogleAuthButton({
  onClick,
  loading = false,
  text = "Continue with Google",
  loadingText = "Connecting to Google...",
  disabled = false,
  className,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(btn.google, "w-full min-h-[44px] justify-center flex items-center gap-2", className)}
    >
      {loading ? (
        <LoadingSpinner size="sm" type="spinner" color="blue" />
      ) : (
        <FaGoogle className="w-4 h-4 text-red-500" aria-hidden="true" />
      )}
      <span>{loading ? loadingText : text}</span>
    </button>
  );
}
