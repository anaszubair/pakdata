// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
    adapter: vercel(),
    redirects: {
        '/ur/قرآن-مجید-کے-لیے-عربی-فونٹ/': '/ur/products/arabicfont',
        '/ur/قرآن-ایکسپلورر/': '/ur/projects/quranexplorer',
        '/ur/ايزى-اردو-کی-بورڈ/': '/ur/products/easyurdu',
        '/ur/امیجن/': '/ur/projects/imagine',
        '/ur/کتابی/': '/ur/products/kitabi',
        '/ur/نیشنل-ایلیئن-ریجسٹریشن-ایتھاریٹی-nara/': '/ur/projects/nara-national-alien-registration-authority',
        '/ur/تعارف/': '/ur/about-us',
        '/ur/قرآن-پرنٹنگ-کامپلیکس-پروجیکٹ/': '/ur/projects/quran-printing-complex-project',
        '/ur/قرآن-پاک/': '/ur/products/quran-pak',
        '/ur/قرآن-آڈیو/': '/ur/quran-audio',
        '/ur/قرآن-مجید/': '/ur/products/quran-majeed'
    },
});
