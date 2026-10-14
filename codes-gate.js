/* Access by personal entry code ("codes" mode).
 * The customer pays the owner (Bit / PayBox / PayPal / cash) and receives a code on WhatsApp.
 * access-codes.js holds only PBKDF2 hashes of the codes; a blocked code is set to null there.
 * The owner's admin code also opens a small admin screen with a profit calculator.
 */
(() => {
  "use strict";
  const C = window.APP_CONFIG;
  if ((C.accessMode || "firebase") !== "codes") return;

  const App = window.App;
  const esc = App.esc;
  const CODES = window.ACCESS_CODES || { customers: [], admin: [] };
  const KEY = "accessCodeHash";

  const T = {
    he: {
      welcome: "ברוכים הבאים",
      intro: "המדריך החכם (מקומות, מפה ותחבורה ציבורית בכל מדינה) מיועד למנויים. הכניסה היא עם קוד אישי שמקבלים אחרי התשלום.",
      back: "חזרה לטיולים",
      payOnce: "חד-פעמי",
      howTitle: "איך מקבלים קוד?",
      how1: "שולחים לנו הודעה בוואטסאפ",
      how2: "משלמים 10$ בביט, בפייבוקס, ב-PayPal או במזומן",
      how3: "מקבלים קוד אישי ונכנסים",
      buy: "לקבלת קוד בוואטסאפ",
      waBuy: "שלום, אני רוצה לרכוש גישה לאפליקציה של ASHRF Remas Tours (10$).",
      code: "קוד כניסה",
      enter: "כניסה",
      checking: "בודק…",
      bad: "הקוד לא נכון או שאינו פעיל. בדקו ונסו שוב.",
      logout: "יציאה",
      // admin
      adminTitle: "ניהול",
      calcTitle: "מחשבון מחיר ורווח",
      calcHint: "הכניסו את העלות שלכם (טיסה, מלון או חבילה), וקבלו את המחיר ללקוח עם רווח נקי.",
      cost: "עלות לספק",
      margin: "רווח נקי (%)",
      payFee: "עמלת תשלום (%)",
      payFeeHint: "ביט/מזומן: 0 · PayPal: כ-4.4",
      extra: "עלויות קבועות נוספות",
      price: "מחיר ללקוח",
      profit: "הרווח שלך",
      codesTitle: "קודי כניסה",
      codesText: "רשימת הקודים נמצאת אצלך בקובץ codes.csv. כל לקוח שמשלם מקבל את הקוד הבא ברשימה. כדי לחסום קוד, שלחו לי את המספר שלו.",
      codesCount: "קודים פעילים",
    },
    ar: {
      welcome: "أهلًا وسهلًا",
      intro: "الدليل الذكي (أماكن وخريطة ومواصلات عامة في كل دولة) للمشتركين. الدخول برمز شخصي تحصل عليه بعد الدفع.",
      back: "العودة إلى الرحلات",
      payOnce: "لمرة واحدة",
      howTitle: "كيف أحصل على رمز؟",
      how1: "أرسل لنا رسالة عبر واتساب",
      how2: "ادفع 10$ عبر بيت أو بيبوكس أو PayPal أو نقدًا",
      how3: "استلم رمزك الشخصي وادخل",
      buy: "احصل على رمز عبر واتساب",
      waBuy: "مرحبًا، أود شراء اشتراك في تطبيق ASHRF Remas Tours (10$).",
      code: "رمز الدخول",
      enter: "دخول",
      checking: "جارٍ التحقق…",
      bad: "الرمز غير صحيح أو غير فعّال. تحقق وحاول مرة أخرى.",
      logout: "خروج",
      adminTitle: "الإدارة",
      calcTitle: "حاسبة السعر والربح",
      calcHint: "أدخل التكلفة (طيران، فندق أو رزمة) واحصل على سعر الزبون مع صافي ربحك.",
      cost: "تكلفة المورد",
      margin: "صافي الربح (%)",
      payFee: "عمولة الدفع (%)",
      payFeeHint: "بيت/نقدًا: 0 · PayPal: حوالي 4.4",
      extra: "تكاليف ثابتة إضافية",
      price: "سعر الزبون",
      profit: "ربحك",
      codesTitle: "رموز الدخول",
      codesText: "قائمة الرموز موجودة لديك في ملف codes.csv. كل زبون يدفع يحصل على الرمز التالي. لحظر رمز أرسل لي رقمه.",
      codesCount: "رموز فعّالة",
    },
    en: {
      welcome: "Welcome",
      intro: "The smart guide (places, maps and public transport in every country) is for members. Sign in with the personal code you receive after paying.",
      back: "Back to trips",
      payOnce: "one-time",
      howTitle: "How do I get a code?",
      how1: "Send us a WhatsApp message",
      how2: "Pay $10 by Bit, PayBox, PayPal or cash",
      how3: "Receive your personal code and sign in",
      buy: "Get a code on WhatsApp",
      waBuy: "Hi, I'd like to buy access to the ASHRF Remas Tours app ($10).",
      code: "Entry code",
      enter: "Enter",
      checking: "Checking…",
      bad: "That code is wrong or no longer active. Check it and try again.",
      logout: "Sign out",
      adminTitle: "Admin",
      calcTitle: "Price & profit calculator",
      calcHint: "Enter your cost (flight, hotel or package) to get the customer price with your net profit.",
      cost: "Supplier cost",
      margin: "Net profit (%)",
      payFee: "Payment fee (%)",
      payFeeHint: "Bit/cash: 0 · PayPal: about 4.4",
      extra: "Extra fixed costs",
      price: "Customer price",
      profit: "Your profit",
      codesTitle: "Entry codes",
      codesText: "Your code list is in codes.csv. Give each paying customer the next code. To block a code, send me its number.",
      codesCount: "active codes",
    },
  };
  const t = (k) => (T[App.getLang()] || T.en)[k] || T.en[k] || k;

  const gate = document.getElementById("gate");
  const gateBody = document.getElementById("gateBody");

  const normalize = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^ASHRF/, "");
  async function hashCode(code) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(normalize(code)), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(CODES.salt), iterations: CODES.iterations, hash: "SHA-256" }, key, 256);
    return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  const roleOf = (h) => (CODES.admin.includes(h) ? "admin" : CODES.customers.includes(h) ? "customer" : null);

  const store = {
    get() { try { return localStorage.getItem(KEY); } catch { return null; } },
    set(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch { /* storage unavailable */ } },
  };

  let error = "";
  let busy = false;
  let role = null;        // "customer" | "admin" once a valid code (or a Play purchase) is present
  let pendingView = null; // member view the visitor tried to open

  window.Access = {
    ok: () => !!role,
    prompt(view) { pendingView = view; lock(); },
  };

  function render() {
    document.documentElement.dir = window.I18N[App.getLang()].dir;
    const wa = C.contact.whatsapp ? `https://wa.me/${encodeURIComponent(C.contact.whatsapp)}?text=${encodeURIComponent(t("waBuy"))}` : null;
    const amount = Number((C.price && C.price.amount) || 10).toFixed(0);
    gateBody.innerHTML = `
      <img class="gate-logo" src="${esc(C.logo)}" data-fallback="${esc(C.logoFallback)}" alt="logo">
      <h1 class="gate-name">${esc(C.businessName)}</h1>
      <p class="gate-tagline">${esc(C.tagline)}</p>
      <div class="gate-card">
        <h2>${esc(t("welcome"))}</h2>
        <p class="muted">${esc(t("intro"))}</p>
        <form id="codeForm" class="gate-form" autocomplete="off">
          <input id="codeInput" name="code" dir="ltr" autocapitalize="characters" spellcheck="false" placeholder="ASHRF-XXXX-XXXX" aria-label="${esc(t("code"))}" required>
          <button class="gate-btn primary" type="submit" ${busy ? "disabled" : ""}>${esc(busy ? t("checking") : t("enter"))}</button>
        </form>
        <p class="gate-error" ${error ? "" : "hidden"}>${esc(error)}</p>
        <button type="button" class="link-btn gate-back" data-gate-back>← ${esc(t("back"))}</button>
        <div class="gate-how">
          <div class="price"><span dir="ltr">$${esc(amount)}</span><small>${esc(t("payOnce"))}</small></div>
          <b>${esc(t("howTitle"))}</b>
          <ol><li>${esc(t("how1"))}</li><li>${esc(t("how2"))}</li><li>${esc(t("how3"))}</li></ol>
          ${wa ? `<a class="gate-btn wa" target="_blank" rel="noopener" href="${esc(wa)}">💬 ${esc(t("buy"))}</a>` : ""}
        </div>
      </div>
      <div class="gate-langs">${Object.keys(window.I18N).map((k) =>
        `<button data-gate-lang="${k}" class="${k === App.getLang() ? "active" : ""}">${esc(window.I18N[k].langName)}</button>`).join("")}</div>`;
    fixLogo();
  }

  function fixLogo() {
    const img = gateBody.querySelector("img[data-fallback]");
    if (img) img.addEventListener("error", () => { img.src = img.dataset.fallback; }, { once: true });
  }

  function lock() {
    gate.hidden = false;
    document.body.classList.add("locked");
    render();
  }

  function openApp() {
    gate.hidden = true;
    document.body.classList.remove("locked");
  }

  function unlock(r) {
    role = r;
    openApp();
    const box = document.getElementById("logoutBox");
    box.hidden = false;
    document.getElementById("logoutUser").textContent = r === "admin" ? "👑 Admin" : "✅";
    if (r === "admin") setupAdmin();
    App.start();
    if (pendingView) { const v = pendingView; pendingView = null; App.showView(v); }
  }

  // ---------- admin: profit calculator ----------
  function setupAdmin() {
    document.getElementById("adminTabBtn").hidden = false;
    const sections = document.getElementById("adminSections");
    if (sections) sections.hidden = true;
    renderAdmin();
  }

  function renderAdmin() {
    const panel = document.getElementById("adminPanel");
    if (!panel || document.getElementById("adminTabBtn").hidden) return;
    const active = CODES.customers.filter(Boolean).length;
    panel.innerHTML = `
      <h2>${esc(t("adminTitle"))}</h2>
      <div class="box">
        <h3>🧮 ${esc(t("calcTitle"))}</h3>
        <p class="muted small">${esc(t("calcHint"))}</p>
        <div class="q-row">
          <div class="q-field"><label for="cCost">${esc(t("cost"))}</label><input id="cCost" type="number" inputmode="decimal" min="0" value="1000"></div>
          <div class="q-field"><label for="cExtra">${esc(t("extra"))}</label><input id="cExtra" type="number" inputmode="decimal" min="0" value="0"></div>
        </div>
        <div class="q-row">
          <div class="q-field"><label for="cMargin">${esc(t("margin"))}</label><input id="cMargin" type="number" inputmode="decimal" min="0" value="20"></div>
          <div class="q-field"><label for="cFee">${esc(t("payFee"))}</label><input id="cFee" type="number" inputmode="decimal" min="0" max="20" step="0.1" value="0"><small class="muted">${esc(t("payFeeHint"))}</small></div>
        </div>
        <div class="money-grid calc-out">
          <div><small>${esc(t("price"))}</small><b id="cPrice" dir="ltr">—</b></div>
          <div class="profit"><small>${esc(t("profit"))}</small><b id="cProfit" dir="ltr">—</b></div>
        </div>
      </div>
      <div class="box">
        <h3>🔑 ${esc(t("codesTitle"))}</h3>
        <p><b>${active}</b> ${esc(t("codesCount"))}</p>
        <p class="muted small">${esc(t("codesText"))}</p>
      </div>`;
    calc();
  }

  function calc() {
    const n = (id) => Math.max(0, parseFloat(document.getElementById(id)?.value) || 0);
    const cost = n("cCost"), extra = n("cExtra"), margin = n("cMargin") / 100, fee = Math.min(n("cFee"), 50) / 100;
    const price = Math.ceil((cost * (1 + margin) + extra) / (1 - fee));
    const profit = price * (1 - fee) - extra - cost;
    document.getElementById("cPrice").textContent = price.toLocaleString();
    document.getElementById("cProfit").textContent = (Math.round(profit * 100) / 100).toLocaleString();
  }

  // ---------- events ----------
  gate.addEventListener("submit", async (e) => {
    if (e.target.id !== "codeForm") return;
    e.preventDefault();
    const code = e.target.code.value;
    busy = true; error = ""; render();
    try {
      const h = await hashCode(code);
      const r = roleOf(h);
      if (!r) throw new Error("bad code");
      store.set(h);
      busy = false;
      unlock(r);
    } catch {
      busy = false; error = t("bad"); render();
      const input = document.getElementById("codeInput");
      if (input) { input.value = code; input.focus(); }
    }
  });

  gate.addEventListener("click", (e) => {
    const b = e.target.closest("[data-gate-lang]");
    if (b) { App.setLang(b.dataset.gateLang); render(); return; }
    if (e.target.closest("[data-gate-back]")) { pendingView = null; error = ""; openApp(); App.showView("trips"); }
  });

  document.addEventListener("input", (e) => { if (e.target.closest("#adminPanel input")) calc(); });
  document.addEventListener("langchange", renderAdmin);
  document.getElementById("logoutBtn").addEventListener("click", () => {
    store.set(null);
    location.reload();
  });

  // ---------- boot ----------
  // Bought on Google Play: the store app (Trusted Web Activity) opens the site with an
  // android-app:// referrer for our package, so it skips the code screen.
  const PLAY = "play:" + (C.playPackageId || "");
  if (C.playPackageId && document.referrer.startsWith("android-app://" + C.playPackageId)) store.set(PLAY);
  if (C.playPackageId && store.get() === PLAY) {
    unlock("customer");
    document.getElementById("logoutBox").hidden = true; // nothing to sign out of for store buyers
    return;
  }

  const saved = store.get();
  const savedRole = saved && roleOf(saved);
  if (savedRole) unlock(savedRole);
  else { store.set(null); openApp(); } // trips store is open to everyone; the guide asks for a code
})();
