"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";
import useAuthStore from "@/features/auth/store.js";

const IDLE_TIMEOUT_MS = 60 * 60 * 1000;
const RESET_THROTTLE_MS = 30 * 1000;

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
  "focus",
];

export default function AutoLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const authenticated = Boolean(user?.role);
  const timerRef = useRef(null);
  const lastResetRef = useRef(0);

  useEffect(() => {
    if (!authenticated) return;

    const logoutIdle = () => {
      clearTimeout(timerRef.current);
      (async () => {
        try {
          const { logout } = useAuthStore.getState();
          await logout();
        } catch {
          // logout() clears local state in a finally block
        }
        toast("You were logged out due to inactivity", { icon: "⏰" });
        router.replace("/login");
      })();
    };

    const resetTimer = () => {
      const now = Date.now();
      if (now - lastResetRef.current < RESET_THROTTLE_MS) return;
      lastResetRef.current = now;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(logoutIdle, IDLE_TIMEOUT_MS);
    };

    resetTimer();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true });
    }

    return () => {
      clearTimeout(timerRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
    };
  }, [authenticated, router, pathname]);

  return null;
}