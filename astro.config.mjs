// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

const legacyRedirectPairs = [
    ['/ur/قرآن-مجید-کے-لیے-عربی-فونٹ/', '/ur/products/arabicfont'],
    ['/ur/قرآن-ایکسپلورر/', '/ur/projects/quranexplorer'],
    ['/ur/ايزى-اردو-کی-بورڈ/', '/ur/products/easyurdu'],
    ['/ur/امیجن/', '/ur/projects/imagine'],
    ['/ur/کتابی/', '/ur/products/kitabi'],
    ['/ur/نیشنل-ایلیئن-ریجسٹریشن-ایتھاریٹی-nara/', '/ur/projects/nara-national-alien-registration-authority'],
    ['/ur/تعارف/', '/ur/about-us'],
    ['/ur/قرآن-پرنٹنگ-کامپلیکس-پروجیکٹ/', '/ur/projects/quran-printing-complex-project'],
    ['/ur/قرآن-پاک/', '/ur/products/quran-pak'],
    ['/ur/قرآن-آڈیو/', '/ur/quran-audio'],
    ['/ur/قرآن-مجید/', '/ur/products/quran-majeed'],
    ['/ufaqs/', '/faqs'],
    ['/ufaqs/how-can-i-change-adhan-alarm-notification/', '/faqs'],
    ['/ufaqs/i-dont-have-credit-card-or-unable-to-own-credit-card-can-i-send-payment-to-your-bank-account-or-any-other-means-for-purchasing-the-full-version/', '/faqs'],
    ['/ufaqs/i-purchased-full-version-on-my-iphone-but-now-it-is-showing-free-version-only-how-to-fix-this/', '/faqs'],
    ['/ufaqs/how-to-pay-using-easy-paisa/', '/faqs'],
    ['/ufaqs/how-to-add-a-bookmark/', '/faqs'],
    ['/ufaqs/adhan-notifications-are-not-in-time-in-my-device/', '/faqs'],
    ['/faq/', '/faqs'],
    ['/certificate/', '/certificates'],
    ['/products/quran-tv/', '/products#quran-tv'],
];

const legacyRedirects = Object.fromEntries(legacyRedirectPairs);

export default defineConfig({
    site: 'https://pakdata-pearl.vercel.app',
    trailingSlash: 'never',
    adapter: vercel(),
    integrations: [
        icon({
            include: {
                'material-symbols': ['add', 'arrow-forward', 'auto-awesome', 'bug-report', 'build', 'check', 'check-circle', 'chevron-left', 'chevron-right', 'code', 'credit-card', 'design-services', 'handshake', 'history-edu', 'lightbulb', 'notifications', 'public', 'rocket-launch', 'schedule', 'shield', 'star', 'support-agent', 'target', 'trending-up', 'trophy', 'visibility'],
            },
        }),
        sitemap({
            filter: (page) => !page.includes('/api/') && !page.includes('/faq-page/'),
        }),
    ],
    redirects: legacyRedirects,
});
