import { cn } from "@/lib/cn.js";
import { btn, card, gradient, iconBadge, page, shape, statusTone } from "@/lib/ui.js";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useAuthStore from "@/features/auth/store.js";
import LoadingSpinner from "@/components/ui/LoadingSpinner.jsx";
import { FaCheckCircle, FaTimesCircle, FaEnvelope, FaArrowRight } from "react-icons/fa";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";

function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const verifyEmail = useAuthStore((state) => state.verifyEmail);

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setResult({
          success: false,
          message: "Invalid verification link - no token provided.",
          status: "no_token",
        });
        setLoading(false);
        return;
      }

      try {
        const response = await verifyEmail(token);
        setResult(response);
      } catch (error) {
        console.error("Verification error:", error);
        if (error.response && error.response.data) {
          setResult(error.response.data);
        } else {
          setResult({
            success: false,
            message: `An unexpected error occurred during verification: ${error.message}`,
            status: "network_error",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    handleVerification();
  }, [token, verifyEmail]);

  const isSuccess =
    result?.success ||
    ["already_verified", "just_verified", "already_used"].includes(result?.status);

  if (loading) {
    return (
      <div className={cn(page, "flex", "items-center", "justify-center", "px-4", "py-12")}>
        <AmbientBackground />

        <div className={cn("relative", "w-full", "max-w-md", card, "p-8", "shadow-2xl", "text-center")}>
          <div className="mb-8 text-center">
            <div className={cn("inline-flex", "items-center", "justify-center", "w-16", "h-16", "rounded-2xl", iconBadge, "mb-4", "mx-auto")}>
              <FaEnvelope className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Email Verification
              </span>
            </h1>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6 gap-4">
              <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <LoadingSpinner size="lg" type="dots" color="blue" />
              </div>
              <p className={cn("text-secondary-foreground", "font-semibold")}>Verifying your email...</p>
              <p className={cn("text-muted-foreground", "text-sm")}>Please wait a moment</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(page, "flex", "items-center", "justify-center", "px-4", "py-12")}>
      <AmbientBackground />

      <div className={cn("relative", "w-full", "max-w-md", card, "p-8", "shadow-2xl", "text-center")}>
        <div className="mb-8 text-center">
          <div className={cn("inline-flex", "items-center", "justify-center", "w-16", "h-16", "rounded-2xl", iconBadge, "mb-4", "mx-auto")}>
            <FaEnvelope className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Email Verification
            </span>
          </h1>
        </div>

        {isSuccess ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className={cn("p-2.5 rounded-xl shadow-lg shadow-emerald-500/25", gradient.emerald)}>
                <FaCheckCircle className="text-white text-3xl" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Verification Successful!</h2>
              <p className={cn("text-secondary-foreground", "leading-relaxed", "text-sm")}>{result.message}</p>
            </div>

            {result.user && (
              <div className={cn(statusTone.success, shape.panel, "p-4 text-start")}>
                <p className="text-emerald-700 dark:text-emerald-400 text-sm font-semibold mb-1">
                  Welcome, {result.user.name}!
                </p>
                <p className={cn("text-muted-foreground", "text-xs")}>
                  Your account is verified and ready to use.
                </p>
              </div>
            )}

            {result.status === "already_used" && (
              <div className={cn(statusTone.info, shape.panel, "p-4 text-start")}>
                <p className="text-indigo-700 dark:text-indigo-400 text-sm font-semibold mb-1">Good news!</p>
                <p className={cn("text-muted-foreground", "text-xs")}>
                  This verification link was already used successfully. Your account is active.
                </p>
              </div>
            )}

            <Link
              href="/login"
              className={cn(btn.primary, "px-5 py-3", "inline-flex items-center gap-2 cursor-pointer")}
            >
              <span>Go to Login</span>
              <FaArrowRight />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className={cn("p-2.5 rounded-xl shadow-lg shadow-red-500/25", gradient.danger)}>
                <FaTimesCircle className="text-white text-3xl" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Verification Failed</h2>
              <p className={cn("text-secondary-foreground", "leading-relaxed", "text-sm")}>{result?.message || "An unknown error occurred."}</p>
            </div>

            <div className="bg-input rounded-xl border border-border p-4 text-start">
              <p className={cn("text-muted-foreground", "text-xs", "font-semibold", "uppercase", "tracking-widest", "mb-3")}>
                What to try
              </p>
              <ul className={cn("text-muted-foreground", "text-sm", "space-y-2")}>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">&#8226;</span>
                  <span>Check if you have a newer verification email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">&#8226;</span>
                  <span>Try signing up again if needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">&#8226;</span>
                  <span>Contact support if the issue persists</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className={cn(btn.primary, "px-5 py-3", "inline-flex items-center justify-center gap-2 cursor-pointer")}
              >
                Try Login
              </Link>
              <Link
                href="/signup"
                className={cn(btn.secondary, "px-4 py-2.5 inline-flex items-center justify-center gap-2 cursor-pointer")}
              >
                Sign Up Again
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
