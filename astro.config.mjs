// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { astroRedirects, buildHtaccess, buildVercelRedirects } from './redirects.mjs';

// Build info is computed once per build so every deploy shows a new version.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

function git(command) {
    try {
        return execSync(`git ${command}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch {
        return '';
    }
}

const commit = git('rev-parse --short HEAD') || 'unknown';
const dirty = git('status --porcelain') ? '-dirty' : '';
const buildTime = new Date().toISOString();
const buildInfo = {
    version: pkg.version,
    commit: `${commit}${dirty}`,
    buildTime,
};

// Sitemap lastmod: last git commit date of the page's source file.
// Falls back to the build time for new or uncommitted files.
const lastmodCache = new Map();

function sourceFileFor(pathname) {
    const path = pathname.replace(/^\/(ur|ar)(?=\/|$)/, '').replace(/\/$/, '');
    const candidates = path
        ? [`src/pages/[...lang]${path}.astro`, `src/pages/[...lang]${path}/index.astro`]
        : ['src/pages/[...lang]/index.astro'];
    return candidates.find((file) => existsSync(file));
}

function pageLastmod(url) {
    const file = sourceFileFor(decodeURI(new URL(url).pathname));
    if (!file) return buildTime;
    if (!lastmodCache.has(file)) {
        const changed = git(`status --porcelain -- "${file}"`);
        lastmodCache.set(file, (!changed && git(`log -1 --format=%cI -- "${file}"`)) || buildTime);
    }
    return lastmodCache.get(file);
}

// Writes dist/version.json so the deployed version can be checked with curl.
const buildInfoFile = () => ({
    name: 'build-info-file',
    hooks: {
        'astro:build:done': ({ dir }) => {
            writeFileSync(new URL('version.json', dir), `${JSON.stringify(buildInfo, null, 2)}\n`);
        },
    },
});

// Shortens every sitemap lastmod to a date only (YYYY-MM-DD, Pakistan time), then copies
// the sitemap index to dist/sitemap.xml so the old /sitemap.xml URL keeps working.
// Must run after the sitemap integration.
const toDateOnly = (xml) => xml.replace(/<lastmod>([^<]+)<\/lastmod>/g, (_, iso) =>
    `<lastmod>${new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' })}</lastmod>`);

const sitemapXmlFile = () => ({
    name: 'sitemap-xml-file',
    hooks: {
        'astro:build:done': ({ dir }) => {
            for (const file of readdirSync(dir).filter((name) => /^sitemap-.+\.xml$/.test(name))) {
                const path = new URL(file, dir);
                writeFileSync(path, toDateOnly(readFileSync(path, 'utf8')));
            }
            copyFileSync(new URL('sitemap-index.xml', dir), new URL('sitemap.xml', dir));
        },
    },
});

// Copies the shared PHP mail service (used by pakdata.com and quranmajeed.com)
// into the build, so deploy.sh uploads it with the site.
const mailServiceFile = () => ({
    name: 'mail-service-file',
    hooks: {
        'astro:build:done': ({ dir }) => {
            copyFileSync(new URL('./mail-service.php', import.meta.url), new URL('mail-service.php', dir));
        },
    },
});

// Writes real 301 rules next to the build and checks vercel.json is in sync.
const legacyRedirectRules = () => ({
    name: 'legacy-redirect-rules',
    hooks: {
        'astro:build:done': ({ dir, logger }) => {
            writeFileSync(new URL('.htaccess', dir), buildHtaccess());
            const vercelPath = fileURLToPath(new URL('./vercel.json', import.meta.url));
            const current = JSON.stringify(JSON.parse(readFileSync(vercelPath, 'utf8')).redirects);
            if (current !== JSON.stringify(buildVercelRedirects())) {
                logger.warn('vercel.json redirects are out of date. Run: node scripts/sync-vercel-redirects.mjs');
            }
        },
    },
});

export default defineConfig({
    site: 'https://pakdata.com',
    trailingSlash: 'never',
    integrations: [
        icon({
            include: {
                'material-symbols': ['add', 'arrow-forward', 'auto-awesome', 'bolt-outline', 'bug-report', 'build', 'business-center-outline', 'call-outline', 'check', 'check-circle', 'chevron-left', 'chevron-right', 'code', 'credit-card', 'design-services', 'forum-outline', 'handshake', 'handshake-outline', 'history-edu', 'lightbulb', 'lightbulb-outline', 'location-on-outline', 'mail-outline', 'military-tech-outline', 'notifications', 'open-in-new', 'palette-outline', 'phone-iphone-outline', 'psychology-outline', 'public', 'rocket-launch', 'schedule', 'send-outline', 'settings-outline', 'shield', 'shield-outline', 'smartphone-outline', 'star', 'support-agent', 'target', 'trending-up', 'trophy', 'verified-outline', 'visibility', 'workspace-premium-outline'],
            },
        }),
        legacyRedirectRules(),
        mailServiceFile(),
        buildInfoFile(),
        sitemap({
            filter: (page) => !/\/faq-page\/?$/.test(page),
            serialize: (item) => ({ ...item, lastmod: pageLastmod(item.url) }),
        }),
        sitemapXmlFile(),
    ],
    redirects: astroRedirects,
    vite: {
        define: {
            __BUILD_INFO__: JSON.stringify(buildInfo),
        },
    },
});
