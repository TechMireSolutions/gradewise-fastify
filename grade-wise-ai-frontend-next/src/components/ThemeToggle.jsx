"use client";

import { FaMoon, FaSun } from "react-icons/fa";
import useThemeStore from "@/features/theme/store.js";
import { resolveTheme } from "@/features/theme/resolveTheme.js";
import { cn } from "@/lib/cn.js";
import { focusRing } from "@/lib/ui.js";

export default function ThemeToggle({ className = "" }) {
  const theme = useThemeStore((s) => s.theme);
  const { toggleTheme } = useThemeStore();
  const resolved = resolveTheme(theme);
  const isDark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface-elevated text-secondary-foreground transition-all duration-200 hover:border-accent hover:text-foreground active:scale-95 motion-reduce:active:scale-100",
        focusRing,
        className
      )}
    >
      {isDark ? (
        <FaSun className="size-4" aria-hidden="true" />
      ) : (
        <FaMoon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
