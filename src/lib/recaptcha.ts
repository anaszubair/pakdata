// Google reCAPTCHA v2 checkbox, shared by the contact, support and career forms.
// The mail service (pakdata.com/mail-service.php) verifies the token with
// Google using the secret key, which lives only on that server.

type Grecaptcha = {
  render: (container: HTMLElement, options: { sitekey: string; theme?: 'light' | 'dark' }) => number;
  getResponse: (widgetId?: number) => string;
  reset: (widgetId?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
    pdmsRecaptchaReady?: () => void;
  }
}

// Same public site key as the Quran Majeed website. The key's domain list in
// the reCAPTCHA admin console must include every host this site is served from.
export const RECAPTCHA_SITE_KEY =
  import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY || '6LfkmlYrAAAAAAM9QMDRaxK_6N7FfvuiPKADozyf';

let apiReady: Promise<Grecaptcha> | undefined;
let apiLang: string | undefined;

// The API script loads once per tab; ClientRouter keeps the window between pages.
// Its language is fixed at load, so a language switch reloads it.
const loadApi = () => {
  const hl = document.documentElement.lang || 'en';
  if (apiReady && apiLang !== hl) {
    apiReady = undefined;
    delete window.grecaptcha;
    delete (window as { ___grecaptcha_cfg?: unknown }).___grecaptcha_cfg;
    document.querySelectorAll('script[src*="recaptcha/"]').forEach((node) => node.remove());
  }
  apiLang = hl;
  apiReady ??= new Promise<Grecaptcha>((resolve, reject) => {
    if (window.grecaptcha?.render) {
      resolve(window.grecaptcha);
      return;
    }
    window.pdmsRecaptchaReady = () =>
      window.grecaptcha ? resolve(window.grecaptcha) : reject(new Error('reCAPTCHA missing'));
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?onload=pdmsRecaptchaReady&render=explicit&hl=${encodeURIComponent(hl)}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      apiReady = undefined;
      reject(new Error('reCAPTCHA failed to load'));
    };
    document.head.appendChild(script);
  });
  return apiReady;
};

export type RecaptchaWidget = {
  /** Token for the ticked checkbox, or an empty string. */
  getToken: () => string;
  /** True when the reCAPTCHA script could not load (blocked or offline). */
  hasFailed: () => boolean;
  reset: () => void;
};

/** Renders the checkbox into `container`. Safe to call on every page visit. */
export const mountRecaptcha = (container: HTMLElement): RecaptchaWidget => {
  let widgetId: number | undefined;
  let api: Grecaptcha | undefined;
  let failed = false;

  loadApi()
    .then((grecaptcha) => {
      api = grecaptcha;
      if (!container.isConnected || container.dataset.recaptchaRendered === 'true') return;
      container.dataset.recaptchaRendered = 'true';
      widgetId = grecaptcha.render(container, { sitekey: RECAPTCHA_SITE_KEY, theme: 'light' });
    })
    .catch(() => {
      failed = true;
      container.textContent =
        container.dataset.failedMsg ||
        'Security check could not load. Please refresh the page or email support@pakdata.com.';
    });

  return {
    getToken: () => (api && widgetId !== undefined ? api.getResponse(widgetId) : ''),
    hasFailed: () => failed,
    reset: () => {
      if (api && widgetId !== undefined) api.reset(widgetId);
    },
  };
};
