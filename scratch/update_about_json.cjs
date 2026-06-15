const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '../src/i18n');

function updateJson(file, data) {
  const filePath = path.join(i18nDir, file);
  const current = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const updated = { ...current, ...data };
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
}

const en = {
  "about.overview.title": "Connecting Hearts & Minds Through Technology",
  "about.overview.p1": "PDMS began in 1979 as a pioneer in native language computing, developing specialized word processors and layouts for Urdu publishing. Over the years, our technical focus expanded to meet the spiritual needs of Muslims globally.",
  "about.overview.p2": "Today, we maintain the world's most popular Islamic applications, including <strong>Quran Majeed</strong>, <strong>Quran Pak</strong>, and <strong>Quran TV</strong>, alongside regional utilities like the <strong>Easy Urdu Keyboard</strong>. Our products combine state-of-the-art UI/UX, accurate content proofed by scholars, and highly optimized code bases.",
  "about.overview.p3": "Beyond consumer apps, we have successfully developed national-scale registry databases for public sector entities like <strong>NADRA</strong> and <strong>NARA</strong>, establishing ourselves as a trusted software vendor for governments and enterprise companies.",
  
  "about.stats.1.num": "100M+",
  "about.stats.1.lbl": "Global Users",
  "about.stats.2.num": "45+",
  "about.stats.2.lbl": "Years in Tech",
  "about.stats.3.num": "50+",
  "about.stats.3.lbl": "Applications",
  "about.stats.4.num": "45+",
  "about.stats.4.lbl": "Enterprise Clients",
  
  "about.timeline.badge": "Our Timeline",
  "about.timeline.title": "Key Historical Milestones",
  "about.timeline.subtitle": "A look back at how we started and how we became a global leader in Islamic digital products.",
  
  "about.vm.vision.title": "Our Vision",
  "about.vm.vision.text": "To become the world's most trusted partner in Islamic technology and localized computing, bridging cultural and spiritual needs with state-of-the-art software systems that enrich people's lives on a daily basis.",
  "about.vm.mission.title": "Our Mission",
  "about.vm.mission.text": "We combine strict scriptural authenticity with cutting-edge user experience to build digital products that simplify scripture study, prayer tracking, language input, and enterprise engagement for global audiences.",
  
  "about.values.badge": "Core Values",
  "about.values.title": "The Principles We Stand By",
  "about.values.subtitle": "Our values represent the core commitments that guide our design, development, and customer interactions.",
  
  "about.partners.title": "Collaborations & Trust Marks"
};

const ur = {
  "about.overview.title": "ٹیکنالوجی کے ذریعے دلوں اور ذہنوں کو جوڑنا",
  "about.overview.p1": "پی ڈی ایم ایس کا آغاز 1979 میں مادری زبان کی کمپیوٹنگ میں ایک سرخیل کے طور پر ہوا، جس نے اردو پبلشنگ کے لیے خصوصی ورڈ پروسیسرز اور لے آؤٹ تیار کیے۔ سالوں کے دوران، ہماری تکنیکی توجہ عالمی سطح پر مسلمانوں کی روحانی ضروریات کو پورا کرنے کے لیے وسیع ہوئی۔",
  "about.overview.p2": "آج، ہم دنیا کی مقبول ترین اسلامی ایپلی کیشنز کو برقرار رکھتے ہیں، جن میں <strong>قرآن مجید</strong>، <strong>قرآن پاک</strong>، اور <strong>قرآن ٹی وی</strong> شامل ہیں، اس کے ساتھ ساتھ <strong>ایزی اردو کی بورڈ</strong> جیسی علاقائی سہولیات بھی ہیں۔ ہماری مصنوعات جدید ترین UI/UX، علماء کے ذریعے تصدیق شدہ درست مواد، اور انتہائی بہتر کوڈ بیس کو یکجا کرتی ہیں۔",
  "about.overview.p3": "صارفین کی ایپس کے علاوہ، ہم نے <strong>نادرہ</strong> اور <strong>نارا</strong> جیسے سرکاری اداروں کے لیے کامیابی کے ساتھ قومی سطح کے رجسٹری ڈیٹا بیس تیار کیے ہیں، اور خود کو حکومتوں اور انٹرپرائز کمپنیوں کے لیے ایک قابل اعتماد سافٹ ویئر وینڈر کے طور پر قائم کیا ہے۔",
  
  "about.stats.1.num": "100M+",
  "about.stats.1.lbl": "عالمی صارفین",
  "about.stats.2.num": "45+",
  "about.stats.2.lbl": "ٹیکنالوجی میں سال",
  "about.stats.3.num": "50+",
  "about.stats.3.lbl": "ایپلی کیشنز",
  "about.stats.4.num": "45+",
  "about.stats.4.lbl": "انٹرپرائز کلائنٹس",
  
  "about.timeline.badge": "ہماری ٹائم لائن",
  "about.timeline.title": "اہم تاریخی سنگ میل",
  "about.timeline.subtitle": "ایک نظر اس بات پر کہ ہم نے کیسے شروعات کی اور ہم کیسے اسلامی ڈیجیٹل مصنوعات میں عالمی رہنما بنے۔",
  
  "about.vm.vision.title": "ہمارا وژن",
  "about.vm.vision.text": "اسلامی ٹیکنالوجی اور مقامی کمپیوٹنگ میں دنیا کا سب سے قابل اعتماد پارٹنر بننا، ثقافتی اور روحانی ضروریات کو جدید ترین سافٹ ویئر سسٹمز سے جوڑنا جو روزمرہ کی بنیاد پر لوگوں کی زندگیوں کو مالا مال کرتے ہیں۔",
  "about.vm.mission.title": "ہمارا مشن",
  "about.vm.mission.text": "ہم عالمی سامعین کے لیے کتب کے مطالعے، نماز کی ٹریکنگ، زبان کے ان پٹ، اور انٹرپرائز کی شمولیت کو آسان بنانے کے لیے ڈیجیٹل مصنوعات بنانے کے لیے جدید ترین صارف کے تجربے کے ساتھ سخت کتب کی صداقت کو یکجا کرتے ہیں۔",
  
  "about.values.badge": "بنیادی اقدار",
  "about.values.title": "وہ اصول جن پر ہم قائم ہیں",
  "about.values.subtitle": "ہماری اقدار ان بنیادی وعدوں کی نمائندگی کرتی ہیں جو ہمارے ڈیزائن، ترقی اور کسٹمر کے تعاملات کی رہنمائی کرتے ہیں۔",
  
  "about.partners.title": "شراکت داری اور اعتماد"
};

const ar = {
  "about.overview.title": "ربط القلوب والعقول من خلال التكنولوجيا",
  "about.overview.p1": "بدأت بي دي إم إس في عام 1979 كرائدة في مجال حوسبة اللغة الأم، حيث طورت معالجات نصوص متخصصة وتخطيطات للنشر باللغة الأردية. على مر السنين، توسع تركيزنا التقني لتلبية الاحتياجات الروحية للمسلمين على مستوى العالم.",
  "about.overview.p2": "اليوم، نحافظ على التطبيقات الإسلامية الأكثر شعبية في العالم، بما في ذلك <strong>القرآن المجيد</strong> و<strong>القرآن باك</strong> و<strong>تلفزيون القرآن</strong>، إلى جانب المرافق الإقليمية مثل <strong>لوحة مفاتيح الأردية السهلة</strong>. تجمع منتجاتنا بين أحدث واجهات المستخدم/تجربة المستخدم والمحتوى الدقيق الذي يراجعه العلماء وقواعد التعليمات البرمجية المحسّنة للغاية.",
  "about.overview.p3": "إلى جانب تطبيقات المستهلكين، نجحنا في تطوير قواعد بيانات سجل على المستوى الوطني لكيانات القطاع العام مثل <strong>نادرا</strong> و<strong>نارا</strong>، مما رسخ مكانتنا كبائع برمجيات موثوق به للحكومات وشركات المؤسسات.",
  
  "about.stats.1.num": "100M+",
  "about.stats.1.lbl": "المستخدمين العالميين",
  "about.stats.2.num": "45+",
  "about.stats.2.lbl": "سنوات في التكنولوجيا",
  "about.stats.3.num": "50+",
  "about.stats.3.lbl": "تطبيقات",
  "about.stats.4.num": "45+",
  "about.stats.4.lbl": "عملاء الشركات",
  
  "about.timeline.badge": "جدولنا الزمني",
  "about.timeline.title": "معالم تاريخية رئيسية",
  "about.timeline.subtitle": "نظرة إلى الوراء حول كيف بدأنا وكيف أصبحنا رائدين عالميين في المنتجات الرقمية الإسلامية.",
  
  "about.vm.vision.title": "رؤيتنا",
  "about.vm.vision.text": "أن نصبح الشريك الأكثر ثقة في العالم في مجال التكنولوجيا الإسلامية والحوسبة المحلية، وسد الاحتياجات الثقافية والروحية من خلال أنظمة برمجية حديثة تثري حياة الناس على أساس يومي.",
  "about.vm.mission.title": "مهمتنا",
  "about.vm.mission.text": "نحن نجمع بين الأصالة الصارمة للكتاب وتجربة المستخدم المتطورة لبناء منتجات رقمية تبسط دراسة الكتاب المقدس وتتبع الصلاة وإدخال اللغة ومشاركة المؤسسة للجماهير العالمية.",
  
  "about.values.badge": "القيم الأساسية",
  "about.values.title": "المبادئ التي نلتزم بها",
  "about.values.subtitle": "تمثل قيمنا الالتزامات الأساسية التي توجه تصميمنا وتطويرنا وتفاعلاتنا مع العملاء.",
  
  "about.partners.title": "التعاون وعلامات الثقة"
};

updateJson('en.json', en);
updateJson('ur.json', ur);
updateJson('ar.json', ar);

console.log('JSON files updated successfully!');
