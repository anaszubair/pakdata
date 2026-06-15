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
  "contact.hero.badge": "Get In Touch",
  "contact.hero.title": "Contact Our Global Offices",
  "contact.hero.subtitle": "Have questions about our apps, enterprise services, career opportunities, or corporate partnerships? Let's connect.",
  "contact.column.title": "Our Office Coordinates",
  "contact.column.subtitle": "Feel free to visit our headquarters or reach us via telephone or direct email channels.",
  "contact.office.phone": "Phone:",
  "contact.office.fax": "Fax:",
  "contact.office.email": "Email:",
  "contact.dept.title": "Specialized Departments",
  "contact.form.title": "Send Us a Message",
  "contact.form.subtitle": "Fill in the fields below, and our respective department will respond to you shortly.",
  "contact.form.name.label": "Full Name",
  "contact.form.name.placeholder": "Enter your full name",
  "contact.form.email.label": "Email Address",
  "contact.form.email.placeholder": "name@example.com",
  "contact.form.subject.label": "Topic / Subject",
  "contact.form.subject.opt1": "General Corporate Inquiry",
  "contact.form.subject.opt2": "B2B Enterprise Software",
  "contact.form.subject.opt3": "App Support & Help",
  "contact.form.subject.opt4": "Job Applications / Careers",
  "contact.form.subject.opt5": "Partnerships & Collaborations",
  "contact.form.msg.label": "Message Content",
  "contact.form.msg.placeholder": "Type your message here...",
  "contact.form.btn": "Send Message",
  "contact.map.title": "Office Location Map",
  "contact.map.text": "DHA Phase II Extension, Karachi, Pakistan.",
  "contact.map.link": "View on Google Maps",
  "contact.form.alert": "Thank you! Your inquiry has been successfully submitted. Our team will contact you soon."
};

const ur = {
  "contact.hero.badge": "رابطے میں رہیں",
  "contact.hero.title": "ہمارے عالمی دفاتر سے رابطہ کریں",
  "contact.hero.subtitle": "کیا آپ کو ہماری ایپس، انٹرپرائز سروسز، کیریئر کے مواقع، یا کارپوریٹ شراکت داری کے بارے میں سوالات ہیں؟ آئیے جڑتے ہیں۔",
  "contact.column.title": "ہمارے دفتر کے کوآرڈینیٹس",
  "contact.column.subtitle": "ہمارے ہیڈ کوارٹر کا دورہ کرنے میں ہچکچاہٹ نہ کریں یا ٹیلی فون یا براہ راست ای میل چینلز کے ذریعے ہم تک پہنچیں۔",
  "contact.office.phone": "فون:",
  "contact.office.fax": "فیکس:",
  "contact.office.email": "ای میل:",
  "contact.dept.title": "خصوصی محکمے",
  "contact.form.title": "ہمیں ایک پیغام بھیجیں",
  "contact.form.subtitle": "ذیل میں فیلڈز پُر کریں، اور ہمارا متعلقہ محکمہ جلد ہی آپ کو جواب دے گا۔",
  "contact.form.name.label": "پورا نام",
  "contact.form.name.placeholder": "اپنا پورا نام درج کریں",
  "contact.form.email.label": "ای میل ایڈریس",
  "contact.form.email.placeholder": "name@example.com",
  "contact.form.subject.label": "موضوع / عنوان",
  "contact.form.subject.opt1": "عمومی کارپوریٹ انکوائری",
  "contact.form.subject.opt2": "B2B انٹرپرائز سافٹ ویئر",
  "contact.form.subject.opt3": "ایپ سپورٹ اور مدد",
  "contact.form.subject.opt4": "ملازمت کی درخواستیں / کیریئر",
  "contact.form.subject.opt5": "شراکت داری اور تعاون",
  "contact.form.msg.label": "پیغام کا مواد",
  "contact.form.msg.placeholder": "اپنا پیغام یہاں ٹائپ کریں...",
  "contact.form.btn": "پیغام بھیجیں",
  "contact.map.title": "دفتر کے مقام کا نقشہ",
  "contact.map.text": "ڈی ایچ اے فیز 2 ایکسٹینشن، کراچی، پاکستان۔",
  "contact.map.link": "گوگل میپس پر دیکھیں",
  "contact.form.alert": "آپ کا شکریہ! آپ کی انکوائری کامیابی کے ساتھ جمع کر دی گئی ہے۔ ہماری ٹیم جلد ہی آپ سے رابطہ کرے گی۔"
};

const ar = {
  "contact.hero.badge": "أبق على اتصال",
  "contact.hero.title": "اتصل بمكاتبنا العالمية",
  "contact.hero.subtitle": "هل لديك أسئلة حول تطبيقاتنا أو خدمات الشركات أو فرص العمل أو الشراكات المؤسسية؟ دعنا نتواصل.",
  "contact.column.title": "إحداثيات مكتبنا",
  "contact.column.subtitle": "لا تتردد في زيارة مقرنا الرئيسي أو الوصول إلينا عبر الهاتف أو قنوات البريد الإلكتروني المباشرة.",
  "contact.office.phone": "الهاتف:",
  "contact.office.fax": "الفاكس:",
  "contact.office.email": "البريد الإلكتروني:",
  "contact.dept.title": "الأقسام المتخصصة",
  "contact.form.title": "أرسل لنا رسالة",
  "contact.form.subtitle": "املأ الحقول أدناه، وسيرد عليك القسم المختص قريبًا.",
  "contact.form.name.label": "الاسم الكامل",
  "contact.form.name.placeholder": "أدخل اسمك الكامل",
  "contact.form.email.label": "عنوان البريد الإلكتروني",
  "contact.form.email.placeholder": "name@example.com",
  "contact.form.subject.label": "الموضوع",
  "contact.form.subject.opt1": "استفسار عام للشركات",
  "contact.form.subject.opt2": "برامج الشركات B2B",
  "contact.form.subject.opt3": "دعم التطبيق والمساعدة",
  "contact.form.subject.opt4": "طلبات العمل / الوظائف",
  "contact.form.subject.opt5": "الشراكات والتعاون",
  "contact.form.msg.label": "محتوى الرسالة",
  "contact.form.msg.placeholder": "اكتب رسالتك هنا...",
  "contact.form.btn": "إرسال رسالة",
  "contact.map.title": "خريطة موقع المكتب",
  "contact.map.text": "امتداد DHA المرحلة الثانية ، كراتشي ، باكستان.",
  "contact.map.link": "عرض على خرائط جوجل",
  "contact.form.alert": "شكرًا لك! تم إرسال استفسارك بنجاح. سيتصل بك فريقنا قريبًا."
};

updateJson('en.json', en);
updateJson('ur.json', ur);
updateJson('ar.json', ar);

console.log('Contact JSON files updated successfully!');
