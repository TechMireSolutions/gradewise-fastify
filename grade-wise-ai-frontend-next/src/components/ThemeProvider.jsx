"use client";

import { useEffect } from "react";
import useThemeStore from "@/features/theme/store.js";
import { resolveTheme } from "@/features/theme/resolveTheme.js";

function applyTheme(resolved) {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.style.colorScheme = resolved;
}

export default function ThemeProvider({ children }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    applyTheme(resolveTheme(theme));
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(resolveTheme("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  return children;
}

export function ThemeScript() {
  const script = `(function(){try{var r=localStorage.getItem('theme-storage');var t=r&&JSON.parse(r);var m=(t&&t.state&&t.state.theme)||'system';if(m==='system'){m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}var d=document.documentElement;if(m==='dark'){d.classList.add('dark');d.style.colorScheme='dark';}else{d.classList.remove('dark');d.style.colorScheme='light';}}catch(e){var f=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var d=document.documentElement;if(f==='dark'){d.classList.add('dark');d.style.colorScheme='dark';}else{d.classList.remove('dark');d.style.colorScheme='light';}}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
