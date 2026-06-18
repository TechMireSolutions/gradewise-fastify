import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuthStore from "@/features/auth/store.js";
import { Card, CardHeader, CardContent } from "../components/ui/Card.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Modal from "../components/ui/Modal.jsx";
import { getCaptchaToken } from "../config/captcha.js";
import { FaLock, FaSignInAlt, FaUserShield, FaArrowLeft, FaEnvelope } from "react-icons/fa";
import { redirectByRole } from "../utils/redirectByRole.js";
import useRecaptchaInit from "../hooks/useRecaptchaInit.js";
import { loginSchema } from "../scheema/authSchemas.js";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "dummy-key";
  useRecaptchaInit(siteKey);

  const showModal = (type, title, message) => {
    setModal({ isOpen: true, type, title, message });
  };

  const handleSubmit = rhfHandleSubmit(async (data) => {
    setLoading(true);
    try {
      const captchaToken = await getCaptchaToken(siteKey, "login");
      const response = await login({ ...data, captchaToken });

      const allowedRoles = ["admin", "super_admin"];
      if (!allowedRoles.includes(response.role)) {
        useAuthStore.getState().logout();
        showModal("error", "Access Denied", "Unauthorized: This portal is strictly for Administrators only.");
        return;
      }

      showModal("success", "Admin Access Granted", `Welcome back, Administrator ${response.name}!`);

      setTimeout(() => {
        redirectByRole(response.role, navigate);
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      showModal("error", "Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4 py-12">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors duration-150 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-150" />
          <span className="text-sm font-medium">Back to Home Page</span>
        </Link>

        {/* Form card */}
        <div className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Brand header */}
          <div className="mb-8 text-center">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 w-16 h-16 flex items-center justify-center mx-auto mb-5">
              <FaUserShield className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Admin Portal
              </span>
            </h1>
            <p className="text-slate-400 text-sm">Secure administrative access only</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  {...register("email")}
                  type="email"
                  className={`w-full bg-slate-800/60 backdrop-blur-sm border hover:border-slate-600 rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30"
                      : "border-slate-700/60 focus:border-indigo-500 focus:ring-indigo-500/30"
                  }`}
                  placeholder="admin@gradewise.ai"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  {...register("password")}
                  type="password"
                  className={`w-full bg-slate-800/60 backdrop-blur-sm border hover:border-slate-600 rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30"
                      : "border-slate-700/60 focus:border-indigo-500 focus:ring-indigo-500/30"
                  }`}
                  placeholder="••••••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 min-h-[44px]"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" type="dots" />
              ) : (
                <>
                  <FaSignInAlt />
                  <span>Authorize Access</span>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              System Security Level: High
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-slate-500 text-xs">
          Gradewise AI Management Systems &copy; 2026
        </p>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
      >
        <div className="text-slate-200">{modal.message}</div>
      </Modal>
    </div>
  );
}

export default AdminLogin;
