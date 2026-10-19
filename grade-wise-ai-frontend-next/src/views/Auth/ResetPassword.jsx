"use client";

import { cn } from "@/lib/cn.js";
import { card, iconBadge } from "@/lib/ui.js";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/features/auth/store.js";
import { Button, Input, Label, LoadingSpinner, Modal } from "@/components/ui/index.js";
import AuthPageLayout from "@/components/layout/AuthPageLayout.jsx";
import useModal from "@/hooks/useModal.js";
import { FaEnvelope, FaPaperPlane, FaArrowLeft, FaLock, FaExclamationTriangle } from "react-icons/fa";
import { resetPasswordSchema } from "@/schemas/passwordSchemas.js";
import { parseZodFieldErrors } from "@/utils/parseZodFieldErrors.js";

function ResetPassword() {
  const router = useRouter();
  const forgotPassword = useAuthStore((state) => state.forgotPassword);

  const [formData, setFormData] = useState({
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { modal, showModal, closeModal } = useModal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      resetPasswordSchema.parse(formData);
    } catch (error) {
      const fieldErrors = parseZodFieldErrors(error);
      if (fieldErrors) {
        setErrors(fieldErrors);
        document.getElementById("forgot-email")?.focus();
        return;
      }
    }

    setLoading(true);

    try {
      await forgotPassword({ email: formData.email });
      showModal(
        "success",
        "Reset Link Sent",
        "If an account with that email exists, a password reset link has been sent. Please check your inbox and spam/junk folder. The link will take you to a page to set a new password."
      );

      setTimeout(() => router.push("/login"), 5000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to send reset link.";
      showModal("error", "Request Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout backLabel="Back to Login" backTo="/login">
      <div className={cn(card, "p-8", "shadow-2xl")}>
        {/* Logo/brand header */}
        <div className="mb-8 text-center">
          <div className={cn("p-3", "rounded-2xl", iconBadge, "w-fit", "mx-auto", "mb-5")}>
            <FaLock className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
            Forgot Password
          </h1>
          <p className={cn("text-muted-foreground", "text-sm", "leading-relaxed")}>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleForgotSubmit} className="space-y-5" noValidate>
          <div>
            <Label htmlFor="forgot-email">Email Address</Label>
            <div className="relative">
              <FaEnvelope className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none", "z-10")} />
              <Input
                type="email"
                id="forgot-email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={Boolean(errors.email)}
                aria-describedby={errors.email ? "forgot-email-error" : undefined}
                placeholder="Enter your email"
                required
              />
            </div>
            {errors.email && (
              <p id="forgot-email-error" role="alert" className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1.5">
                <FaExclamationTriangle className="text-xs flex-shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="white" type="dots" />
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <>
                <FaPaperPlane className="shrink-0" />
                <span>Send Reset Link</span>
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-border space-y-4">
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium text-sm transition-colors duration-150 cursor-pointer"
            >
              <FaArrowLeft className="text-xs" />
              <span>Back to Login</span>
            </Link>
          </div>

          <div className="bg-input/60 rounded-xl border border-border p-4">
            <p className={cn("text-xs", "text-muted-foreground", "leading-relaxed")}>
              <span className={cn("text-secondary-foreground", "font-medium")}>Note:</span> The reset link will be sent to your email if an account exists. Please check your spam folder if you don&apos;t see it in your inbox.
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

export default ResetPassword;
