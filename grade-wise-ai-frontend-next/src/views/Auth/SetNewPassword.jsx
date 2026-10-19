"use client";

import { cn } from "@/lib/cn.js";
import { card, iconBadge } from "@/lib/ui.js";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import useAuthStore from "@/features/auth/store.js";
import { Button, Label, LoadingSpinner, Modal, PasswordInput } from "@/components/ui/index.js";
import { PasswordRequirements } from "@/components/auth/index.js";
import AuthPageLayout from "@/components/layout/AuthPageLayout.jsx";
import useModal from "@/hooks/useModal.js";
import { FaCheckCircle, FaArrowLeft, FaKey, FaExclamationTriangle } from "react-icons/fa";
import { setNewPasswordSchema } from "@/schemas/passwordSchemas.js";
import { parseZodFieldErrors } from "@/utils/parseZodFieldErrors.js";

function SetNewPassword() {
  const router = useRouter();
  const { resetId } = useParams();
  const changePassword = useAuthStore((state) => state.changePassword);

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      setNewPasswordSchema.parse(formData);
    } catch (error) {
      const fieldErrors = parseZodFieldErrors(error);
      if (fieldErrors) {
        setErrors(fieldErrors);
        const firstKey = Object.keys(fieldErrors)[0];
        if (firstKey) {
          document.getElementById(firstKey)?.focus();
        }
        return;
      }
    }

    setLoading(true);

    try {
      await changePassword({ newPassword: formData.newPassword, resetId });
      showModal(
        "success",
        "Password Reset",
        "Your password has been successfully reset. You can now log in with your new password."
      );
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      console.error("Password reset error:", error);
      showModal(
        "error",
        "Reset Failed",
        error.response?.data?.message || "Failed to reset password. The link may be invalid or expired. Please request a new reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  const isPasswordsMatching =
    formData.confirmPassword && formData.newPassword === formData.confirmPassword;
  const isPasswordsMismatched =
    formData.confirmPassword && formData.newPassword !== formData.confirmPassword;

  return (
    <AuthPageLayout backLabel="Back to Login" backTo="/login">
      <div className={cn(card, "p-8", "shadow-2xl")}>
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-5">
            <div className={cn("p-3.5", "rounded-2xl", iconBadge)}>
              <FaKey className="text-white text-2xl" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Set New Password</h1>
          <p className={cn("text-muted-foreground", "text-sm")}>Enter your new password below to complete the reset</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* New Password field */}
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              autoComplete="new-password"
              value={formData.newPassword}
              onChange={handleChange}
              error={Boolean(errors.newPassword)}
              aria-describedby={errors.newPassword ? "newPassword-error" : "newPassword-rules"}
              placeholder="Enter new password"
              required
            />
            {errors.newPassword && (
              <p id="newPassword-error" role="alert" className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1.5">
                <FaExclamationTriangle className="shrink-0" />
                <span>{errors.newPassword}</span>
              </p>
            )}
            <div id="newPassword-rules" className="mt-2.5">
              <PasswordRequirements password={formData.newPassword} />
            </div>
          </div>

          {/* Confirm Password field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="confirmPassword" className="mb-0">
                Confirm Password
              </Label>
              {isPasswordsMatching && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <FaCheckCircle className="w-3 h-3" />
                  <span>Passwords match</span>
                </span>
              )}
            </div>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={Boolean(errors.confirmPassword || isPasswordsMismatched)}
              aria-describedby={
                errors.confirmPassword
                  ? "confirmPassword-error"
                  : isPasswordsMismatched
                  ? "confirmPassword-mismatch"
                  : undefined
              }
              placeholder="Confirm new password"
              required
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" role="alert" className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1.5">
                <FaExclamationTriangle className="shrink-0" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
            {!errors.confirmPassword && isPasswordsMismatched && (
              <p id="confirmPassword-mismatch" role="alert" className="text-amber-600 dark:text-amber-400 text-xs mt-1.5 flex items-center gap-1.5">
                <FaExclamationTriangle className="shrink-0" />
                <span>Passwords do not match yet</span>
              </p>
            )}
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="white" type="dots" />
                <span>Setting New Password...</span>
              </>
            ) : (
              <>
                <FaCheckCircle className="shrink-0" />
                <span>Set New Password</span>
              </>
            )}
          </Button>
        </form>

        {/* Footer links */}
        <div className="mt-6 pt-6 border-t border-border flex flex-col items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium text-sm transition-colors duration-150 cursor-pointer"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back to Login</span>
          </Link>
          <Link
            href="/forgot-password"
            className={cn("text-muted-foreground", "hover:text-foreground", "text-xs", "font-medium", "transition-colors", "duration-150", "cursor-pointer")}
          >
            Request a new reset link
          </Link>
        </div>
      </div>

      <Modal isOpen={modal.isOpen} onClose={closeModal} type={modal.type} title={modal.title}>
        {modal.message}
      </Modal>
    </AuthPageLayout>
  );
}

export default SetNewPassword;
