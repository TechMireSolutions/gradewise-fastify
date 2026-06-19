import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "@/features/auth/store.js";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Modal from "../components/ui/Modal.jsx";
import AuthPageLayout from "../components/layout/AuthPageLayout.jsx";
import useModal from "../hooks/useModal.js";
import { FaEnvelope, FaPaperPlane, FaArrowLeft, FaLock, FaExclamationTriangle } from "react-icons/fa";
import { resetPasswordSchema } from "../scheema/passwordSchemas.js";
import { parseZodFieldErrors } from "../utils/parseZodFieldErrors.js";
function ResetPassword() {
  const navigate = useNavigate();
  const forgotPassword = useAuthStore((state) => state.forgotPassword);

  const [formData, setFormData] = useState({
    email: "",
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



  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    try {
      resetPasswordSchema.parse(formData);
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
      await forgotPassword({ email: formData.email });
      showModal(
        "success",
        "Reset Link Sent",
        "If an account with that email exists, a password reset link has been sent. Please check your inbox and spam/junk folder. The link will take you to a page to set a new password."
      );

      setTimeout(() => navigate("/login"), 5000);
    } catch (error) {
      console.error("Forgot password error:", error);

      showModal(
        "error",
        "Request Failed",
        error.message || "Failed to send reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout backLabel="Back to Login" backTo="/login">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Logo/brand header */}
          <div className="mb-8 text-center">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 w-fit mx-auto mb-5">
              <FaLock className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Forgot Password
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleForgotSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-slate-400 text-sm font-medium mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-slate-800/60 backdrop-blur-sm border rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                      : "border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/30"
                  }`}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5">
                  <FaExclamationTriangle className="text-xs flex-shrink-0" />
                  {errors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="white" type="dots" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-4">
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors duration-150 cursor-pointer"
              >
                <FaArrowLeft className="text-xs" />
                <span>Back to Login</span>
              </Link>
            </div>

            <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="text-slate-300 font-medium">Note:</span> The reset link will be sent to your email if an account exists. Please check your spam folder if you don't see it in your inbox.
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
