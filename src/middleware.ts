import { defineMiddleware } from 'astro:middleware';

const legacyUrduRoutes: Record<string, string> = {
  'قرآن-مجید': '/ur/products/quran-majeed',
  'قرآن-آڈیو': '/ur/quran-audio',
  'قرآن-پاک': '/ur/products/quran-pak',
  'قرآن-پرنٹنگ-کامپلیکس-پروجیکٹ': '/ur/projects/quran-printing-complex-project',
  'تعارف': '/ur/about-us',
  'نیشنل-ایلیئن-ریجسٹریشن-ایتھاریٹی-nara': '/ur/projects/nara-national-alien-registration-authority',
  'کتابی': '/ur/products/kitabi',
  'امیجن': '/ur/projects/imagine',
  'ايزى-اردو-کی-بورڈ': '/ur/products/easyurdu',
  'قرآن-ایکسپلورر': '/ur/projects/quranexplorer',
  'قرآن-مجید-کے-لیے-عربی-فونٹ': '/ur/products/arabicfont',
  'ایزی-سندھی-کی-بورڈ': '/ur/products/easysindhi',
};

function decodePath(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export const onRequest = defineMiddleware((context, next) => {
  const pathname = decodePath(context.url.pathname).replace(/\/$/, '');
  const legacyPrefix = '/ur/';

  if (pathname.startsWith(legacyPrefix)) {
    const slug = pathname.slice(legacyPrefix.length);
    const destination = legacyUrduRoutes[slug];

    if (destination) {
      return context.redirect(destination, 301);
    }
  }

  return next();
});
