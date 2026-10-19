"use client";

import { cn } from "@/lib/cn.js";
import { card, headingGradient, iconBadge } from "@/lib/ui.js";
import Link from "next/link";
import { Button, Input, Label, LoadingSpinner, Modal, PasswordInput } from "@/components/ui/index.js";
import AuthPageLayout from "@/components/layout/AuthPageLayout.jsx";
import { PasswordRequirements, GoogleAuthButton } from "@/components/auth/index.js";
import useSignupForm from "@/hooks/useSignupForm.js";
import { FaUser, FaEnvelope, FaUserPlus, FaGraduationCap, FaExclamationTriangle } from "react-icons/fa";

function Signup() {
  const {
    formData,
    errors,
    loading,
    googleLoading,
    handleChange,
    handleSubmit,
    handleGoogleSignup,
    modal,
    closeModal,
  } = useSignupForm();

  return (
    <AuthPageLayout backLabel="Back to Home">
      <div className={cn(card, "p-8", "shadow-2xl")}>
        {/* Logo / brand header */}
        <div className="mb-8 text-center">
          <div className={cn("w-16", "h-16", "rounded-2xl", iconBadge, "flex", "items-center", "justify-center", "mx-auto", "mb-4")}>
            <FaGraduationCap className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1 text-wrap-balance">
            Create Account
          </h1>
          <p className={cn("text-muted-foreground", "text-sm", "text-wrap-pretty")}>
            Join{" "}
            <span className={headingGradient}>Gradewise AI</span>{" "}
            as a student
          </p>
        </div>

        {/* Google Signup */}
        <div className="mb-6">
          <GoogleAuthButton
            onClick={handleGoogleSignup}
            loading={googleLoading}
            disabled={loading}
            text="Continue with Google"
            loadingText="Connecting to Google..."
          />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className={cn("px-4", "bg-card", "text-muted-foreground", "text-xs", "font-semibold", "uppercase", "tracking-widest")}>
              Or continue with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name */}
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none z-10" />
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                error={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                placeholder="Enter your full name"
                required
              />
            </div>
            {errors.name && (
              <p id="name-error" role="alert" className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
                <FaExclamationTriangle className="shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="signup-email">Email Address</Label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none z-10" />
              <Input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={Boolean(errors.email)}
                aria-describedby={errors.email ? "signup-email-error" : undefined}
                placeholder="Enter your email address"
                required
              />
            </div>
            {errors.email && (
              <p id="signup-email-error" role="alert" className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
                <FaExclamationTriangle className="shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="signup-password">Password</Label>
            <PasswordInput
              id="signup-password"
              name="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={Boolean(errors.password)}
              aria-describedby={errors.password ? "signup-password-error" : "signup-password-rules"}
              placeholder="Create a strong password"
              required
            />
            {errors.password && (
              <p id="signup-password-error" role="alert" className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
                <FaExclamationTriangle className="shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
            <div id="signup-password-rules" className="mt-2.5">
              <PasswordRequirements password={formData.password} />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            disabled={loading || googleLoading}
            className="w-full"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="white" type="dots" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <FaUserPlus className="shrink-0" />
                <span>Create Account</span>
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <p className={cn("text-sm", "text-muted-foreground")}>
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors duration-150 cursor-pointer"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="bg-input/60 rounded-xl border border-border p-4">
            <p className={cn("text-xs", "text-muted-foreground", "leading-relaxed")}>
              <span className={cn("text-secondary-foreground", "font-medium")}>Note:</span> By creating an account, you agree to our Terms of Service and Privacy Policy.
              All self-registered accounts are created with{" "}
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">Student role</span> by default.
            </p>
          </div>
        </div>
      </div>

      <Modal isOpen={modal.isOpen} onClose={closeModal} type={modal.type} title={modal.title}>
        {modal.message}
      </Modal>
    </AuthPageLayout>
  );
}

export default Signup;
