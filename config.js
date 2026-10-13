// הגדרות העסק — כאן משנים שם, לוגו, צבעים ופרטי קשר.
window.APP_CONFIG = {
  businessName: "ASHRF Remas Tours",
  businessNameLocal: { he: "אשרף טורס", ar: "اشرف تورز", en: "ASHRF Remas Tours" },
  tagline: "Travel & Be Happy",

  // הלוגו המקורי: שמרו אותו כ-assets/logo.png (יקבל עדיפות).
  // אם הקובץ חסר — מוצג assets/logo.svg (שחזור וקטורי של הלוגו מכרטיס הביקור).
  logo: "assets/logo.png",
  logoFallback: "assets/logo.svg",

  colors: {
    primary: "#1A5DB8",   // כחול מכרטיס הביקור
    primaryDark: "#123F80",
    accent: "#F7A41D",    // כתום-שמש מהלוגו
    teal: "#1A8FC9",
  },

  // פרטי קשר — שדה ריק מסתיר את הכפתור המתאים.
  contact: {
    phones: ["052-6159651", "04-9959582"],
    whatsapp: "972526159651",
    email: "ante.wbs@gmail.com",
    address: { he: "ערב אל-עראמשה", ar: "عرب العرامشة", en: "Arab al-Aramshe, Israel" },
    facebook: "https://www.facebook.com/search/top?q=Ashrf%20Tours",
    tiktok: "https://www.tiktok.com/@yarb66",
    website: "",
  },

  // מיקום ברירת מחדל כשאין הרשאת מיקום
  defaultCenter: { lat: 33.0907, lon: 35.1975 },
  defaultLanguage: "he", // he | ar | en
};
