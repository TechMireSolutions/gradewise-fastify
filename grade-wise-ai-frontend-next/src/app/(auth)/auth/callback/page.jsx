"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthBootstrapOverlay from "@/components/auth/AuthBootstrapOverlay.jsx";
import { executeGoogleAuthBootstrap, clearPartialSession, bootstrapAppData } from "@/features/auth/bootstrap.js";
import useAuthStore from "@/features/auth/store.js";
import { meApi } from "@/features/auth/api.js";
import { getDestinationRoute } from "@/utils/redirectByRole.js";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [step, setStep] = useState("Resolving Google authentication...");
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    let isCancelled = false;

    const resolveCallback = async () => {
      try {
        setStep("Exchanging Google credentials...");
        setProgress(35);

        // Try resolving redirect result first
        const user = await executeGoogleAuthBootstrap({
          mode: "redirect",
          router,
          onStepChange: (msg) => {
            if (!isCancelled) setStep(msg);
          },
          onProgress: (pct) => {
            if (!isCancelled) setProgress(pct);
          },
        });

        if (user) {
          // Successfully bootstrapped and navigated inside executeGoogleAuthBootstrap
          return;
        }

        // If no redirect user was returned, check if user session already exists in cookie
        setStep("Validating existing session...");
        setProgress(50);
        const meRes = await meApi();
        const existingUser = meRes.data?.user;

        if (existingUser?.role) {
          useAuthStore.setState({ user: existingUser });
          const destination = getDestinationRoute(existingUser.role);
          if (router.prefetch) router.prefetch(destination);

          await bootstrapAppData(existingUser, (msg, pct) => {
            if (!isCancelled) {
              setStep(msg);
              setProgress(pct);
            }
          });

          if (!isCancelled) {
            setStep("Ready! Redirecting...");
            setProgress(100);
            setTimeout(() => router.replace(destination), 300);
          }
          return;
        }

        // Neither redirect nor session was found
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

  return (
    <AuthBootstrapOverlay
      title="Signing in and loading your workspace..."
      step={step}
      progress={progress}
    />
  );
}
