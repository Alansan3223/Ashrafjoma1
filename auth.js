/* Access gate: sign-in → one-time PayPal payment → manual approval by the owner.
 * Users live in Firestore `users/{uid}`; firestore.rules make sure a user can never
 * approve themselves — only the admin e-mails can change `status`.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile, signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, updateDoc, onSnapshot, collection, query, orderBy, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const C = window.APP_CONFIG;
const App = window.App;
// This module runs only in "firebase" access mode; "codes" mode is handled by codes-gate.js.
const ACTIVE = (C.accessMode || "firebase") === "firebase";

// Shared Firebase handles for other modules (quotes.js). `ready` resolves once the user is approved.
export const fb = { app: null, auth: null, db: null, user: null, isAdmin: false };
let resolveReady;
export const ready = new Promise((r) => (resolveReady = r));
const esc = App.esc;

const T = {
  he: {
    welcome: "ברוכים הבאים",
    intro: "האפליקציה מיועדת למנויים בלבד. התחברו כדי להמשיך.",
    google: "התחברות עם Google",
    or: "או",
    name: "שם מלא",
    email: "אימייל",
    password: "סיסמה (לפחות 6 תווים)",
    phone: "טלפון (לא חובה)",
    login: "התחברות",
    register: "הרשמה",
    toRegister: "אין לכם חשבון? הרשמה",
    toLogin: "יש לכם חשבון? התחברות",
    forgot: "שכחתי סיסמה",
    resetSent: "נשלח מייל לאיפוס סיסמה",
    payTitle: "הצטרפות לאפליקציה",
    payText: "תשלום חד-פעמי לגישה מלאה לכל המדינות, המסעדות, האטרקציות ודרכי ההגעה בתחבורה ציבורית.",
    payOnce: "חד-פעמי",
    payAfter: "אחרי התשלום נאשר את החשבון שלכם בהקדם.",
    payDone: "התשלום התקבל! תודה.",
    payError: "התשלום לא הושלם. נסו שוב.",
    pendingTitle: "ממתין לאישור",
    pendingText: "התשלום התקבל והחשבון שלכם ממתין לאישור. כשנאשר אותו, האפליקציה תיפתח כאן אוטומטית.",
    pendingWa: "עדכנו אותנו בוואטסאפ",
    waPaid: "שלום, שילמתי על האפליקציה ואשמח לאישור. מייל: ",
    blockedTitle: "הגישה נחסמה",
    blockedText: "החשבון הזה לא מאושר לשימוש באפליקציה. לפרטים צרו קשר.",
    contact: "צרו קשר",
    logout: "התנתקות",
    loggedAs: "מחובר/ת כ-",
    notConfigured: "האפליקציה עוד לא הוגדרה: חסרים פרטי Firebase בקובץ config.js. ראו README.",
    paypalMissing: "התשלום עוד לא הוגדר (חסר PayPal Client ID בקובץ config.js).",
    errGeneric: "משהו השתבש. נסו שוב.",
    "auth/invalid-credential": "אימייל או סיסמה שגויים",
    "auth/wrong-password": "אימייל או סיסמה שגויים",
    "auth/user-not-found": "אימייל או סיסמה שגויים",
    "auth/email-already-in-use": "המייל כבר רשום — נסו להתחבר",
    "auth/weak-password": "הסיסמה קצרה מדי",
    "auth/invalid-email": "כתובת מייל לא תקינה",
    loading: "טוען…",
    // admin
    adminTab: "ניהול",
    adminTitle: "ניהול משתמשים",
    adminHint: "לפני אישור, בדקו בחשבון ה-PayPal שהתשלום עם מספר ההזמנה הזה באמת התקבל.",
    st_pending: "ממתינים",
    st_approved: "מאושרים",
    st_blocked: "חסומים",
    all: "הכול",
    paid: "שילם",
    notPaid: "לא שילם",
    order: "הזמנה",
    payer: "משלם",
    joined: "נרשם",
    approve: "אישור",
    block: "חסימה",
    unblock: "החזרה להמתנה",
    noUsers: "אין משתמשים ברשימה הזו",
    revenue: "הכנסות",
  },
  ar: {
    welcome: "أهلًا وسهلًا",
    intro: "التطبيق للمشتركين فقط. سجّل الدخول للمتابعة.",
    google: "الدخول عبر Google",
    or: "أو",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    password: "كلمة المرور (6 أحرف على الأقل)",
    phone: "الهاتف (اختياري)",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    toRegister: "ليس لديك حساب؟ أنشئ حسابًا",
    toLogin: "لديك حساب؟ سجّل الدخول",
    forgot: "نسيت كلمة المرور",
    resetSent: "تم إرسال رسالة لإعادة تعيين كلمة المرور",
    payTitle: "الانضمام إلى التطبيق",
    payText: "دفعة لمرة واحدة للوصول الكامل لكل الدول والمطاعم والمعالم وطرق الوصول بالمواصلات العامة.",
    payOnce: "لمرة واحدة",
    payAfter: "بعد الدفع سنوافق على حسابك في أقرب وقت.",
    payDone: "تم استلام الدفع! شكرًا.",
    payError: "لم تكتمل عملية الدفع. حاول مرة أخرى.",
    pendingTitle: "بانتظار الموافقة",
    pendingText: "تم استلام الدفع وحسابك بانتظار الموافقة. عند الموافقة سيفتح التطبيق هنا تلقائيًا.",
    pendingWa: "أبلغنا عبر واتساب",
    waPaid: "مرحبًا، دفعت ثمن التطبيق وأرجو الموافقة. البريد: ",
    blockedTitle: "تم حظر الوصول",
    blockedText: "هذا الحساب غير مصرّح له باستخدام التطبيق. للتفاصيل تواصل معنا.",
    contact: "تواصل معنا",
    logout: "تسجيل الخروج",
    loggedAs: "مسجّل باسم ",
    notConfigured: "لم يتم إعداد التطبيق بعد: تفاصيل Firebase مفقودة في config.js. راجع README.",
    paypalMissing: "لم يتم إعداد الدفع بعد (PayPal Client ID مفقود في config.js).",
    errGeneric: "حدث خطأ. حاول مرة أخرى.",
    "auth/invalid-credential": "البريد أو كلمة المرور غير صحيحة",
    "auth/wrong-password": "البريد أو كلمة المرور غير صحيحة",
    "auth/user-not-found": "البريد أو كلمة المرور غير صحيحة",
    "auth/email-already-in-use": "البريد مسجّل مسبقًا — جرّب تسجيل الدخول",
    "auth/weak-password": "كلمة المرور قصيرة جدًا",
    "auth/invalid-email": "بريد إلكتروني غير صالح",
    loading: "جارٍ التحميل…",
    adminTab: "الإدارة",
    adminTitle: "إدارة المستخدمين",
    adminHint: "قبل الموافقة، تحقق في حساب PayPal من استلام الدفعة برقم الطلب هذا.",
    st_pending: "بالانتظار",
    st_approved: "موافق عليهم",
    st_blocked: "محظورون",
    all: "الكل",
    paid: "دفع",
    notPaid: "لم يدفع",
    order: "الطلب",
    payer: "الدافع",
    joined: "انضم",
    approve: "موافقة",
    block: "حظر",
    unblock: "إعادة للانتظار",
    noUsers: "لا يوجد مستخدمون في هذه القائمة",
    revenue: "الإيرادات",
  },
  en: {
    welcome: "Welcome",
    intro: "This app is for members only. Sign in to continue.",
    google: "Continue with Google",
    or: "or",
    name: "Full name",
    email: "Email",
    password: "Password (min. 6 characters)",
    phone: "Phone (optional)",
    login: "Sign in",
    register: "Create account",
    toRegister: "No account? Sign up",
    toLogin: "Have an account? Sign in",
    forgot: "Forgot password",
    resetSent: "Password reset email sent",
    payTitle: "Join the app",
    payText: "One-time payment for full access to every country, restaurant, attraction and public-transport directions.",
    payOnce: "one-time",
    payAfter: "After payment we'll approve your account as soon as possible.",
    payDone: "Payment received — thank you!",
    payError: "The payment didn't go through. Please try again.",
    pendingTitle: "Waiting for approval",
    pendingText: "Payment received and your account is awaiting approval. The app will open here automatically once approved.",
    pendingWa: "Let us know on WhatsApp",
    waPaid: "Hi, I paid for the app and would like to be approved. Email: ",
    blockedTitle: "Access blocked",
    blockedText: "This account isn't allowed to use the app. Please contact us.",
    contact: "Contact us",
    logout: "Sign out",
    loggedAs: "Signed in as ",
    notConfigured: "The app isn't set up yet: Firebase details are missing in config.js. See README.",
    paypalMissing: "Payments aren't set up yet (PayPal Client ID missing in config.js).",
    errGeneric: "Something went wrong. Please try again.",
    "auth/invalid-credential": "Wrong email or password",
    "auth/wrong-password": "Wrong email or password",
    "auth/user-not-found": "Wrong email or password",
    "auth/email-already-in-use": "Email already registered — try signing in",
    "auth/weak-password": "Password is too short",
    "auth/invalid-email": "Invalid email address",
    loading: "Loading…",
    adminTab: "Admin",
    adminTitle: "User management",
    adminHint: "Before approving, check in your PayPal account that the payment with this order ID really arrived.",
    st_pending: "Pending",
    st_approved: "Approved",
    st_blocked: "Blocked",
    all: "All",
    paid: "Paid",
    notPaid: "Not paid",
    order: "Order",
    payer: "Payer",
    joined: "Joined",
    approve: "Approve",
    block: "Block",
    unblock: "Back to pending",
    noUsers: "No users in this list",
    revenue: "Revenue",
  },
};

const lang = () => App.getLang();
const t = (k) => (T[lang()] && T[lang()][k]) || T.en[k] || k;

const gate = document.getElementById("gate");
const gateBody = document.getElementById("gateBody");

let auth, db;
let currentUser = null;
let currentDoc = null;
let unsubUser = null;
let unsubAdmin = null;
let screen = "loading";
let screenOpts = {};

const isAdminEmail = (email) =>
  !!email && (C.adminEmails || []).map((e) => e.toLowerCase()).includes(email.toLowerCase());

// ---------- screens ----------
function logoHtml() {
  return `<img class="gate-logo" src="${esc(C.logo)}" onerror="this.onerror=null;this.src='${esc(C.logoFallback)}'" alt="logo">
    <h1 class="gate-name">${esc(C.businessName)}</h1>
    <p class="gate-tagline">${esc(C.tagline)}</p>`;
}

function langSwitchHtml() {
  return `<div class="gate-langs">${Object.keys(window.I18N).map((k) =>
    `<button data-gate-lang="${k}" class="${k === lang() ? "active" : ""}">${esc(window.I18N[k].langName)}</button>`).join("")}</div>`;
}

function waLink(text) {
  return C.contact.whatsapp ? `https://wa.me/${encodeURIComponent(C.contact.whatsapp)}?text=${encodeURIComponent(text)}` : null;
}

function userBarHtml() {
  if (!currentUser) return "";
  return `<p class="gate-user">${esc(t("loggedAs"))}<b dir="ltr">${esc(currentUser.email || currentUser.displayName || "")}</b>
    · <button class="link-btn" data-gate-action="logout">${esc(t("logout"))}</button></p>`;
}

function render() {
  document.documentElement.dir = window.I18N[lang()].dir;
  let html = "";
  switch (screen) {
    case "loading":
      html = `<div class="spinner"></div><p class="muted">${esc(t("loading"))}</p>`;
      break;
    case "config":
      html = `<p class="gate-error">${esc(t("notConfigured"))}</p>`;
      break;
    case "login": {
      const reg = !!screenOpts.register;
      html = `
        <h2>${esc(t("welcome"))}</h2>
        <p class="muted">${esc(t("intro"))}</p>
        <button class="gate-btn google" data-gate-action="google">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
          ${esc(t("google"))}
        </button>
        <div class="gate-or"><span>${esc(t("or"))}</span></div>
        <form id="emailForm" class="gate-form">
          ${reg ? `<input name="name" autocomplete="name" placeholder="${esc(t("name"))}" required>` : ""}
          <input name="email" type="email" autocomplete="email" dir="ltr" placeholder="${esc(t("email"))}" required>
          <input name="password" type="password" autocomplete="${reg ? "new-password" : "current-password"}" dir="ltr" minlength="6" placeholder="${esc(t("password"))}" required>
          ${reg ? `<input name="phone" type="tel" autocomplete="tel" dir="ltr" placeholder="${esc(t("phone"))}">` : ""}
          <button class="gate-btn primary" type="submit">${esc(reg ? t("register") : t("login"))}</button>
        </form>
        <p class="gate-error" id="gateError" ${screenOpts.error ? "" : "hidden"}>${esc(screenOpts.error || "")}</p>
        <p class="gate-links">
          <button class="link-btn" data-gate-action="${reg ? "toLogin" : "toRegister"}">${esc(reg ? t("toLogin") : t("toRegister"))}</button>
          ${reg ? "" : ` · <button class="link-btn" data-gate-action="forgot">${esc(t("forgot"))}</button>`}
        </p>`;
      break;
    }
    case "pay":
      html = `
        <h2>${esc(t("payTitle"))}</h2>
        <div class="price"><span dir="ltr">$${esc(Number(C.price.amount).toFixed(0))}</span><small>${esc(t("payOnce"))}</small></div>
        <p class="muted">${esc(t("payText"))}</p>
        <div id="paypalButtons" class="paypal-box">${C.paypal && C.paypal.clientId ? `<div class="spinner"></div>` : `<p class="gate-error">${esc(t("paypalMissing"))}</p>`}</div>
        <p class="gate-error" id="gateError" ${screenOpts.error ? "" : "hidden"}>${esc(screenOpts.error || "")}</p>
        <p class="muted small">${esc(t("payAfter"))}</p>
        ${userBarHtml()}`;
      break;
    case "pending": {
      const wa = waLink(t("waPaid") + (currentUser?.email || ""));
      html = `
        <div class="gate-icon">⏳</div>
        <h2>${esc(t("pendingTitle"))}</h2>
        <p class="muted">${esc(t("pendingText"))}</p>
        ${currentDoc?.paypalOrderId ? `<p class="small">${esc(t("order"))}: <code dir="ltr">${esc(currentDoc.paypalOrderId)}</code></p>` : ""}
        ${wa ? `<a class="gate-btn wa" target="_blank" rel="noopener" href="${esc(wa)}">💬 ${esc(t("pendingWa"))}</a>` : ""}
        ${userBarHtml()}`;
      break;
    }
    case "blocked": {
      const wa = waLink(t("contact"));
      html = `
        <div class="gate-icon">🔒</div>
        <h2>${esc(t("blockedTitle"))}</h2>
        <p class="muted">${esc(t("blockedText"))}</p>
        ${wa ? `<a class="gate-btn wa" target="_blank" rel="noopener" href="${esc(wa)}">💬 ${esc(t("contact"))}</a>` : ""}
        ${userBarHtml()}`;
      break;
    }
  }
  gateBody.innerHTML = logoHtml() + `<div class="gate-card">${html}</div>` + langSwitchHtml();
  if (screen === "pay") mountPayPal();
}

function show(name, opts = {}) {
  screen = name;
  screenOpts = opts;
  gate.hidden = false;
  document.body.classList.add("locked");
  render();
}

function showError(msg) {
  screenOpts.error = msg;
  const el = document.getElementById("gateError");
  if (el) { el.textContent = msg; el.hidden = false; }
}

function errMsg(e) {
  return (e && e.code && T[lang()][e.code]) || t("errGeneric");
}

function unlock() {
  fb.user = currentUser;
  fb.isAdmin = isAdminEmail(currentUser.email) && currentUser.emailVerified;
  resolveReady(fb);
  gate.hidden = true;
  document.body.classList.remove("locked");
  document.getElementById("logoutBox").hidden = false;
  document.getElementById("logoutUser").textContent = currentUser.email || currentUser.displayName || "";
  App.start();
}

// ---------- PayPal ----------
let paypalLoading = null;
function loadPayPal() {
  if (window.paypal) return Promise.resolve();
  if (!paypalLoading) {
    paypalLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(C.paypal.clientId)}&currency=${encodeURIComponent(C.price.currency)}&intent=capture`;
      s.onload = resolve;
      s.onerror = () => { paypalLoading = null; reject(new Error("paypal sdk")); };
      document.head.appendChild(s);
    });
  }
  return paypalLoading;
}

async function mountPayPal() {
  if (!C.paypal || !C.paypal.clientId) return;
  try {
    await loadPayPal();
  } catch {
    showError(t("errGeneric"));
    return;
  }
  const box = document.getElementById("paypalButtons");
  if (!box || screen !== "pay") return;
  box.innerHTML = "";
  window.paypal.Buttons({
    style: { layout: "vertical", shape: "pill", label: "pay" },
    createOrder: (data, actions) => actions.order.create({
      intent: "CAPTURE",
      purchase_units: [{
        description: `${C.businessName} — app access`,
        custom_id: currentUser.uid,
        amount: { currency_code: C.price.currency, value: C.price.amount },
      }],
      application_context: { shipping_preference: "NO_SHIPPING", brand_name: C.businessName },
    }),
    onApprove: async (data, actions) => {
      try {
        const order = await actions.order.capture();
        if (order.status !== "COMPLETED") throw new Error(order.status);
        const unit = order.purchase_units?.[0];
        const capture = unit?.payments?.captures?.[0];
        await updateDoc(doc(db, "users", currentUser.uid), {
          paid: true,
          paypalOrderId: order.id,
          paypalCaptureId: capture?.id || "",
          payerEmail: order.payer?.email_address || "",
          payerName: [order.payer?.name?.given_name, order.payer?.name?.surname].filter(Boolean).join(" "),
          amount: capture?.amount?.value || C.price.amount,
          currency: capture?.amount?.currency_code || C.price.currency,
          paidAt: serverTimestamp(),
        });
        // the user-doc listener moves the screen to "pending"
      } catch (e) {
        console.error(e);
        showError(t("payError"));
      }
    },
    onError: (e) => { console.error(e); showError(t("payError")); },
  }).render(box);
}

// ---------- user document ----------
function watchUser(user) {
  if (unsubUser) unsubUser();
  const ref = doc(db, "users", user.uid);
  unsubUser = onSnapshot(ref, async (snap) => {
    if (!snap.exists()) {
      try {
        await setDoc(ref, {
          email: user.email || "",
          name: user.displayName || pendingProfile.name || "",
          phone: pendingProfile.phone || "",
          lang: lang(),
          status: "pending",
          paid: false,
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        console.error(e);
        show("login", { error: errMsg(e) });
      }
      return;
    }
    currentDoc = snap.data();
    if (isAdminEmail(user.email) && user.emailVerified) {
      setupAdmin();
      return unlock();
    }
    if (currentDoc.status === "approved") return unlock();
    if (currentDoc.status === "blocked") return show("blocked");
    show(currentDoc.paid ? "pending" : "pay");
  }, (e) => {
    console.error(e);
    show("login", { error: errMsg(e) });
  });
}

let pendingProfile = {};

// ---------- admin ----------
let adminFilter = "pending";
let adminUsers = [];

function setupAdmin() {
  document.getElementById("adminTabBtn").hidden = false;
  if (unsubAdmin) return;
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  unsubAdmin = onSnapshot(q, (snap) => {
    adminUsers = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((u) => !isAdminEmail(u.email));
    renderAdmin();
  }, (e) => console.error(e));
}

function fmtDate(ts) {
  if (!ts || !ts.toDate) return "";
  return ts.toDate().toLocaleString(lang() === "ar" ? "ar" : lang(), { dateStyle: "short", timeStyle: "short" });
}

function renderAdmin() {
  const box = document.getElementById("adminPanel");
  if (!box) return;
  const counts = { pending: 0, approved: 0, blocked: 0 };
  let revenue = 0;
  adminUsers.forEach((u) => {
    counts[u.status] = (counts[u.status] || 0) + 1;
    if (u.paid) revenue += parseFloat(u.amount) || 0;
  });
  document.getElementById("adminBadge").textContent = counts.pending ? String(counts.pending) : "";
  const list = adminUsers.filter((u) => adminFilter === "all" || u.status === adminFilter);
  const tab = (k, label, n) => `<button data-admin-filter="${k}" class="${adminFilter === k ? "active" : ""}">${esc(label)}${n != null ? ` (${n})` : ""}</button>`;
  box.innerHTML = `
    <h2>${esc(t("adminTitle"))}</h2>
    <div class="admin-stats">
      <div><b>${counts.pending}</b><small>${esc(t("st_pending"))}</small></div>
      <div><b>${counts.approved}</b><small>${esc(t("st_approved"))}</small></div>
      <div><b dir="ltr">$${revenue.toFixed(0)}</b><small>${esc(t("revenue"))}</small></div>
    </div>
    <p class="muted small">ℹ️ ${esc(t("adminHint"))}</p>
    <div class="seg admin-seg">
      ${tab("pending", t("st_pending"), counts.pending)}
      ${tab("approved", t("st_approved"), counts.approved)}
      ${tab("blocked", t("st_blocked"), counts.blocked)}
      ${tab("all", t("all"))}
    </div>
    <div class="admin-list">
      ${list.length ? list.map((u) => `
        <div class="admin-user">
          <div class="admin-user-head">
            <div>
              <b>${esc(u.name || u.email)}</b>
              <div class="muted small" dir="ltr">${esc(u.email)}${u.phone ? " · " + esc(u.phone) : ""}</div>
            </div>
            <span class="tag ${u.paid ? "paid" : "unpaid"}">${u.paid ? `✅ ${esc(t("paid"))} $${esc(u.amount || "")}` : `⌛ ${esc(t("notPaid"))}`}</span>
          </div>
          <div class="muted small">
            ${esc(t("joined"))}: ${esc(fmtDate(u.createdAt))}
            ${u.paypalOrderId ? `<br>${esc(t("order"))}: <code dir="ltr">${esc(u.paypalOrderId)}</code>` : ""}
            ${u.payerEmail ? `<br>${esc(t("payer"))}: <span dir="ltr">${esc(u.payerName || "")} ${esc(u.payerEmail)}</span>` : ""}
          </div>
          <div class="admin-actions">
            ${u.status !== "approved" ? `<button class="pill primary" data-admin-set="approved" data-uid="${esc(u.id)}">✓ ${esc(t("approve"))}</button>` : ""}
            ${u.status !== "blocked" ? `<button class="pill" data-admin-set="blocked" data-uid="${esc(u.id)}">⛔ ${esc(t("block"))}</button>` : ""}
            ${u.status === "blocked" ? `<button class="pill" data-admin-set="pending" data-uid="${esc(u.id)}">↩ ${esc(t("unblock"))}</button>` : ""}
          </div>
        </div>`).join("") : `<div class="empty">${esc(t("noUsers"))}</div>`}
    </div>`;
}

async function setStatus(uid, status) {
  try {
    await updateDoc(doc(db, "users", uid), {
      status,
      reviewedAt: serverTimestamp(),
      reviewedBy: currentUser.email,
    });
  } catch (e) {
    console.error(e);
    alert(t("errGeneric"));
  }
}

// ---------- events ----------
gate.addEventListener("click", async (e) => {
  if (!ACTIVE) return;
  const langBtn = e.target.closest("[data-gate-lang]");
  if (langBtn) {
    App.setLang(langBtn.dataset.gateLang);
    render();
    return;
  }
  const a = e.target.closest("[data-gate-action]");
  if (!a) return;
  const action = a.dataset.gateAction;
  if (action === "toRegister") show("login", { register: true });
  if (action === "toLogin") show("login", { register: false });
  if (action === "logout") doLogout();
  if (action === "forgot") {
    const email = gate.querySelector('input[name="email"]')?.value.trim();
    if (!email) { showError(t("auth/invalid-email")); return; }
    try { await sendPasswordResetEmail(auth, email); showError(t("resetSent")); } catch (err) { showError(errMsg(err)); }
  }
  if (action === "google") {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment", "auth/cancelled-popup-request"].includes(err.code)) {
        await signInWithRedirect(auth, provider);
      } else if (err.code !== "auth/popup-closed-by-user") {
        showError(errMsg(err));
      }
    }
  }
});

gate.addEventListener("submit", async (e) => {
  if (!ACTIVE) return;
  if (e.target.id !== "emailForm") return;
  e.preventDefault();
  const f = new FormData(e.target);
  const email = String(f.get("email") || "").trim();
  const password = String(f.get("password") || "");
  const btn = e.target.querySelector("button[type=submit]");
  btn.disabled = true;
  try {
    if (screenOpts.register) {
      pendingProfile = { name: String(f.get("name") || "").trim(), phone: String(f.get("phone") || "").trim() };
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (pendingProfile.name) await updateProfile(cred.user, { displayName: pendingProfile.name });
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (err) {
    showError(errMsg(err));
    btn.disabled = false;
  }
});

document.addEventListener("click", (e) => {
  if (!ACTIVE) return;
  if (e.target.closest("#logoutBtn")) { doLogout(); return; }
  const f = e.target.closest("[data-admin-filter]");
  if (f) { adminFilter = f.dataset.adminFilter; renderAdmin(); return; }
  const s = e.target.closest("[data-admin-set]");
  if (s) setStatus(s.dataset.uid, s.dataset.adminSet);
});

document.addEventListener("langchange", () => { if (!ACTIVE) return; renderAdmin(); if (!gate.hidden) render(); });

async function doLogout() {
  await signOut(auth);
  location.hash = "";
  location.reload();
}

// ---------- boot ----------
function boot() {
  if (!ACTIVE) return;
  const fbConf = C.firebase || {};
  if (!fbConf.apiKey || !fbConf.projectId) { show("config"); return; }
  show("loading");
  const app = initializeApp(fbConf);
  auth = getAuth(app);
  db = getFirestore(app);
  Object.assign(fb, { app, auth, db });
  getRedirectResult(auth).catch((e) => show("login", { error: errMsg(e) }));
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (!user) {
      if (unsubUser) { unsubUser(); unsubUser = null; }
      show("login", { register: false });
      return;
    }
    show("loading");
    watchUser(user);
  });
}

boot();
