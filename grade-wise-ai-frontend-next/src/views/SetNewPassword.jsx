import { cn } from "@/lib/cn.js";
import { card } from "@/lib/ui.js";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAuthStore from "@/features/auth/store.js";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Modal from "../components/ui/Modal.jsx";
import AuthPageLayout from "../components/layout/AuthPageLayout.jsx";
import useModal from "../hooks/useModal.js";
import { FaLock, FaCheckCircle, FaArrowLeft, FaKey, FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";
import { setNewPasswordSchema } from "../schemas/passwordSchemas.js";
import { parseZodFieldErrors } from "../utils/parseZodFieldErrors.js";

function SetNewPassword() {
  const navigate = useNavigate();
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
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setNewPasswordSchema.parse(formData);
      setErrors({});
    } catch (error) {
      const fieldErrors = parseZodFieldErrors(error);
      if (fieldErrors) {
        setErrors(fieldErrors);
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
      setTimeout(() => navigate("/login"), 3000);
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

  return (
    <AuthPageLayout backLabel="Back to Login" backTo="/login">
        <div className={cn(card, "p-8", "shadow-2xl")}>
          {/* Brand header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-5">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <FaKey className="text-white text-2xl" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Set New Password</h1>
            <p className={cn("text-muted-foreground", "text-sm")}>Enter your new password below to complete the reset</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password field */}
            <div>
              <label htmlFor="newPassword" className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>
                New Password
              </label>
              <div className="relative">
                <FaLock className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none")} />
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full bg-input backdrop-blur-sm border rounded-xl pl-11 pr-4 py-3 text-secondary-foreground placeholder:text-subtle-foreground text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.newPassword
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                      : "border-border hover:border-accent/40 focus:border-indigo-500 focus:ring-indigo-500/30"
                  }`}
                  placeholder="Enter new password"
                  required
                />
              </div>
              {errors.newPassword && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5">
                  <FaExclamationTriangle className="shrink-0" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>
                Confirm Password
              </label>
              <div className="relative">
                <FaCheckCircle className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none")} />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full bg-input backdrop-blur-sm border rounded-xl pl-11 pr-4 py-3 text-secondary-foreground placeholder:text-subtle-foreground text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                      : "border-border hover:border-accent/40 focus:border-indigo-500 focus:ring-indigo-500/30"
                  }`}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5">
                  <FaExclamationTriangle className="shrink-0" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password requirements hint */}
            <div className="bg-input rounded-xl border border-border p-4">
              <div className="flex items-start gap-3">
                <FaShieldAlt className="text-indigo-400 text-sm mt-0.5 shrink-0" />
                <div>
                  <p className={cn("text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-widest", "mb-1.5")}>Password Requirements</p>
                  <ul className="space-y-1">
                    <li className={cn("text-xs", "text-muted-foreground", "leading-relaxed")}>At least 8 characters long</li>
                    <li className={cn("text-xs", "text-muted-foreground", "leading-relaxed")}>Include uppercase letters</li>
                    <li className={cn("text-xs", "text-muted-foreground", "leading-relaxed")}>Include numbers</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="white" type="dots" />
                  <span>Setting New Password...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  <span>Set New Password</span>
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 pt-6 border-t border-border flex flex-col items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors duration-150 cursor-pointer"
            >
              <FaArrowLeft className="text-xs" />
              <span>Back to Login</span>
            </Link>
            <Link
              to="/forgot-password"
              className={cn("text-muted-foreground", "hover:text-muted-foreground", "text-xs", "font-medium", "transition-colors", "duration-150", "cursor-pointer")}
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
