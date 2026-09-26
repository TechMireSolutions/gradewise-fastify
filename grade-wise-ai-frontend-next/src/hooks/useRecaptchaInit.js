// hooks/useRecaptchaInit.js
import { useEffect } from "react";
import { loadRecaptcha } from "../config/captcha";

export default function useRecaptchaInit(siteKey) {
  useEffect(() => {
    if (siteKey && siteKey !== "dummy-key" && siteKey !== "undefined") {
      loadRecaptcha(siteKey).catch(() => {});
    }
  }, [siteKey]);
}
