import { useEffect, useRef, useState } from "react";
import { RECAPTCHA_SITE_KEY } from "../../config/recaptcha";

interface ReCaptchaWidgetProps {
  onVerify: (token: string | null) => void;
  resetSignal: number;
}

interface GrecaptchaRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
}

interface GrecaptchaApi {
  ready: (callback: () => void) => void;
  render: (
    container: HTMLElement,
    options: GrecaptchaRenderOptions
  ) => number;
  reset: (widgetId?: number) => void;
}

declare global {
  interface Window {
    grecaptcha?: GrecaptchaApi;
    __recaptchaScriptPromise?: Promise<void>;
  }
}

const RECAPTCHA_SCRIPT_ID = "google-recaptcha-script";
const RECAPTCHA_SCRIPT_SRC =
  "https://www.google.com/recaptcha/api.js?render=explicit&hl=es";

const loadRecaptchaScript = (): Promise<void> => {
  if (typeof window === "undefined") {
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
        () => reject(new Error("No se pudo cargar reCAPTCHA.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = RECAPTCHA_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("No se pudo cargar reCAPTCHA."));
    document.head.appendChild(script);
  });

  return window.__recaptchaScriptPromise;
};

const ReCaptchaWidget = ({
  onVerify,
  resetSignal,
}: ReCaptchaWidgetProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      return;
    }

    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !window.grecaptcha || !containerRef.current) {
        return;
      }

      if (widgetIdRef.current !== null) {
        return;
      }

      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: RECAPTCHA_SITE_KEY,
        callback: (token: string) => {
          onVerify(token);
          setLoadError(null);
        },
        "expired-callback": () => onVerify(null),
        "error-callback": () => onVerify(null),
      });
    };

    loadRecaptchaScript()
      .then(() => {
        if (!isMounted) {
          return;
        }

        window.grecaptcha?.ready(renderWidget);
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        onVerify(null);
        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar reCAPTCHA."
        );
      });

    return () => {
      isMounted = false;
    };
  }, [onVerify]);

  useEffect(() => {
    if (widgetIdRef.current === null || !window.grecaptcha) {
      return;
    }

    window.grecaptcha.reset(widgetIdRef.current);
    onVerify(null);
  }, [resetSignal, onVerify]);

  if (!RECAPTCHA_SITE_KEY) {
    return null;
  }

  return (
    <div className="d-flex flex-column align-items-center">
      <div ref={containerRef} />
      {loadError ? (
        <small className="text-danger text-center mt-2">{loadError}</small>
      ) : null}
    </div>
  );
};

export default ReCaptchaWidget;
