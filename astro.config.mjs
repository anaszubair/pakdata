// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { astroRedirects, buildHtaccess, buildVercelRedirects } from './redirects.mjs';

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
                'material-symbols': ['add', 'arrow-forward', 'auto-awesome', 'bug-report', 'build', 'check', 'check-circle', 'chevron-left', 'chevron-right', 'code', 'credit-card', 'design-services', 'handshake', 'history-edu', 'lightbulb', 'notifications', 'public', 'rocket-launch', 'schedule', 'shield', 'star', 'support-agent', 'target', 'trending-up', 'trophy', 'visibility'],
            },
        }),
        legacyRedirectRules(),
        sitemap({
            filter: (page) => !/\/faq-page\/?$/.test(page),
        }),
    ],
    redirects: astroRedirects,
});
