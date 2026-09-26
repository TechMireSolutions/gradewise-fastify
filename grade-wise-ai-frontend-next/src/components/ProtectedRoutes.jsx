"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/features/auth/store.js";
import useHydrated from "../hooks/useHydrated.js";
import LoadingSpinner from "./ui/LoadingSpinner.jsx";

function ProtectedRoute({ requiredRole, children }) {
  const { user, fetchMe } = useAuthStore();
  const router = useRouter();
  const hydrated = useHydrated();

  const isRoleAuthorized = (role) => {
    if (!requiredRole) return true;
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(role);
  };

  const hasImmediateValidSession = Boolean(user?.role && isRoleAuthorized(user.role));
  const [checking, setChecking] = useState(!hasImmediateValidSession);

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;

    const verifySession = async () => {
      try {
        const currentUser = user ?? (await fetchMe());
        if (cancelled) return;

        if (!currentUser?.role) {
          router.replace("/login");
          return;
        }

        if (!isRoleAuthorized(currentUser.role)) {
          router.replace("/");
        }
      } catch {
        if (!cancelled) router.replace("/login");
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    if (!hasImmediateValidSession) {
      verifySession();
    } else {
      setChecking(false);
    }

    return () => {
      cancelled = true;
    };
  }, [hydrated, user, requiredRole, router, fetchMe, hasImmediateValidSession]);

  if ((!hydrated || checking) && !hasImmediateValidSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" type="spinner" color="blue" />
      </div>
    );
  }

  if (!user?.role) return null;
  if (!isRoleAuthorized(user.role)) return null;

  return children;
}

export default ProtectedRoute;
