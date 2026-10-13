// קטלוג המוצרים.
// ⚠️ אלה מוצרי דוגמה כלליים. החליפו שמות, מק"טים, מידות ומחירים לפי המוצרים האמיתיים של היצרן.
// מבנה מוצר:
//   id: מזהה ייחודי, cat: קטגוריה, sku: מק"ט בסיס
//   name / desc: { he, ar }
//   options: [{ label: {he, ar}, values: [...] }]  — מידות לבחירה (קוטר, אורך, גובה...)
//   price: מחיר ליחידה (מוצג רק אם showPrices=true), unit: { he, ar }

window.ALN_CATEGORIES = [
  { id: "implants", icon: "implant", name: { he: "שתלים", ar: "زرعات" } },
  { id: "abutments", icon: "abutment", name: { he: "אבטמנטים", ar: "دعامات (أبتمنت)" } },
  { id: "screws", icon: "screw", name: { he: "ברגים ומכסים", ar: "براغي وأغطية" } },
  { id: "prosthetic", icon: "coping", name: { he: "שחזור ומעבדה", ar: "تركيبات ومختبر" } },
  { id: "surgical", icon: "drill", name: { he: "כלים כירורגיים", ar: "أدوات جراحية" } },
  { id: "regen", icon: "bone", name: { he: "עצם וממברנות", ar: "عظم وأغشية" } },
];

const D = (he, ar) => ({ he, ar });
const DIAM = { label: D("קוטר (מ\"מ)", "القطر (مم)"), values: ["3.3", "3.75", "4.2", "5.0"] };
const LEN = { label: D("אורך (מ\"מ)", "الطول (مم)"), values: ["8", "10", "11.5", "13", "16"] };
const PLATFORM = { label: D("פלטפורמה", "المنصة"), values: ["NP", "RP", "WP"] };
const GH = { label: D("גובה חניכיים (מ\"מ)", "ارتفاع اللثة (مم)"), values: ["1", "2", "3", "4", "5"] };
const UNIT = D("יח'", "قطعة");

window.ALN_PRODUCTS = [
  // ---------- implants ----------
  { id: "imp-conical", cat: "implants", sku: "IMP-CN", price: 320, unit: UNIT,
    name: D("שתל קוני – חיבור משושה פנימי", "زرعة مخروطية – وصلة سداسية داخلية"),
    desc: D("שתל טיטניום עם הברגה אגרסיבית ליציבות ראשונית גבוהה. מגיע עם בורג כיסוי.", "زرعة تيتانيوم بأسنان قوية لثبات أولي عالٍ. تأتي مع برغي تغطية."),
    options: [DIAM, LEN] },
  { id: "imp-narrow", cat: "implants", sku: "IMP-NR", price: 320, unit: UNIT,
    name: D("שתל צר לרווחים קטנים", "زرعة رفيعة للمسافات الضيقة"),
    desc: D("לחותכות תחתונות ולרכס צר.", "للقواطع السفلية والحافة الضيقة."),
    options: [{ label: DIAM.label, values: ["3.0"] }, { label: LEN.label, values: ["10", "11.5", "13"] }] },
  { id: "imp-short", cat: "implants", sku: "IMP-SH", price: 340, unit: UNIT,
    name: D("שתל קצר רחב", "زرعة قصيرة عريضة"),
    desc: D("לאזורים אחוריים עם גובה עצם מוגבל.", "للمناطق الخلفية ذات ارتفاع العظم المحدود."),
    options: [{ label: DIAM.label, values: ["5.0", "6.0"] }, { label: LEN.label, values: ["6", "8"] }] },
  { id: "imp-zygo", cat: "implants", sku: "IMP-ZY", price: 1450, unit: UNIT,
    name: D("שתל זיגומטי", "زرعة وجنية (زيجوماتيك)"),
    desc: D("לשיקום לסת עליונה עם ספיגת עצם מתקדמת.", "لترميم الفك العلوي مع ضمور عظمي متقدم."),
    options: [{ label: LEN.label, values: ["35", "40", "45", "50"] }] },

  // ---------- abutments ----------
  { id: "abt-straight", cat: "abutments", sku: "ABT-ST", price: 140, unit: UNIT,
    name: D("אבטמנט ישר טיטניום", "دعامة مستقيمة تيتانيوم"),
    desc: D("כולל בורג פרוסטטי.", "تشمل برغي تركيبات."), options: [PLATFORM, GH] },
  { id: "abt-angled", cat: "abutments", sku: "ABT-AN", price: 180, unit: UNIT,
    name: D("אבטמנט זוויתי", "دعامة مائلة"),
    desc: D("לתיקון זווית השתל.", "لتصحيح زاوية الزرعة."),
    options: [PLATFORM, { label: D("זווית", "الزاوية"), values: ["15°", "25°"] }] },
  { id: "abt-mu", cat: "abutments", sku: "ABT-MU", price: 210, unit: UNIT,
    name: D("מולטי-יוניט", "دعامة متعددة الوحدات (Multi-Unit)"),
    desc: D("לשחזורים מוברגים ו-All-on-4.", "للتركيبات المثبتة بالبراغي و All-on-4."),
    options: [{ label: D("זווית", "الزاوية"), values: ["0°", "17°", "30°"] }, GH] },
  { id: "abt-tibase", cat: "abutments", sku: "ABT-TB", price: 160, unit: UNIT,
    name: D("Ti-Base לעבודת CAD/CAM", "قاعدة تيتانيوم Ti-Base لـ CAD/CAM"),
    desc: D("בסיס טיטניום להדבקת כתר זירקוניה.", "قاعدة تيتانيوم للصق تاج زركونيا."), options: [PLATFORM, GH] },
  { id: "abt-temp", cat: "abutments", sku: "ABT-TP", price: 90, unit: UNIT,
    name: D("אבטמנט זמני PEEK", "دعامة مؤقتة PEEK"),
    desc: D("לשחזור זמני ועיצוב חניכיים.", "للتركيب المؤقت وتشكيل اللثة."), options: [PLATFORM] },

  // ---------- screws & caps ----------
  { id: "scr-cover", cat: "screws", sku: "SCR-CV", price: 35, unit: UNIT,
    name: D("בורג כיסוי", "برغي تغطية"), desc: D("לשלב הריפוי הסגור.", "لمرحلة الشفاء المغلقة."), options: [PLATFORM] },
  { id: "scr-heal", cat: "screws", sku: "SCR-HL", price: 60, unit: UNIT,
    name: D("מבריא (Healing Abutment)", "دعامة شفاء (Healing)"),
    desc: D("לעיצוב רקמה רכה לאחר החשיפה.", "لتشكيل الأنسجة الرخوة بعد الكشف."),
    options: [{ label: DIAM.label, values: ["3.6", "4.5", "5.5", "6.5"] }, { label: D("גובה (מ\"מ)", "الارتفاع (مم)"), values: ["3", "4", "5", "7"] }] },
  { id: "scr-pros", cat: "screws", sku: "SCR-PR", price: 30, unit: UNIT,
    name: D("בורג פרוסטטי", "برغي تركيبات"), desc: D("בורג חלופי לאבטמנט.", "برغي بديل للدعامة."), options: [PLATFORM] },

  // ---------- prosthetic / lab ----------
  { id: "pro-imp-open", cat: "prosthetic", sku: "PRO-IO", price: 70, unit: UNIT,
    name: D("טרנספר מגש פתוח", "ناقل طبعة – صينية مفتوحة"), desc: D("לקבלת מידה מדויקת.", "لأخذ طبعة دقيقة."), options: [PLATFORM] },
  { id: "pro-imp-closed", cat: "prosthetic", sku: "PRO-IC", price: 70, unit: UNIT,
    name: D("טרנספר מגש סגור", "ناقل طبعة – صينية مغلقة"), desc: D("טכניקת מידה סגורה.", "تقنية الطبعة المغلقة."), options: [PLATFORM] },
  { id: "pro-analog", cat: "prosthetic", sku: "PRO-AN", price: 45, unit: UNIT,
    name: D("אנלוג מעבדה", "نظير مخبري (Analog)"), desc: D("לדגם עבודה במעבדה.", "لنموذج العمل في المختبر."), options: [PLATFORM] },
  { id: "pro-scan", cat: "prosthetic", sku: "PRO-SB", price: 95, unit: UNIT,
    name: D("Scan Body לסריקה דיגיטלית", "Scan Body للمسح الرقمي"), desc: D("תואם לסורקים תוך-פומיים.", "متوافق مع الماسحات داخل الفم."), options: [PLATFORM] },

  // ---------- surgical ----------
  { id: "sur-kit", cat: "surgical", sku: "SUR-KT", price: 3900, unit: D("ערכה", "طقم"),
    name: D("ערכה כירורגית מלאה", "طقم جراحي كامل"), desc: D("קופסה עם מקדחים, מפתחות ומאריכים.", "علبة مع مثاقب ومفاتيح ووصلات."), options: [] },
  { id: "sur-drill", cat: "surgical", sku: "SUR-DR", price: 150, unit: UNIT,
    name: D("מקדח כירורגי", "مثقاب جراحي"), desc: D("מקדח פלדת אל-חלד עם סימוני עומק.", "مثقاب فولاذ مع علامات عمق."),
    options: [{ label: D("סוג/קוטר", "النوع/القطر"), values: ["Pilot 2.0", "2.8", "3.2", "3.65", "4.2", "4.65"] }] },
  { id: "sur-torque", cat: "surgical", sku: "SUR-TQ", price: 650, unit: UNIT,
    name: D("מפתח מומנט", "مفتاح عزم"), desc: D("10–70 N·cm.", "10–70 نيوتن·سم."), options: [] },
  { id: "sur-driver", cat: "surgical", sku: "SUR-HD", price: 120, unit: UNIT,
    name: D("מברג משושה", "مفك سداسي"), desc: D("לבורג פרוסטטי ומבריא.", "لبرغي التركيبات ودعامة الشفاء."),
    options: [{ label: D("אורך", "الطول"), values: ["קצר / قصير", "ארוך / طويل"] }] },

  // ---------- regeneration ----------
  { id: "reg-xeno", cat: "regen", sku: "REG-XG", price: 280, unit: D("בקבוקון", "قارورة"),
    name: D("תחליף עצם (קסנוגרפט)", "بديل عظمي (Xenograft)"), desc: D("גרגירים להשתלת עצם.", "حبيبات لتطعيم العظم."),
    options: [{ label: D("כמות", "الكمية"), values: ["0.5 g", "1.0 g", "2.0 g"] }] },
  { id: "reg-membrane", cat: "regen", sku: "REG-MB", price: 330, unit: UNIT,
    name: D("ממברנת קולגן נספגת", "غشاء كولاجين قابل للامتصاص"), desc: D("לחסימת רקמה רכה בהשתלות עצם.", "لعزل الأنسجة الرخوة في تطعيم العظم."),
    options: [{ label: D("מידה (מ\"מ)", "المقاس (مم)"), values: ["15×20", "25×30", "30×40"] }] },
];
