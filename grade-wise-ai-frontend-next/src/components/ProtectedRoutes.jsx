"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../store/authStore.js";
import useHydrated from "../hooks/useHydrated.js";
import LoadingSpinner from "./ui/LoadingSpinner.jsx";

/**
 * A component that protects routes based on user authentication and role.
 * If the user is not authenticated, they are redirected to the login page.
 * If the user is authenticated but does not have an allowed role, they are redirected to the home page.
 * @param {Object} props - The component props.
 * @param {string|string[]} props.requiredRole - The role(s) that are allowed to access this route.
 * @param {React.ReactNode} props.children - The child components to render if access is granted.
 */
function ProtectedRoute({ requiredRole, children }) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated) {
      if (!token || !user || !user.role) {
        router.replace("/login");
      } else if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(user.role)) {
          router.replace("/");
        }
      }
    }
  }, [hydrated, token, user, requiredRole, router]);

  // Render loading while hydration occurs
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="lg" type="spinner" color="blue" />
      </div>
    );
  }

  // Pre-hydration checks fail, return null (handled by useEffect redirect)
  if (!token || !user || !user.role) {
    return null;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return null;
    }
  }

  // If authenticated and authorized, render the child components
  return children;
}

export default ProtectedRoute;
