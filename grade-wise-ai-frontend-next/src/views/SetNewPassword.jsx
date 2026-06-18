import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAuthStore from "@/features/auth/store.js";
import { Card, CardContent } from "../components/ui/Card.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Modal from "../components/ui/Modal.jsx";
import { FaLock, FaCheckCircle, FaArrowLeft, FaKey, FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";
import { setNewPasswordSchema } from "../scheema/passwordSchemas.js";

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
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });

  const showModal = (type, title, message) => {
    setModal({ isOpen: true, type, title, message });
  };

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
    } catch (err) {
      const fieldErrors = {};
      err.errors.forEach((e) => {
        fieldErrors[e.path[0]] = e.message;
      });
      setErrors(fieldErrors);
      return;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4 py-12">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Form card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Brand header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-5">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <FaKey className="text-white text-2xl" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Set New Password</h1>
            <p className="text-slate-400 text-sm">Enter your new password below to complete the reset</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password field */}
            <div>
              <label htmlFor="newPassword" className="block text-slate-400 text-sm font-medium mb-1.5">
                New Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none" />
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full bg-slate-800/60 backdrop-blur-sm border rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.newPassword
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                      : "border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/30"
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
              <label htmlFor="confirmPassword" className="block text-slate-400 text-sm font-medium mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <FaCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full bg-slate-800/60 backdrop-blur-sm border rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                      : "border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/30"
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
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4">
              <div className="flex items-start gap-3">
                <FaShieldAlt className="text-indigo-400 text-sm mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Password Requirements</p>
                  <ul className="space-y-1">
                    <li className="text-xs text-slate-400 leading-relaxed">At least 8 characters long</li>
                    <li className="text-xs text-slate-400 leading-relaxed">Include uppercase letters</li>
                    <li className="text-xs text-slate-400 leading-relaxed">Include numbers</li>
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
          <div className="mt-6 pt-6 border-t border-slate-700/50 flex flex-col items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors duration-150 cursor-pointer"
            >
              <FaArrowLeft className="text-xs" />
              <span>Back to Login</span>
            </Link>
            <Link
              to="/forgot-password"
              className="text-slate-500 hover:text-slate-400 text-xs font-medium transition-colors duration-150 cursor-pointer"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
      >
        {modal.message}
      </Modal>
    </div>
  );
}

export default SetNewPassword;
