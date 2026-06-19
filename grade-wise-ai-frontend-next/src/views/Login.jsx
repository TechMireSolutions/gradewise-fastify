import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "@/features/auth/store.js";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Modal from "../components/ui/Modal.jsx";
import AuthPageLayout from "../components/layout/AuthPageLayout.jsx";
import useLoginForm from "../hooks/useLoginForm.js";
import LoginFormFields, { LoginSubmitButton, AuthCardHeader } from "../components/auth/LoginFormFields.jsx";
import { FaSignInAlt, FaGoogle, FaUserCircle } from "react-icons/fa";
import { redirectByRole } from "../utils/redirectByRole.js";

function Login() {
  const navigate = useNavigate();
  const { googleAuth } = useAuthStore();
  const { form, loading, modal, showModal, closeModal, handleLogin } = useLoginForm();
  const { register, formState: { errors } } = form;
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const response = await googleAuth();
      showModal("success", "Welcome!", `Successfully signed in with Google! Welcome back, ${response.name}!`);
      setTimeout(() => redirectByRole(response.role, navigate), 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Google login failed. Please try again.";
      showModal("error", "Google Login Failed", errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthPageLayout backLabel="Back to Home">
      <div className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <AuthCardHeader
          icon={FaUserCircle}
          title="Welcome Back"
          subtitle="Sign in to your Gradewise AI account"
        />

        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500/70 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[44px] mb-6"
        >
          {googleLoading ? (
            <LoadingSpinner size="sm" type="dots" color="blue" />
          ) : (
            <>
              <FaGoogle className="text-base" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700/50" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-slate-800/50 text-slate-500 font-semibold uppercase tracking-widest">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <LoginFormFields register={register} errors={errors} />
          <LoginSubmitButton loading={loading} disabled={googleLoading} label="Sign In" icon={FaSignInAlt} />
        </form>

        <div className="mt-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-150 cursor-pointer">
                Create one here
              </Link>
            </p>
          </div>
          <div className="text-center pt-4 border-t border-slate-700/50">
            <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors duration-150 cursor-pointer">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>

      <Modal isOpen={modal.isOpen} onClose={closeModal} type={modal.type} title={modal.title}>
        {modal.message}
      </Modal>
    </AuthPageLayout>
  );
}

export default Login;
