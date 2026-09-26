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
import toast from "react-hot-toast";
import { executeGoogleAuthBootstrap, clearPartialSession, bootstrapAppData } from "@/features/auth/bootstrap.js";
import { googleAuthApi } from "@/features/auth/api.js";
import { auth } from "@/config/firebase.js";
import { getRedirectResult } from "firebase/auth";
import { getDestinationRoute } from "../utils/redirectByRole.js";

function Login() {
  const router = useRouter();
  const { form, loading, modal, showModal, closeModal, handleLogin } = useLoginForm();
  const { register, formState: { errors } } = form;
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      try {
        if (!auth) return;
        const result = await getRedirectResult(auth);
        if (!result?.user) return;

        if (isMounted) {
          setGoogleLoading(true);
        }

        const idToken = await result.user.getIdToken();
        const authResponse = await googleAuthApi({ idToken });
        const user = authResponse.data?.user;
        if (!user) throw new Error("Failed to authenticate session with server.");

        useAuthStore.setState({ user });
        const destination = getDestinationRoute(user.role);
        if (router?.prefetch) router.prefetch(destination);

        await bootstrapAppData(user);

        if (isMounted) {
          router.replace(destination);
        }
      } catch (error) {
        console.error("Google Redirect Bootstrap failed:", error);
        await clearPartialSession();
        if (isMounted) {
          setGoogleLoading(false);
          const errorMessage =
            error.response?.data?.message || error.message || "Google sign-in failed. Please try again.";
          showModal("error", "Google Sign-In Failed", errorMessage);
          toast.error(errorMessage);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [router, showModal]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    try {
      await executeGoogleAuthBootstrap({
        mode: "popup",
        router,
      });
    } catch (error) {
      console.error("Google Auth Bootstrap failed:", error);
      await clearPartialSession();
      setGoogleLoading(false);
      const errorMessage =
        error.code === "auth/popup-closed-by-user"
          ? "Google sign-in was cancelled."
          : error.response?.data?.message || error.message || "Failed to sign in with Google. Please try again.";
      showModal("error", "Google Sign-In Failed", errorMessage);
      toast.error(errorMessage);
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
