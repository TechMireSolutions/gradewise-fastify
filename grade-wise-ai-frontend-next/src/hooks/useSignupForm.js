"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/features/auth/store.js";
import useModal from "@/hooks/useModal.js";
import { getCaptchaToken } from "@/config/captcha.js";
import { redirectByRole } from "@/utils/redirectByRole.js";
import useRecaptchaInit from "@/hooks/useRecaptchaInit.js";
import { signupSchema } from "@/schemas/authSchemas.js";
import { parseZodFieldErrors } from "@/utils/parseZodFieldErrors.js";

export default function useSignupForm() {
  const router = useRouter();
  const { signup, googleAuth, completeGoogleRedirect } = useAuthStore();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { modal, showModal, closeModal } = useModal();

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "dummy-key";
  useRecaptchaInit(siteKey);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const user = await completeGoogleRedirect();
        if (isMounted && user) {
          redirectByRole(user.role, (to) => router.replace(to));
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage =
            error.response?.data?.message || error.message || "Google signup failed. Please try again.";
          showModal("error", "Google Signup Failed", errorMessage);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [completeGoogleRedirect, router, showModal]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrors({});

      try {
        signupSchema.parse(formData);
        const captchaToken = await getCaptchaToken(siteKey, "signup");
        const response = await signup({ ...formData, captchaToken });
        showModal("success", "Registration Successful!", response.message);
        setFormData({ name: "", email: "", password: "" });
        setTimeout(() => router.push("/login"), 2000);
      } catch (error) {
        const fieldErrors = parseZodFieldErrors(error);
        if (fieldErrors) {
          setErrors(fieldErrors);
          const firstKey = Object.keys(fieldErrors)[0];
          if (firstKey) {
            const el =
              document.getElementById(firstKey) || document.getElementById(`signup-${firstKey}`);
            el?.focus();
          }
        } else {
          const errorMessage =
            error.response?.data?.message || error.message || "Registration failed. Please try again.";
          showModal("error", "Registration Failed", errorMessage);
        }
      } finally {
        setLoading(false);
      }
    },
    [formData, siteKey, signup, router, showModal]
  );

  const handleGoogleSignup = useCallback(async () => {
    setGoogleLoading(true);
    try {
      await getCaptchaToken(siteKey, "google_signup");
      const user = await googleAuth();
      redirectByRole(user.role, (to) => router.replace(to));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Google signup failed. Please try again.";
      showModal("error", "Google Signup Failed", errorMessage);
      setGoogleLoading(false);
    }
  }, [siteKey, googleAuth, router, showModal]);

  return {
    formData,
    errors,
    loading,
    googleLoading,
    handleChange,
    handleSubmit,
    handleGoogleSignup,
    modal,
    closeModal,
  };
}
