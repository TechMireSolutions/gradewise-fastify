export function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Resolve stored theme preference to an applied light/dark value. */
export function resolveTheme(theme) {
  if (theme === "system" || !theme) return getSystemTheme();
  return theme === "dark" ? "dark" : "light";
}
