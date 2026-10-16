"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { executeGoogleAuthBootstrap, clearPartialSession, bootstrapAppData } from "@/features/auth/bootstrap.js";
import useAuthStore from "@/features/auth/store.js";
import { meApi } from "@/features/auth/api.js";
import { getDestinationRoute } from "@/utils/redirectByRole.js";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let isCancelled = false;

    const resolveCallback = async () => {
      try {
        const user = await executeGoogleAuthBootstrap({
          mode: "redirect",
          router,
        });

        if (user) {
          return;
        }

        const meRes = await meApi();
        const existingUser = meRes.data?.user;

        if (existingUser?.role) {
          useAuthStore.setState({ user: existingUser });
          const destination = getDestinationRoute(existingUser.role);
          if (router.prefetch) router.prefetch(destination);

          if (!isCancelled) {
            router.replace(destination);
          }

          bootstrapAppData(existingUser).catch((err) => {
            console.warn("Background prefetch warning:", err);
          });
          return;
        }

        throw new Error("No active Google authentication session found.");
      } catch (err) {
        console.error("Auth callback resolution error:", err);
        await clearPartialSession();
        if (!isCancelled) {
          const message = err.response?.data?.message || err.message || "Authentication failed.";
          toast.error(message);
          router.replace(`/login?error=${encodeURIComponent(message)}`);
        }
      }
    };

    resolveCallback();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  return null;
}

