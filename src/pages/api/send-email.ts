import { existsSync, readFileSync } from 'node:fs';
import net from 'node:net';
import { resolve } from 'node:path';
import tls from 'node:tls';
import type { APIRoute } from 'astro';

export const prerender = false;

const DEFAULT_TO_EMAIL = 'anas.zubair@pakdata.com';
const DEFAULT_FROM_EMAIL = 'Pakdata Website <no-reply@pakdata.com>';
const DEFAULT_TIMEOUT_MS = 15_000;
let localEnvCache: Record<string, string> | null = null;

const formSubjects: Record<string, string> = {
  contact: 'New Contact Form Submission',
  support: 'New Support Request',
  career: 'New Career Application'
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  fromEmail: string;
  toEmail: string;
};

type EmailPayload = {
  formType?: unknown;
  fields?: Record<string, unknown>;
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

const getSmtpConfig = (): SmtpConfig | null => {
  const host = getServerEnv('SMTP_HOST');
  if (!host) return null;

  const port = Number(getServerEnv('SMTP_PORT') || '587');
  const secure = getServerEnv('SMTP_SECURE') === 'true' || port === 465;

  return {
    host,
    port,
    secure,
    user: getServerEnv('SMTP_USER'),
    pass: getServerEnv('SMTP_PASS'),
    fromEmail: getServerEnv('SMTP_FROM_EMAIL') || DEFAULT_FROM_EMAIL,
    toEmail: getServerEnv('CONTACT_TO_EMAIL') || DEFAULT_TO_EMAIL
  };
};

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

const buildText = (formType: string, fields: Record<string, unknown>) => {
  const rows = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([key, value]) => `${key.replaceAll('-', ' ')}: ${String(value)}`)
    .join('\n');

  return `${formSubjects[formType] || 'New Website Form Submission'}\n\n${rows}`;
};

const parseEmailAddress = (value: string) => {
  const match = value.match(/<([^<>@\s]+@[^<>@\s]+\.[^<>@\s]+)>/);
  return match?.[1] || value.trim();
};

const encodeHeader = (value: string) =>
  value.replace(/[\r\n]+/g, ' ').replace(/[^\x20-\x7E]/g, (char) => {
    return `=?UTF-8?B?${Buffer.from(char).toString('base64')}?=`;
  });

const dotStuff = (value: string) =>
  value.replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..');

const buildMimeMessage = ({
  from,
  to,
  replyTo,
  subject,
  html,
  text
}: {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}) => {
  const boundary = `pakdata-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const headers = [
    `From: ${encodeHeader(from)}`,
    `To: ${encodeHeader(to)}`,
    replyTo ? `Reply-To: ${encodeHeader(replyTo)}` : '',
    `Subject: ${encodeHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`
  ].filter(Boolean);

  return [
    ...headers,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    text,
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    html,
    `--${boundary}--`,
    ''
  ].join('\r\n');
};

const createSocket = (config: SmtpConfig) =>
  new Promise<net.Socket>((resolveSocket, rejectSocket) => {
    const onError = (error: Error) => rejectSocket(error);
    const socket = config.secure
      ? tls.connect(config.port, config.host, { servername: config.host })
      : net.connect(config.port, config.host);

    socket.setTimeout(DEFAULT_TIMEOUT_MS, () => socket.destroy(new Error('SMTP connection timed out.')));
    socket.once('error', onError);
    socket.once(config.secure ? 'secureConnect' : 'connect', () => {
      socket.off('error', onError);
      resolveSocket(socket);
    });
  });

const createResponseReader = (socket: net.Socket) => {
  let buffer = '';

  return () =>
    new Promise<string>((resolveResponse, rejectResponse) => {
      const cleanup = () => {
        socket.off('data', onData);
        socket.off('error', onError);
        socket.off('timeout', onTimeout);
      };

      const onError = (error: Error) => {
        cleanup();
        rejectResponse(error);
      };

      const onTimeout = () => {
        cleanup();
        rejectResponse(new Error('SMTP response timed out.'));
      };

      const onData = (data: Buffer) => {
        buffer += data.toString('utf8');
        const lines = buffer.split(/\r?\n/);
        const lastLine = lines.findLast((line) => /^\d{3} /.test(line));

        if (lastLine) {
          const endIndex = buffer.indexOf(lastLine) + lastLine.length;
          const response = buffer.slice(0, endIndex);
          buffer = buffer.slice(endIndex).replace(/^\r?\n/, '');
          cleanup();
          resolveResponse(response);
        }
      };

      socket.on('data', onData);
      socket.once('error', onError);
      socket.once('timeout', onTimeout);
      onData(Buffer.alloc(0));
    });
};

const assertCode = (response: string, validCodes: number[]) => {
  const code = Number(response.slice(0, 3));
  if (!validCodes.includes(code)) {
    throw new Error(`Unexpected SMTP response: ${response.trim()}`);
  }
};

const sendEmail = async ({
  config,
  subject,
  html,
  text,
  replyTo
}: {
  config: SmtpConfig;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) => {
  let socket = await createSocket(config);
  let readResponse = createResponseReader(socket);

  const command = async (line: string, validCodes: number[]) => {
    socket.write(`${line}\r\n`);
    const response = await readResponse();
    assertCode(response, validCodes);
    return response;
  };

  try {
    assertCode(await readResponse(), [220]);
    await command(`EHLO ${config.host}`, [250]);

    if (!config.secure) {
      await command('STARTTLS', [220]);
      socket = tls.connect({
        socket,
        servername: config.host
      });
      await new Promise<void>((resolveSecure, rejectSecure) => {
        socket.once('secureConnect', resolveSecure);
        socket.once('error', rejectSecure);
      });
      readResponse = createResponseReader(socket);
      await command(`EHLO ${config.host}`, [250]);
    }

    if (config.user && config.pass) {
      const auth = Buffer.from(`\0${config.user}\0${config.pass}`).toString('base64');
      await command(`AUTH PLAIN ${auth}`, [235]);
    }

    const envelopeFrom = parseEmailAddress(config.fromEmail);
    const recipients = config.toEmail.split(',').map((email) => parseEmailAddress(email)).filter(Boolean);
    const message = buildMimeMessage({
      from: config.fromEmail,
      to: config.toEmail,
      replyTo,
      subject,
      html,
      text
    });

    await command(`MAIL FROM:<${envelopeFrom}>`, [250]);

    for (const recipient of recipients) {
      await command(`RCPT TO:<${recipient}>`, [250, 251]);
    }

    await command('DATA', [354]);
    socket.write(`${dotStuff(message)}\r\n.\r\n`);
    assertCode(await readResponse(), [250]);
    await command('QUIT', [221]);
  } finally {
    socket.end();
  }
};

export const POST: APIRoute = async ({ request }) => {
  const config = getSmtpConfig();

  if (!config) {
    return new Response(JSON.stringify({ error: 'Email service is not configured.' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }

  let payload: EmailPayload;

  try {
    payload = (await request.json()) as EmailPayload;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  const formType = String(payload?.formType || '').trim();
  const fields = payload.fields || {};

  if (!formSubjects[formType] || typeof fields !== 'object') {
    return new Response(JSON.stringify({ error: 'Invalid form submission.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  if (!isEmail(fields.email)) {
    return new Response(JSON.stringify({ error: 'A valid email address is required.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  const replyTo = String(fields.email);
  const subjectDetail = fields.subject || fields.position || fields.app || '';
  const subject = `${formSubjects[formType]}${subjectDetail ? ` - ${subjectDetail}` : ''}`;

  try {
    await sendEmail({
      config,
      subject,
      html: buildHtml(formType, fields),
      text: buildText(formType, fields),
      replyTo
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Email failed to send.',
        details: error instanceof Error ? error.message : 'Unknown SMTP error.'
      }),
      {
        status: 502,
        headers: { 'content-type': 'application/json' }
      }
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
};
