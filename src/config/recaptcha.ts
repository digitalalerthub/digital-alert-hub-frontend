export const RECAPTCHA_SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() || "";

export const isRecaptchaEnabled = Boolean(RECAPTCHA_SITE_KEY);
