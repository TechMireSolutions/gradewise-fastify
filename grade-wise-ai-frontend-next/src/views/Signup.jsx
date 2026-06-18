import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "@/features/auth/store.js";
import { Card, CardHeader, CardContent } from "../components/ui/Card.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Modal from "../components/ui/Modal.jsx";
import { getCaptchaToken } from "../config/captcha.js";
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaGoogle, FaGraduationCap, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { redirectByRole } from "../utils/redirectByRole.js";
import useRecaptchaInit from "../hooks/useRecaptchaInit.js";
import { z } from "zod";
import { signupSchema } from "../scheema/authSchemas.js";

function Signup() {
  const navigate = useNavigate();
  const { signup, googleAuth } = useAuthStore();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
      signupSchema.parse(formData);
      const captchaToken = await getCaptchaToken(siteKey, "signup");
      const response = await signup({ ...formData, captchaToken });
      showModal("success", "Registration Successful!", response.message);
      setFormData({ name: "", email: "", password: "" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.issues.forEach((err) => { fieldErrors[err.path[0]] = err.message; });
        setErrors(fieldErrors);
      } else {
        const errorMessage = error.response?.data?.message || error.message || "Registration failed. Please try again.";
        showModal("error", "Registration Failed", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const captchaToken = await getCaptchaToken(siteKey, "google_signup");
      const user = await googleAuth({ captchaToken });
      showModal("success", "Welcome!", `Successfully signed up with Google! Welcome, ${user.name}!`);
      setTimeout(() => redirectByRole(user.role, navigate), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Google signup failed. Please try again.";
      showModal("error", "Google Signup Failed", errorMessage);
    } finally {
      setGoogleLoading(false);
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
          {/* Logo / brand header */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 flex items-center justify-center mx-auto mb-4">
              <FaGraduationCap className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
              Create Account
            </h1>
            <p className="text-slate-400 text-sm">
              Join{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent font-semibold">
                Gradewise AI
              </span>{" "}
              as a student
            </p>
          </div>

          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 min-h-[44px] bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500/60 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-lg"
          >
            {googleLoading ? (
              <LoadingSpinner size="sm" type="dots" color="purple" />
            ) : (
              <>
                <FaGoogle className="text-base" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-slate-800/50 text-slate-500 text-xs font-semibold uppercase tracking-widest">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-slate-400 text-sm font-medium mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-slate-800/60 backdrop-blur-sm border hover:border-slate-600 rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                      : "border-slate-700/60 focus:border-indigo-500 focus:ring-indigo-500/30"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                  <FaExclamationTriangle className="flex-shrink-0" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-slate-400 text-sm font-medium mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-slate-800/60 backdrop-blur-sm border hover:border-slate-600 rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                      : "border-slate-700/60 focus:border-indigo-500 focus:ring-indigo-500/30"
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                  <FaExclamationTriangle className="flex-shrink-0" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-slate-400 text-sm font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-slate-800/60 backdrop-blur-sm border hover:border-slate-600 rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                      : "border-slate-700/60 focus:border-indigo-500 focus:ring-indigo-500/30"
                  }`}
                  placeholder="Create a strong password"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                  <FaExclamationTriangle className="flex-shrink-0" />
                  {errors.password}
                </p>
              )}
              <p className="mt-2 text-xs text-slate-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2 flex items-start gap-1.5">
                <FaInfoCircle className="flex-shrink-0 mt-0.5 text-indigo-400" />
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" type="dots" />
              ) : (
                <>
                  <FaUserPlus />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-150 cursor-pointer"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="text-slate-300 font-medium">Note:</span> By creating an account, you agree to our Terms of Service and Privacy Policy.
                All new accounts are created with{" "}
                <span className="text-indigo-400 font-medium">Student role</span> by default.
              </p>
            </div>
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

export default Signup;
