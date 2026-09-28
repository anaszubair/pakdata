// Sends form submissions to the shared PHP mail service (same endpoint as the
// Quran Majeed website), so the site stays fully static.
// The service only accepts browser requests from origins on its CORS allowlist.
import { mountRecaptcha } from './recaptcha';

export const MAIL_SERVICE_URL =
  import.meta.env.PUBLIC_MAIL_SERVICE_URL || 'https://pakdata.com/mail-service.php';

const EMAIL_HEADER = 'Pakdata Website <support@pakdata.com>';

export type MailPayload = {
  name: string;
  email: string;
  subject: string;
  /** Shown in front of the subject by the mail service, e.g. "Support". */
  subjectPrefix: string;
  message: string;
};

type MailFormOptions = {
  form: HTMLFormElement;
  button: HTMLButtonElement;
  /** Address for the mailto fallback when the service cannot be reached. */
  fallbackEmail: string;
  buildPayload: () => MailPayload;
  onSuccess: (payload: MailPayload) => void;
};

const openEmailDraft = (to: string, { name, email, subject, message }: MailPayload) => {
  const body = [`Name: ${name}`, `Email: ${email}`, '', message].join('\n');
  window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

/**
 * Wires a form to the mail service: honeypot and timing spam guard, reCAPTCHA,
 * and a mailto fallback on network failure. Messages come from the form's
 * data-recaptcha-msg, data-rejected-msg and data-network-msg attributes.
 */
export const setupMailForm = ({ form, button, fallbackEmail, buildPayload, onSuccess }: MailFormOptions) => {
  // ClientRouter swaps in a new form element on each visit; wire each one once.
  if (form.dataset.ready === 'true') return;
  form.dataset.ready = 'true';

  const formReadyAt = Date.now();
  const recaptchaContainer = form.querySelector('[data-recaptcha]');
  const recaptcha = recaptchaContainer instanceof HTMLElement ? mountRecaptcha(recaptchaContainer) : null;
  const buttonLabel = button.textContent;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = buildPayload();

    // Spam guard: bots fill the hidden "website" field or submit within seconds.
    const honeypot = form.elements.namedItem('website');
    if ((honeypot instanceof HTMLInputElement && honeypot.value) || Date.now() - formReadyAt < 3000) {
      form.reset();
      onSuccess(payload);
      return;
    }

    const recaptchaToken = recaptcha?.getToken() ?? '';
    if (recaptcha && !recaptchaToken) {
      alert(form.dataset.recaptchaMsg || 'Please tick "I\'m not a robot" before sending.');
      return;
    }

    button.disabled = true;
    button.textContent = form.dataset.sendingMsg || 'Sending...';

    try {
      const redirectUrl = new URL(window.location.href);
      redirectUrl.searchParams.delete('status');

      const response = await fetch(MAIL_SERVICE_URL, {
        method: 'POST',
        // Accept: application/json asks the mail service for a JSON reply
        // instead of a redirect, so success and errors can be told apart.
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: new URLSearchParams({
          ...payload,
          emailHeader: EMAIL_HEADER,
          redirectUrl: redirectUrl.toString(),
          'g-recaptcha-response': recaptchaToken,
        }),
        redirect: 'manual',
      });
      const result = await response.json().catch(() => null);

      // 4xx: the service rejected the request (security check, missing
      // fields). Show its reason; the email fallback would not help.
      if (response.status >= 400 && response.status < 500) {
        alert(result?.message || form.dataset.rejectedMsg || 'Your message could not be sent. Please check the form and try again.');
        return;
      }

      if (!response.ok && response.type !== 'opaqueredirect') {
        throw new Error(result?.message || 'Mail service error');
      }

      form.reset();
      onSuccess(payload);
    } catch {
      openEmailDraft(fallbackEmail, payload);
      alert(form.dataset.networkMsg || 'We could not reach the mail service, so your email app has been opened instead.');
    } finally {
      // A token works only once, so every attempt needs a fresh tick.
      recaptcha?.reset();
      button.disabled = false;
      button.textContent = buttonLabel;
    }
  });
};
