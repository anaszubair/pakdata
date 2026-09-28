# Pakdata Website

Static website for Pakistan Data Management Services (https://pakdata.com), built with Astro. Pages are available in English, Urdu (`/ur`) and Arabic (`/ar`).

## Commands

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `npm install`     | Install dependencies                        |
| `npm run dev`     | Start the dev server at `localhost:4321`    |
| `npm run build`   | Build the static site to `./dist/`          |
| `npm run preview` | Preview the build locally                   |

## Deployment

`npm run build` outputs plain HTML, CSS and JS in `dist/`. No Node server is needed. Upload the contents of `dist/` to any static host.

- **Apache / Plesk**: the build writes `dist/.htaccess` with 301 redirects, trailing-slash handling and the 404 page.
- **Vercel**: `vercel.json` holds the same redirects.

## Forms

The contact, support and career forms post to the shared PHP mail service at `https://pakdata.com/mail-service.php` (the same endpoint as the Quran Majeed website), with Google reCAPTCHA v2. See `src/lib/mail-service.ts` and `src/lib/recaptcha.ts`.

- The mail service only accepts browser requests from origins on its CORS allowlist.
- The reCAPTCHA site key must list every domain the site is served from.
- Override the endpoint or site key with `PUBLIC_MAIL_SERVICE_URL` and `PUBLIC_RECAPTCHA_SITE_KEY` (see `.env.example`).

## Redirects

`redirects.mjs` is the single list of legacy and duplicate-URL redirects. After changing it, run:

```sh
node scripts/sync-vercel-redirects.mjs
```

The build warns when `vercel.json` is out of date.

## Translations

Shared strings live in `src/i18n/{en,ur,ar}.json`. Page-specific copy is kept in a `copy = { en, ur, ar }[lang]` object inside each page.
