export const prerender = false;

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

export function GET({ params }: { params: { legacySlug?: string } }) {
  const slug = decodePath(params.legacySlug ?? '').replace(/\/$/, '');
  const destination = legacyUrduRoutes[slug];

  if (destination) {
    return new Response(null, {
      status: 301,
      headers: {
        Location: destination,
      },
    });
  }

  return new Response(null, { status: 404 });
}
