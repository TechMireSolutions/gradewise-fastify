import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuthStore from "@/features/auth/store.js";
import useRecaptchaInit from "./useRecaptchaInit.js";
import useModal from "./useModal.js";
import { getCaptchaToken } from "../config/captcha.js";
import { loginSchema } from "../scheema/authSchemas.js";
import { redirectByRole } from "../utils/redirectByRole.js";

export default function useLoginForm({
  allowedRoles = null,
  captchaAction = "login",
  onAccessDenied = null,
  successTitle = "Login Successful!",
  successMessage = (name) => `Welcome back, ${name}!`,
  redirectDelay = 1500,
} = {}) {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { modal, showModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "dummy-key";
  useRecaptchaInit(siteKey);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = form.handleSubmit(async (data) => {
    setLoading(true);
    try {
      const captchaToken = await getCaptchaToken(siteKey, captchaAction);
      const response = await login({ ...data, captchaToken });

      if (allowedRoles && !allowedRoles.includes(response.role)) {
        useAuthStore.getState().logout();
        const message = onAccessDenied?.(response.role)
          ?? "Unauthorized: You do not have access to this portal.";
        showModal("error", "Access Denied", message);
        return;
      }

      showModal("success", successTitle, successMessage(response.name));
      setTimeout(() => redirectByRole(response.role, navigate), redirectDelay);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      showModal("error", "Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  });

  return { form, loading, modal, showModal, closeModal, handleLogin, siteKey };
}
