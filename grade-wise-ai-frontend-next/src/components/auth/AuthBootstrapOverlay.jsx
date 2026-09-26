"use client";

import { cn } from "@/lib/cn.js";
import { card, iconBadge } from "@/lib/ui.js";
import LoadingSpinner from "@/components/ui/LoadingSpinner.jsx";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import { FaGraduationCap, FaCheckCircle, FaSpinner } from "react-icons/fa";

/**
 * Single Blocking Sign-In Loading Screen.
 * Displayed throughout Google OAuth resolution and data pre-fetching
 * until state is 100% hydrated.
 */
export default function AuthBootstrapOverlay({
  title = "Signing in and loading your workspace...",
  step = "Pre-fetching assessments and workspace analytics...",
  progress = 50,
}) {
  return (
    <div
      id="auth-bootstrap-overlay"
      role="alert"
      aria-busy="true"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-background/90 p-4 backdrop-blur-xl"
    >
      <AmbientBackground />

      <div className="relative z-10 w-full max-w-md">
        <div
          className={cn(
            card,
            "relative overflow-hidden p-8 sm:p-10 shadow-2xl border-indigo-500/30 text-center"
          )}
        >
          {/* Subtle top glowing accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-teal-400 to-indigo-500 animate-pulse" />

          {/* Animated Brand Badge */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-teal-400 opacity-40 blur-md animate-pulse" />
              <div className={cn(iconBadge, "relative p-4 rounded-2xl")}>
                <FaGraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Main Title */}
          <h2 className="mb-2 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h2>

          {/* Dynamic Step Status */}
          <div className="mb-6 flex min-h-[1.75rem] items-center justify-center gap-2">
            <FaSpinner className="h-3.5 w-3.5 animate-spin text-teal-400" />
            <p
              id="bootstrap-step-text"
              className="text-xs sm:text-sm font-medium text-teal-400 dark:text-teal-300"
            >
              {step}
            </p>
          </div>

          {/* Progress Bar Container */}
          <div className="mb-6 overflow-hidden rounded-full bg-slate-800/60 p-0.5 border border-indigo-500/20">
            <div
              id="bootstrap-progress-bar"
              className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-teal-400 to-indigo-500 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(45,212,191,0.5)]"
              style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
            />
          </div>

          {/* Reassurance text */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            Please wait while we hydrate your workspace and pre-load your dashboard. You will be redirected instantly with ready data.
          </p>
        </div>
      </div>
    </div>
  );
}
