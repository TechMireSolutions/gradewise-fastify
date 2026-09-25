import { cn } from "@/lib/cn.js";
import { btn, card } from "@/lib/ui.js";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/features/auth/store.js";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Modal from "../components/ui/Modal.jsx";
import AuthPageLayout from "../components/layout/AuthPageLayout.jsx";
import useLoginForm from "../hooks/useLoginForm.js";
import LoginFormFields, { LoginSubmitButton, AuthCardHeader } from "../components/auth/LoginFormFields.jsx";
import { FaSignInAlt, FaGoogle, FaUserCircle } from "react-icons/fa";
import { redirectByRole } from "../utils/redirectByRole.js";

function Login() {
  const router = useRouter();
  const { googleAuth, completeGoogleRedirect } = useAuthStore();
  const { form, loading, modal, showModal, closeModal, handleLogin } = useLoginForm();
  const { register, formState: { errors } } = form;
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (sessionStorage.getItem("googleRedirect") === "true") {
      setGoogleLoading(true);
    }
    
    (async () => {
      try {
        const user = await completeGoogleRedirect();
        if (isMounted && user) {
          sessionStorage.removeItem("googleRedirect");
          redirectByRole(user.role, (to) => router.replace(to));
        } else if (isMounted) {
          setGoogleLoading(false);
          sessionStorage.removeItem("googleRedirect");
        }
      } catch (error) {
        if (isMounted) {
          setGoogleLoading(false);
          sessionStorage.removeItem("googleRedirect");
          const errorMessage = error.response?.data?.message || error.message || "Google login failed. Please try again.";
          showModal("error", "Google Login Failed", errorMessage);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [completeGoogleRedirect, router, showModal]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    sessionStorage.setItem("googleRedirect", "true");
    try {
      await googleAuth();
    } catch (error) {
      sessionStorage.removeItem("googleRedirect");
      const errorMessage = error.response?.data?.message || error.message || "Google login failed. Please try again.";
      showModal("error", "Google Login Failed", errorMessage);
      setGoogleLoading(false);
    }
  };

  return (
    <AuthPageLayout backLabel="Back to Home">
      <div className={cn(card, "p-8", "shadow-2xl")}>
        <AuthCardHeader
          icon={FaUserCircle}
          title="Welcome Back"
          subtitle="Sign in to your Gradewise AI account"
        />

        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className={cn(btn.google, "mb-6", "disabled:opacity-50", "disabled:cursor-not-allowed")}
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
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className={cn("px-4", "bg-card", "text-muted-foreground", "font-semibold", "uppercase", "tracking-widest")}>
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
            <p className={cn("text-sm", "text-muted-foreground")}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-teal-400 hover:text-teal-300 font-medium transition-colors duration-150 cursor-pointer">
                Create one here
              </Link>
            </p>
          </div>
          <div className="text-center pt-4 border-t border-border">
            <Link href="/forgot-password" className="text-teal-400 hover:text-teal-300 font-medium text-sm transition-colors duration-150 cursor-pointer">
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
