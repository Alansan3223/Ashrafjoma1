# העלאה ל-Google Play: מדריך וחומרים

## הפרטים שצריך להזין
| שדה | ערך |
|---|---|
| כתובת האפליקציה (ל-PWABuilder) | `https://alansan3223.github.io/Ashrafjoma1/` |
| Package ID | `io.github.alansan3223.ashrftours` (חייב להיות זהה ל-`playPackageId` ב-`config.js`) |
| שם האפליקציה | ASHRF Remas Tours |
| שם קצר (מתחת לאייקון) | ASHRF Tours |
| מחיר | 10$ (אפליקציה בתשלום) |
| קטגוריה | Travel & Local (נסיעות ומקומי) |
| מדיניות פרטיות | `https://alansan3223.github.io/Ashrafjoma1/privacy.html` |
| מייל ליצירת קשר | ante.wbs@gmail.com |
| אייקון 512×512 | `store/icon-512.png` |
| תמונת נושא 1024×500 | `store/feature-graphic.png` |
| צילומי מסך | `store/screenshot-1.png` עד `store/screenshot-4.png` |

## שלבים
1. **חשבון מפתח:** נכנסים ל-https://play.google.com/console ולוחצים "Create account", בתשלום חד-פעמי של 25$, עם אימות זהות.
2. **חשבון סוחר:** בכתובת Play Console ← Setup ← Payments profile. זה החשבון שאליו Google מעבירה את הכסף, והוא חובה לאפליקציה בתשלום. מוסיפים חשבון בנק.
3. **בניית הקובץ:** ב-https://www.pwabuilder.com מדביקים את כתובת האפליקציה ולוחצים Start, ואז **Package for stores ← Android ← Generate Package**.
   - ב-Package ID מזינים בדיוק `io.github.alansan3223.ashrftours`.
   - ב-Signing key בוחרים "Create new".
   - מורידים את ה-ZIP. **שמרו אותו במקום בטוח.** יש בו את מפתח החתימה (`signing.keystore` והסיסמאות), ובלעדיו אי אפשר לעדכן את האפליקציה אף פעם.
4. **יצירת האפליקציה:** ב-Play Console לוחצים Create app, בוחרים **Paid** וממלאים את השם והשפה.
5. **דף החנות:** מעתיקים את הטקסטים בהמשך המסמך, ומעלים את האייקון, תמונת הנושא וצילומי המסך.
6. **שאלונים:** Content rating, Data safety (האפליקציה לא אוספת מידע אישי, וזה מתאים למה שכתוב במדיניות הפרטיות), Target audience (‎18+), Ads (אין).
7. **בדיקה סגורה (חובה לחשבון פרטי חדש):** Testing ← Closed testing. מעלים את קובץ ה-‎.aab מה-ZIP ומוסיפים **12 בודקים** לפי כתובות Gmail שלהם. הם צריכים להשאיר את האפליקציה מותקנת **14 יום**.
   כדי שהבודקים לא ישלמו, מוסיפים אותם גם ל-Settings ← License testing.
8. **פרסום:** אחרי 14 הימים מבקשים גישה ל-Production ושולחים לבדיקה של Google.
9. **שלב אחרון, שאני מבצע:** שולחים לי את הקובץ `assetlinks.json` מתוך ה-ZIP, ואני מעלה אותו. אחרי זה שורת הכתובת נעלמת והאפליקציה נראית כמו אפליקציה רגילה.

> מי שקונה בחנות נכנס ישר, בלי קוד. באתר עצמו נשארת הכניסה עם קודים.

---

## טקסטים לדף החנות

### עברית
**תיאור קצר (עד 80 תווים):**
אטרקציות, מסעדות ומלונות בכל מדינה – עם מפה ודרכי הגעה בתחבורה ציבורית

**תיאור מלא:**
ASHRF Remas Tours – המדריך שלכם לטיול בכל מדינה בעולם.

🧭 גלו מקומות: אטרקציות, מוזיאונים, תצפיות, מסעדות, בתי קפה, מלונות, חופים, שמורות טבע, שווקים ומקומות קדושים, סביבכם או בכל עיר שתבחרו.
📍 כתובת, מפה, שעות פתיחה, טלפון ואתר לכל מקום.
🚌 איך מגיעים: תחנות האוטובוס, הרכבת, המטרו והחשמלית הקרובות, עם מספרי הקווים ודקות ההליכה.
🗺️ ניווט בלחיצה: Google Maps, Waze, Moovit ו-Apple Maps.
✈️ הצעות מחיר לטיסות ולמלונות ישירות מאיתנו בוואטסאפ.
♡ שמירת מקומות למועדפים ושיתוף עם חברים.
🌍 עברית, ערבית ואנגלית.

ASHRF Remas Tours · Travel & Be Happy

### العربية
**وصف قصير:**
معالم ومطاعم وفنادق في كل دولة – مع خريطة وطرق الوصول بالمواصلات العامة

**الوصف الكامل:**
ASHRF Remas Tours – دليلك للسفر إلى أي دولة في العالم.

🧭 اكتشف الأماكن: معالم سياحية، متاحف، مطاعم، مقاهٍ، فنادق، شواطئ، محميات طبيعية، أسواق وأماكن مقدسة، بالقرب منك أو في أي مدينة تختارها.
📍 العنوان والخريطة وساعات العمل والهاتف لكل مكان.
🚌 كيف تصل: أقرب محطات الحافلات والقطارات والمترو والترام، مع أرقام الخطوط ودقائق المشي.
🗺️ ملاحة بضغطة: Google Maps وWaze وMoovit وApple Maps.
✈️ عروض أسعار للطيران والفنادق مباشرة منا عبر واتساب.
♡ احفظ الأماكن في المفضلة وشاركها مع الأصدقاء.
🌍 العربية والعبرية والإنجليزية.

### English
**Short description:**
Attractions, restaurants & hotels worldwide – with maps and public transport

**Full description:**
ASHRF Remas Tours – your travel guide for any country in the world.

🧭 Discover places: attractions, museums, viewpoints, restaurants, cafés, hotels, beaches, nature reserves, markets and holy sites, near you or in any city you choose.
📍 Address, map, opening hours, phone and website for every place.
🚌 Getting there: the nearest bus, train, metro and tram stops with line numbers and walking minutes.
🗺️ One-tap navigation with Google Maps, Waze, Moovit and Apple Maps.
✈️ Flight and hotel quotes straight from us on WhatsApp.
♡ Save favourites and share places with friends.
🌍 Hebrew, Arabic and English.
