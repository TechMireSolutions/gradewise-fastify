export const loadRecaptcha = (siteKey) => {
  return new Promise((resolve) => {
    if (!siteKey || siteKey === 'undefined' || siteKey === 'dummy-key') {
      return resolve();
    }

    if (window.recaptchaLoaded) return resolve();

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.onload = () => {
      window.recaptchaLoaded = true;

      // HIDE BADGE AFTER LOAD
      const badge = document.querySelector('.grecaptcha-badge');
      if (badge) badge.style.visibility = 'hidden';

      resolve();
    };
    script.onerror = () => {
      resolve(); // Resolve anyway to not block the app
    };
    document.head.appendChild(script);
  });
};

export const getCaptchaToken = (siteKey, action) => {
  return new Promise((resolve) => {
    if (!siteKey || siteKey === 'undefined' || siteKey === 'dummy-key') {
      return resolve("dummy-captcha-token");
    }

    if (!window.grecaptcha) {
      return resolve("dummy-captcha-token");
    }

    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(siteKey, { action })
        .catch(() => {
          resolve("dummy-captcha-token");
        });
    });
  });
};