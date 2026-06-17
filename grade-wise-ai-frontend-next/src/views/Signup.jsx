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

  const inputBase = "w-full pl-10 pr-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2";
  const inputValid = "border-gray-300 dark:border-slate-600 focus-visible:border-violet-500 focus-visible:ring-violet-300";
  const inputError = "border-red-500 focus-visible:ring-red-300";

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
      <div className="flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-2xl border-2 border-gray-200 dark:border-slate-700 rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-6 sm:p-8">
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FaGraduationCap className="text-3xl sm:text-4xl" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Create Account</h2>
              <p className="text-violet-100 text-sm sm:text-base">Join Gradewise AI as a student</p>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {/* Google Signup */}
            <button
              onClick={handleGoogleSignup}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 sm:py-4 min-h-[44px] border-2 border-gray-300 dark:border-slate-600 rounded-xl shadow-md bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-6 font-semibold"
            >
              {googleLoading ? (
                <LoadingSpinner size="sm" type="dots" color="purple" />
              ) : (
                <>
                  <FaGoogle className="text-xl" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-semibold">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.name ? inputError : inputValid}`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <FaExclamationTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.email ? inputError : inputValid}`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <FaExclamationTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.password ? inputError : inputValid}`}
                    placeholder="Create a strong password"
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <FaExclamationTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.password}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-600 dark:text-slate-400 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg p-2 flex items-start gap-1.5">
                  <FaInfoCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-violet-500 dark:text-violet-400" />
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 min-h-[44px] px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
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
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>

              <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border-2 border-violet-200 dark:border-violet-800 rounded-xl p-4">
                <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
                  <strong>Note:</strong> By creating an account, you agree to our Terms of Service and Privacy Policy.
                  All new accounts are created with <strong className="text-violet-600 dark:text-violet-400">Student role</strong> by default.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
