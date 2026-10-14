// טיולים וחבילות: כאן מוסיפים, מעדכנים ומוחקים טיולים.
// ⚠️ הטיולים כאן הם דוגמאות. החליפו יעדים, תאריכים, מחירים ותוכן בטיולים האמיתיים שלכם.
//
// שדות:
//   type: "group" (טיול קבוצתי מאורגן) או "package" (חבילת טיסה ומלון לזוגות ומשפחות)
//   priceFrom: מחיר לאדם בדולרים, החל מ-
//   dates: [{ start, end, seats }]  — seats = כמה מקומות נשארו (למשל 6 → "נשארו 6 מקומות")
//   includes: flight, hotel, breakfast, halfboard, guide, transfers, tours, insurance
//   image: קישור לתמונה (לא חובה). בלי תמונה מוצג רקע צבעוני עם דגל.
//   center: מרכז היעד, לכפתור "גלו את היעד" במדריך

const TL = (he, ar, en) => ({ he, ar, en });

window.TRIPS = [
  {
    id: "istanbul",
    type: "group",
    flag: "🇹🇷",
    colors: ["#C8102E", "#F28C28"],
    center: { lat: 41.0082, lon: 28.9784, label: "Istanbul" },
    title: TL("איסטנבול הקסומה", "إسطنبول الساحرة", "Magical Istanbul"),
    subtitle: TL("טורקיה · טיול מאורגן עם מדריך", "تركيا · رحلة منظّمة مع مرشد", "Turkey · guided group tour"),
    days: 5, nights: 4, priceFrom: 649,
    dates: [{ start: "2026-11-12", end: "2026-11-16", seats: 6 }, { start: "2026-12-24", end: "2026-12-28", seats: 18 }],
    includes: ["flight", "hotel", "breakfast", "guide", "transfers", "tours"],
    highlights: TL(
      ["המסגד הכחול ואיה סופיה", "שייט בבוספורוס", "הגרנד בזאר ושוק התבלינים", "מלון 4 כוכבים במרכז"],
      ["المسجد الأزرق وآيا صوفيا", "رحلة بحرية في البوسفور", "البازار الكبير وسوق التوابل", "فندق 4 نجوم في المركز"],
      ["Blue Mosque & Hagia Sophia", "Bosphorus cruise", "Grand Bazaar & Spice Market", "4-star central hotel"]),
    itinerary: TL(
      ["טיסה לאיסטנבול, העברה למלון וערב חופשי בטקסים", "סולטנאחמט: המסגד הכחול, איה סופיה וארמון טופקפי", "שייט בבוספורוס ושוק התבלינים", "יום חופשי לקניות בגרנד בזאר", "העברה לשדה התעופה וטיסה חזרה"],
      ["الطيران إلى إسطنبول، النقل إلى الفندق وأمسية حرة في تقسيم", "السلطان أحمد: المسجد الأزرق، آيا صوفيا وقصر توبكابي", "رحلة في البوسفور وسوق التوابل", "يوم حر للتسوق في البازار الكبير", "النقل إلى المطار والعودة"],
      ["Fly to Istanbul, hotel transfer, free evening in Taksim", "Sultanahmet: Blue Mosque, Hagia Sophia, Topkapi Palace", "Bosphorus cruise and Spice Market", "Free day for shopping at the Grand Bazaar", "Transfer to the airport and flight home"]),
  },
  {
    id: "georgia",
    type: "group",
    flag: "🇬🇪",
    colors: ["#1B6B4A", "#7CB342"],
    center: { lat: 41.7151, lon: 44.8271, label: "Tbilisi" },
    title: TL("גאורגיה: טביליסי ובטומי", "جورجيا: تبليسي وباتومي", "Georgia: Tbilisi & Batumi"),
    subtitle: TL("הרים, יין וחוף הים השחור", "جبال ونبيذ وشاطئ البحر الأسود", "Mountains, food & the Black Sea"),
    days: 7, nights: 6, priceFrom: 899,
    dates: [{ start: "2026-12-03", end: "2026-12-09", seats: 4 }, { start: "2027-03-18", end: "2027-03-24", seats: 22 }],
    includes: ["flight", "hotel", "breakfast", "guide", "transfers", "tours"],
    highlights: TL(
      ["העיר העתיקה של טביליסי", "קזבגי והרי הקווקז", "בטומי וחוף הים השחור", "רכבל ומעיינות גופרית"],
      ["مدينة تبليسي القديمة", "كازبيجي وجبال القوقاز", "باتومي وشاطئ البحر الأسود", "التلفريك وينابيع الكبريت"],
      ["Tbilisi Old Town", "Kazbegi & the Caucasus", "Batumi on the Black Sea", "Cable car & sulphur baths"]),
    itinerary: TL(
      ["טיסה לטביליסי וסיור ערב בעיר העתיקה", "רכבל למבצר נאריקלה ומרחצאות הגופרית", "יום טיול לקזבגי והרי הקווקז", "נסיעה לבטומי דרך קוטאיסי", "בטומי: טיילת, גן בוטני ורכבל", "יום חופשי בחוף", "חזרה לשדה התעופה וטיסה הביתה"],
      ["الطيران إلى تبليسي وجولة مسائية", "التلفريك إلى قلعة ناريكالا وحمامات الكبريت", "رحلة يومية إلى كازبيجي", "السفر إلى باتومي عبر كوتايسي", "باتومي: الكورنيش والحديقة النباتية", "يوم حر على الشاطئ", "العودة إلى المطار"],
      ["Fly to Tbilisi, evening Old Town walk", "Cable car to Narikala and sulphur baths", "Day trip to Kazbegi", "Drive to Batumi via Kutaisi", "Batumi boulevard and botanical garden", "Free beach day", "Transfer and flight home"]),
  },
  {
    id: "petra",
    type: "group",
    flag: "🇯🇴",
    colors: ["#B5651D", "#E0A458"],
    center: { lat: 30.3285, lon: 35.4444, label: "Petra" },
    title: TL("ירדן: פטרה וואדי רם", "الأردن: البتراء ووادي رم", "Jordan: Petra & Wadi Rum"),
    subtitle: TL("טיול קצר באוטובוס מהצפון", "رحلة قصيرة بالحافلة من الشمال", "Short coach tour from the north"),
    days: 3, nights: 2, priceFrom: 389,
    dates: [{ start: "2026-11-26", end: "2026-11-28", seats: 9 }, { start: "2027-01-14", end: "2027-01-16", seats: 30 }],
    includes: ["hotel", "halfboard", "guide", "transfers", "tours"],
    highlights: TL(
      ["העיר הוורודה פטרה", "לילה במחנה בדואי בוואדי רם", "סיור ג'יפים במדבר", "יציאה ממעבר נהר הירדן"],
      ["مدينة البتراء الوردية", "ليلة في مخيم بدوي في وادي رم", "جولة بالجيب في الصحراء", "الانطلاق من معبر نهر الأردن"],
      ["The rose city of Petra", "Night in a Bedouin camp", "Desert jeep tour", "Departure via the Jordan River crossing"]),
    itinerary: TL(
      ["יציאה באוטובוס, מעבר הגבול ונסיעה לפטרה", "יום מלא בפטרה ונסיעה למחנה בוואדי רם", "סיור ג'יפים בזריחה וחזרה הביתה"],
      ["الانطلاق بالحافلة وعبور الحدود إلى البتراء", "يوم كامل في البتراء ثم مخيم وادي رم", "جولة جيب عند الشروق والعودة"],
      ["Coach, border crossing and drive to Petra", "Full day in Petra, then Wadi Rum camp", "Sunrise jeep tour and return home"]),
  },
  {
    id: "dubai",
    type: "package",
    flag: "🇦🇪",
    colors: ["#0B4F8A", "#3AA0D8"],
    center: { lat: 25.2048, lon: 55.2708, label: "Dubai" },
    title: TL("דובאי: חבילה לזוגות ומשפחות", "دبي: باقة للأزواج والعائلات", "Dubai package for couples & families"),
    subtitle: TL("טיסה, מלון והעברות, בתאריכים שלכם", "طيران وفندق وتنقلات بالتواريخ التي تختارها", "Flight, hotel & transfers on your dates"),
    days: 5, nights: 4, priceFrom: 790,
    dates: [],
    includes: ["flight", "hotel", "breakfast", "transfers"],
    highlights: TL(
      ["מלון 4–5 כוכבים", "אפשרות לספארי מדבר", "בורג' ח'ליפה ודובאי מול", "תאריכים גמישים"],
      ["فندق 4–5 نجوم", "إمكانية سفاري الصحراء", "برج خليفة ودبي مول", "تواريخ مرنة"],
      ["4–5 star hotel", "Optional desert safari", "Burj Khalifa & Dubai Mall", "Flexible dates"]),
    itinerary: TL(
      ["בוחרים תאריכים ומספר נוסעים, ואנחנו שולחים הצעה מותאמת בוואטסאפ."],
      ["اختر التواريخ وعدد المسافرين وسنرسل لك عرضًا مخصصًا عبر واتساب."],
      ["Pick your dates and travellers, and we'll send a tailored offer on WhatsApp."]),
  },
  {
    id: "thailand",
    type: "package",
    flag: "🇹🇭",
    colors: ["#2E7D32", "#26A69A"],
    center: { lat: 7.8804, lon: 98.3923, label: "Phuket" },
    title: TL("תאילנד: בנגקוק ופוקט", "تايلاند: بانكوك وبوكيت", "Thailand: Bangkok & Phuket"),
    subtitle: TL("חבילה של 10 ימים, עיר וחופים", "باقة 10 أيام بين المدينة والشواطئ", "10-day city & beach package"),
    days: 10, nights: 9, priceFrom: 1290,
    dates: [],
    includes: ["flight", "hotel", "breakfast", "transfers", "insurance"],
    highlights: TL(
      ["3 לילות בבנגקוק ו-6 בפוקט", "טיסה פנימית כלולה", "שייט לאיי פי פי (תוספת)", "ביטוח נסיעות"],
      ["3 ليالٍ في بانكوك و6 في بوكيت", "رحلة داخلية مشمولة", "رحلة بحرية لجزر في في (إضافة)", "تأمين سفر"],
      ["3 nights Bangkok + 6 nights Phuket", "Domestic flight included", "Phi Phi islands cruise (extra)", "Travel insurance"]),
    itinerary: TL(
      ["בוחרים תאריכים ומספר נוסעים, ואנחנו שולחים הצעה מותאמת בוואטסאפ."],
      ["اختر التواريخ وعدد المسافرين وسنرسل لك عرضًا مخصصًا عبر واتساب."],
      ["Pick your dates and travellers, and we'll send a tailored offer on WhatsApp."]),
  },
];

// "למה לטייל איתנו" — עדכנו לפי העסק שלכם.
window.TRUST_POINTS = [
  { icon: "🤝", text: TL("ליווי אישי לפני הטיול ובמהלכו", "مرافقة شخصية قبل الرحلة وخلالها", "Personal support before and during the trip") },
  { icon: "💬", text: TL("מענה מהיר בוואטסאפ, בעברית ובערבית", "رد سريع عبر واتساب بالعربية والعبرية", "Fast WhatsApp replies in Arabic & Hebrew") },
  { icon: "💵", text: TL("מחיר סופי וברור, בלי הפתעות", "سعر نهائي وواضح بدون مفاجآت", "Clear final price, no surprises") },
];
