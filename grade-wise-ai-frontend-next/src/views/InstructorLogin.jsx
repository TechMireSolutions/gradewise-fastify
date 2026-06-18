import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "@/features/auth/store.js";
import { Card, CardHeader, CardContent } from "../components/ui/Card.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Modal from "../components/ui/Modal.jsx";
import axios from "axios";
import { getCaptchaToken } from "../config/captcha.js";
import { FaSignInAlt, FaChalkboardTeacher, FaArrowLeft, FaEnvelope, FaLock } from "react-icons/fa";
import { redirectByRole } from "../utils/redirectByRole.js";
import useRecaptchaInit from "../hooks/useRecaptchaInit.js";
import { ZodError } from "zod";
import { loginSchema } from "../scheema/authSchemas.js";

function InstructorLogin() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "info", title: "", message: "" });

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "dummy-key";
  useRecaptchaInit(siteKey);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const showModal = (type, title, message) => {
    setModal({ isOpen: true, type, title, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      loginSchema.parse(formData);
      const captchaToken = await getCaptchaToken(siteKey, "login");

      const response = await login({ ...formData, captchaToken });

      // RESTRICTIVE ROLE CHECK
      const allowedRoles = ["instructor"];
      if (!allowedRoles.includes(response.role)) {
        // Clear tokens if role is unauthorized
        useAuthStore.getState().logout();
        showModal("error", "Access Denied", "Unauthorized: This portal is strictly for Instructors only.");
        return;
      }

      const token = useAuthStore.getState().token;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      showModal("success", "Instructor Access Granted", `Welcome back, Instructor ${response.name}!`);

      setTimeout(() => {
        redirectByRole(response.role, navigate);
      }, 1500);
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
        showModal("error", "Login Failed", errorMessage);
      }
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
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-300 mb-6 transition-colors duration-150 text-sm font-medium group"
        >
          <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform duration-150" />
          <span>Back to Home Page</span>
        </Link>

        <div className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Brand header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-5">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <FaChalkboardTeacher className="text-2xl text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
              Instructor Portal
            </h1>
            <p className="text-slate-400 text-sm">
              Sign in to your{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent font-semibold">
                Gradewise AI
              </span>{" "}
              educator account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-1.5">
                Instructor Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-slate-800/60 backdrop-blur-sm border rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                      : "border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/30"
                  }`}
                  placeholder="instructor@gradewise.ai"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-1.5">
                Portal Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-slate-800/60 backdrop-blur-sm border rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                      : "border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/30"
                  }`}
                  placeholder="••••••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 mt-1"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" type="dots" />
              ) : (
                <>
                  <FaSignInAlt />
                  <span>Enter Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-7 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Academic Portal &bull; Secure Access
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-slate-500 text-xs">
          Gradewise AI Educator Network &copy; 2026
        </p>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
      >
        <div className="text-slate-300">{modal.message}</div>
      </Modal>
    </div>
  );
}

export default InstructorLogin;
