import { cn } from "@/lib/cn.js";
import { btn, card } from "@/lib/ui.js";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/features/auth/store.js";
import Modal from "../components/ui/Modal.jsx";
import AuthPageLayout from "../components/layout/AuthPageLayout.jsx";
import useLoginForm from "../hooks/useLoginForm.js";
import LoginFormFields, { LoginSubmitButton, AuthCardHeader } from "../components/auth/LoginFormFields.jsx";
import { FaSignInAlt, FaGoogle, FaUserCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import { executeGoogleAuthBootstrap, clearPartialSession, bootstrapAppData } from "@/features/auth/bootstrap.js";
import { googleAuthApi, meApi } from "@/features/auth/api.js";
import { auth, googleProvider } from "@/config/firebase.js";
import { getRedirectResult } from "firebase/auth";
import { getDestinationRoute } from "../utils/redirectByRole.js";
import RememberedAccountCard from "../components/auth/RememberedAccountCard.jsx";
import {
  getRememberedAccounts,
  saveRememberedAccount,
  removeRememberedAccount,
} from "@/features/auth/rememberedAccounts.js";

function Login() {
  const router = useRouter();
  const { form, loading, modal, showModal, closeModal, handleLogin } = useLoginForm();
  const { register, formState: { errors } } = form;
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberedAccounts, setRememberedAccounts] = useState([]);

  useEffect(() => {
    setRememberedAccounts(getRememberedAccounts());
  }, []);

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

        if (result?.user?.photoURL && !user.avatar) {
          user.avatar = result.user.photoURL;
        }

        useAuthStore.setState({ user });
        saveRememberedAccount(user);
        if (isMounted) {
          setRememberedAccounts(getRememberedAccounts());
        }

        const destination = getDestinationRoute(user.role);
        if (router?.prefetch) router.prefetch(destination);

        if (isMounted) {
          router.replace(destination);
        }

        bootstrapAppData(user).catch((err) => {
          console.warn("Background data prefetch warning:", err);
        });
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
      if (googleProvider) {
        googleProvider.setCustomParameters({ prompt: "select_account" });
      }

      const user = await executeGoogleAuthBootstrap({
        mode: "popup",
        router,
      });

      if (user) {
        saveRememberedAccount(user);
        setRememberedAccounts(getRememberedAccounts());
      }
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

  const handleSelectAccount = async (account) => {
    setGoogleLoading(true);

    try {
      // 1. Instant check: is user session already active in memory?
      const activeUser = useAuthStore.getState().user;
      if (
        activeUser?.email?.toLowerCase() === account.email.toLowerCase() &&
        activeUser?.role
      ) {
        saveRememberedAccount(activeUser);
        const destination = getDestinationRoute(activeUser.role);
        router.replace(destination);
        return;
      }

      // 2. Check if Fastify server session cookie is still valid
      try {
        const meRes = await meApi();
        const verifiedUser = meRes.data?.user;
        if (
          verifiedUser?.email?.toLowerCase() === account.email.toLowerCase() &&
          verifiedUser?.role
        ) {
          useAuthStore.setState({ user: verifiedUser });
          saveRememberedAccount(verifiedUser);
          const destination = getDestinationRoute(verifiedUser.role);
          router.replace(destination);
          return;
        }
      } catch {
        // Session cookie expired or missing, proceed to Google Auth
      }

      // 3. Trigger Google OAuth with login_hint so it selects this account directly
      if (googleProvider) {
        googleProvider.setCustomParameters({
          login_hint: account.email,
          prompt: "select_account",
        });
      }

      const user = await executeGoogleAuthBootstrap({
        mode: "popup",
        router,
      });

      if (user) {
        saveRememberedAccount(user);
        setRememberedAccounts(getRememberedAccounts());
      }
    } catch (error) {
      console.error("Quick sign-in error:", error);
      await clearPartialSession();
      setGoogleLoading(false);
      const errorMessage =
        error.code === "auth/popup-closed-by-user"
          ? "Google sign-in was cancelled."
          : error.response?.data?.message || error.message || "Failed to sign in. Please try again.";
      showModal("error", "Sign-In Failed", errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRemoveAccount = (email) => {
    const updated = removeRememberedAccount(email);
    setRememberedAccounts(updated);
  };

  return (
    <AuthPageLayout backLabel="Back to Home">
      <div className={cn(card, "p-8", "shadow-2xl")}>
        <AuthCardHeader
          icon={FaUserCircle}
          title="Welcome Back"
          subtitle="Sign in to your Gradewise AI account"
        />

        {rememberedAccounts.length > 0 ? (
          <div className="mb-6 space-y-2.5">
            {rememberedAccounts.map((account) => (
              <RememberedAccountCard
                key={account.email}
                account={account}
                onSelect={handleSelectAccount}
                onRemove={handleRemoveAccount}
                disabled={googleLoading || loading}
              />
            ))}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full text-center text-xs font-medium text-muted-foreground hover:text-indigo-400 py-1 transition-colors cursor-pointer disabled:opacity-50"
            >
              Use another account
            </button>
          </div>
        ) : (
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className={cn(btn.google, "mb-6", "disabled:opacity-50", "disabled:cursor-not-allowed")}
          >
            <FaGoogle className="text-base" />
            <span>Continue with Google</span>
          </button>
        )}

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
