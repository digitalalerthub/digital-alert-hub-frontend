export const RECAPTCHA_SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() || "";

export const isRecaptchaEnabled = Boolean(RECAPTCHA_SITE_KEY);

interface GrecaptchaApi {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: GrecaptchaApi;
    __recaptchaScriptPromise?: Promise<void>;
  }
}

const RECAPTCHA_SCRIPT_ID = "google-recaptcha-v3-script";

const loadRecaptchaScript = (): Promise<void> => {
  if (typeof window === "undefined" || !RECAPTCHA_SITE_KEY) {
    return Promise.resolve();
  }

  if (window.grecaptcha) {
    return Promise.resolve();
  }

  if (window.__recaptchaScriptPromise) {
    return window.__recaptchaScriptPromise;
  }

  window.__recaptchaScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(
      RECAPTCHA_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("No se pudo cargar reCAPTCHA v3.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(
      RECAPTCHA_SITE_KEY
    )}&hl=es`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("No se pudo cargar reCAPTCHA v3."));
    document.head.appendChild(script);
  });

  return window.__recaptchaScriptPromise;
};

export const getRecaptchaToken = async (
  action: "login" | "register"
): Promise<string | null> => {
  if (!isRecaptchaEnabled) {
    return null;
  }

  await loadRecaptchaScript();

  return new Promise((resolve, reject) => {
    window.grecaptcha?.ready(() => {
      window.grecaptcha
        ?.execute(RECAPTCHA_SITE_KEY, { action })
        .then(resolve)
        .catch(() => reject(new Error("No se pudo validar reCAPTCHA v3.")));
    });
  });
};
