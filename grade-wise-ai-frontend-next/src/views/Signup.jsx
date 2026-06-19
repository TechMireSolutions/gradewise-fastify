import { cn } from "@/lib/cn.js";
import { btn, card, headingGradient } from "@/lib/ui.js";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "@/features/auth/store.js";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Modal from "../components/ui/Modal.jsx";
import AuthPageLayout from "../components/layout/AuthPageLayout.jsx";
import useModal from "../hooks/useModal.js";
import { getCaptchaToken } from "../config/captcha.js";
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaGoogle, FaGraduationCap, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { redirectByRole } from "../utils/redirectByRole.js";
import useRecaptchaInit from "../hooks/useRecaptchaInit.js";
import { signupSchema } from "../schemas/authSchemas.js";
import { parseZodFieldErrors } from "../utils/parseZodFieldErrors.js";

function Signup() {
  const navigate = useNavigate();
  const { signup, googleAuth } = useAuthStore();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { modal, showModal, closeModal } = useModal();

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "dummy-key";
  useRecaptchaInit(siteKey);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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
      const fieldErrors = parseZodFieldErrors(error);
      if (fieldErrors) {
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
    <AuthPageLayout backLabel="Back to Home">
        <div className={cn(card, "p-8", "shadow-2xl")}>
          {/* Logo / brand header */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 flex items-center justify-center mx-auto mb-4">
              <FaGraduationCap className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">
              Create Account
            </h1>
            <p className={cn("text-muted-foreground", "text-sm")}>
              Join{" "}
              <span className={headingGradient}>Gradewise AI</span>{" "}
              as a student
            </p>
          </div>

          {/* Google Signup */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className={cn(btn.google, "mb-6", "shadow-lg")}
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
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className={cn("px-4", "bg-card", "text-muted-foreground", "text-xs", "font-semibold", "uppercase", "tracking-widest")}>
                Or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>
                Full Name
              </label>
              <div className="relative">
                <FaUser className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none")} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-input backdrop-blur-sm border hover:border-accent/40 rounded-xl pl-11 pr-4 py-3 text-secondary-foreground placeholder:text-subtle-foreground text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                      : "border-border focus:border-indigo-500 focus:ring-indigo-500/30"
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
              <label htmlFor="email" className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none")} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-input backdrop-blur-sm border hover:border-accent/40 rounded-xl pl-11 pr-4 py-3 text-secondary-foreground placeholder:text-subtle-foreground text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                      : "border-border focus:border-indigo-500 focus:ring-indigo-500/30"
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
              <label htmlFor="password" className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>
                Password
              </label>
              <div className="relative">
                <FaLock className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none")} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-input backdrop-blur-sm border hover:border-accent/40 rounded-xl pl-11 pr-4 py-3 text-secondary-foreground placeholder:text-subtle-foreground text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                      : "border-border focus:border-indigo-500 focus:ring-indigo-500/30"
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
              <p className={cn("mt-2", "text-xs", "text-muted-foreground", "bg-indigo-500/10", "border", "border-indigo-500/20", "rounded-lg", "px-3", "py-2", "flex", "items-start", "gap-1.5")}>
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
              <p className={cn("text-sm", "text-muted-foreground")}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-150 cursor-pointer"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="bg-input rounded-xl border border-border p-4">
              <p className={cn("text-xs", "text-muted-foreground", "leading-relaxed")}>
                <span className={cn("text-secondary-foreground", "font-medium")}>Note:</span> By creating an account, you agree to our Terms of Service and Privacy Policy.
                All new accounts are created with{" "}
                <span className="text-indigo-400 font-medium">Student role</span> by default.
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
