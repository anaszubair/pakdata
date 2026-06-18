import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const prerender = false;

const TO_EMAIL = 'anas.zubair@pakdata.com';
const DEFAULT_FROM_EMAIL = 'Pakdata Website <onboarding@resend.dev>';
let localEnvCache: Record<string, string> | null = null;

const formSubjects = {
  contact: 'New Contact Form Submission',
  support: 'New Support Request',
  career: 'New Career Application'
};

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const isEmail = (value: unknown) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const readLocalEnv = () => {
  if (localEnvCache) return localEnvCache;

  localEnvCache = {};
  const envPath = resolve(process.cwd(), '.env');

  if (!existsSync(envPath)) return localEnvCache;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');

    localEnvCache[key] = value;
  }

  return localEnvCache;
};

const getServerEnv = (key: string) =>
  process.env[key] || import.meta.env[key] || readLocalEnv()[key];

const buildHtml = (formType: string, fields: Record<string, unknown>) => {
  const rows = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([key, value]) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#111827;text-transform:capitalize;">${escapeHtml(key.replaceAll('-', ' '))}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#374151;white-space:pre-wrap;">${escapeHtml(value)}</td>
      </tr>
    `)
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;color:#111827;">
      <h2 style="margin:0 0 8px;">${escapeHtml(formSubjects[formType] || 'New Website Form Submission')}</h2>
      <p style="margin:0 0 18px;color:#4b5563;">A new form submission was received from pakdata.com.</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
};

export async function POST({ request }) {
  const apiKey = getServerEnv('RESEND_API_KEY');
  const fromEmail = getServerEnv('RESEND_FROM_EMAIL') || DEFAULT_FROM_EMAIL;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Email service is not configured.' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  const formType = String(payload?.formType || '').trim();
  const fields = payload?.fields || {};

  if (!formSubjects[formType] || typeof fields !== 'object') {
    return new Response(JSON.stringify({ error: 'Invalid form submission.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  const replyTo = isEmail(fields.email) ? String(fields.email) : undefined;
  const subjectDetail = fields.subject || fields.position || fields.app || '';
  const subject = `${formSubjects[formType]}${subjectDetail ? ` - ${subjectDetail}` : ''}`;

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      from: fromEmail,
      to: TO_EMAIL,
      subject,
      html: buildHtml(formType, fields),
      reply_to: replyTo
    })
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    return new Response(JSON.stringify({ error: 'Email failed to send.', details: errorText }), {
      status: 502,
      headers: { 'content-type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}
