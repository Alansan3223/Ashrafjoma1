/* ע.ל.נ — dental catalog with WhatsApp ordering. */
(() => {
  "use strict";
  const C = window.ALN_CONFIG;
  const CATS = window.ALN_CATEGORIES;
  const PRODUCTS = window.ALN_PRODUCTS;

  const STR = {
    he: {
      dir: "rtl", other: "العربية",
      search: "חיפוש מוצר או מק\"ט…", all: "הכול", tabCatalog: "קטלוג", tabCart: "הזמנה", tabAbout: "פרטים",
      cart: "ההזמנה שלי", emptyCart: "ההזמנה ריקה. בחרו מוצרים מהקטלוג.", noResults: "לא נמצאו מוצרים",
      add: "הוספה להזמנה", added: "נוסף להזמנה ✔", choose: "בחרו", quantity: "כמות",
      priceOnRequest: "מחיר לפי הצעה", sku: "מק\"ט", sample: "מוצר לדוגמה",
      clinicDetails: "פרטי המרפאה", clinic: "שם המרפאה", doctor: "שם הרופא/ה", phone: "טלפון", city: "יישוב", notes: "הערות",
      sendOrder: "שליחת ההזמנה בוואטסאפ", orderNote: "ההזמנה נשלחת אלינו בוואטסאפ. נחזור אליכם לאישור מחיר ומועד אספקה.",
      total: "סה\"כ משוער", items: "פריטים", pickAll: "בחרו את כל המידות",
      aboutText: "ספק שתלים, אבטמנטים, כלים כירורגיים וחומרי השתלת עצם למרפאות שיניים. הזמנה מהירה מהטלפון ואספקה ישירה למרפאה.",
      call: "התקשרו", whatsapp: "וואטסאפ", email: "אימייל", shareCatalog: "שיתוף הקטלוג",
      install: "התקנה בטלפון", installHint: "אנדרואיד (Chrome): תפריט ⋮ ← \"התקן אפליקציה\". אייפון (Safari): שיתוף ← \"הוסף למסך הבית\".",
      disclaimer: "המוצרים מיועדים לרופאי שיניים ולמרפאות בלבד. התמונות להמחשה.",
      proText: "קטלוג זה מיועד לאנשי מקצוע בתחום רפואת השיניים בלבד: רופאי שיניים, מרפאות ומעבדות.",
      proOk: "אני איש/אשת מקצוע — כניסה",
      copied: "הקישור הועתק",
      orderTitle: "הזמנה חדשה — ע.ל.נ",
    },
    ar: {
      dir: "rtl", other: "עברית",
      search: "ابحث عن منتج أو رقم…", all: "الكل", tabCatalog: "الكتالوج", tabCart: "الطلب", tabAbout: "معلومات",
      cart: "طلبي", emptyCart: "الطلب فارغ. اختر منتجات من الكتالوج.", noResults: "لا توجد منتجات",
      add: "أضف إلى الطلب", added: "تمت الإضافة ✔", choose: "اختر", quantity: "الكمية",
      priceOnRequest: "السعر حسب العرض", sku: "رقم", sample: "منتج للعرض",
      clinicDetails: "تفاصيل العيادة", clinic: "اسم العيادة", doctor: "اسم الطبيب/ة", phone: "الهاتف", city: "البلدة", notes: "ملاحظات",
      sendOrder: "إرسال الطلب عبر واتساب", orderNote: "يُرسل الطلب إلينا عبر واتساب. سنعاود الاتصال لتأكيد السعر وموعد التوريد.",
      total: "المجموع التقريبي", items: "منتجات", pickAll: "اختر كل المقاسات",
      aboutText: "مزوّد زرعات ودعامات وأدوات جراحية ومواد تطعيم عظم لعيادات الأسنان. طلب سريع من الهاتف وتوريد مباشر للعيادة.",
      call: "اتصال", whatsapp: "واتساب", email: "بريد", shareCatalog: "مشاركة الكتالوج",
      install: "التثبيت على الهاتف", installHint: "أندرويد (Chrome): القائمة ⋮ ← \"تثبيت التطبيق\". آيفون (Safari): مشاركة ← \"إضافة إلى الشاشة الرئيسية\".",
      disclaimer: "المنتجات مخصّصة لأطباء الأسنان والعيادات فقط. الصور للتوضيح.",
      proText: "هذا الكتالوج مخصّص للمهنيين في طب الأسنان فقط: أطباء أسنان، عيادات ومختبرات.",
      proOk: "أنا مهني/ة — دخول",
      copied: "تم نسخ الرابط",
      orderTitle: "طلب جديد — ع.ل.ن",
    },
  };

  // Simple line illustrations per category (no product photos yet).
  const ICONS = {
    implant: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M24 8h16v8H24z" fill="var(--accent)" stroke="none" opacity=".35"/><path d="M24 8h16v8H24zM22 16h20l-3 36c0 3-3 5-7 5s-7-2-7-5z"/><path d="M21 24h22M22 32h20M23 40h18M24 48h16"/></svg>',
    abutment: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M22 10h20l-3 22H25z" fill="var(--accent)" opacity=".25"/><path d="M22 10h20l-3 22H25zM20 32h24v6H20zM27 38h10v16H27z"/><path d="M27 44h10M27 50h10"/></svg>',
    screw: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><ellipse cx="32" cy="14" rx="14" ry="6" fill="var(--accent)" opacity=".3"/><ellipse cx="32" cy="14" rx="14" ry="6"/><path d="M26 18v30l6 6 6-6V18M26 26l12 4M26 34l12 4M26 42l12 4"/></svg>',
    coping: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 8h28v14H18z" fill="var(--accent)" opacity=".25"/><path d="M18 8h28v14H18zM24 22h16v10H24zM28 32h8v24h-8z"/><path d="M28 40h8M28 48h8"/></svg>',
    drill: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M26 6h12v14H26z" fill="var(--accent)" opacity=".3"/><path d="M26 6h12v14H26zM28 20h8v26l-4 12-4-12z"/><path d="M28 26l8 4M28 34l8 4M28 42l8 3"/></svg>',
    bone: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><rect x="14" y="18" width="36" height="36" rx="6"/><path d="M20 12h24v6H20z" fill="var(--accent)" opacity=".4"/><circle cx="24" cy="32" r="3"/><circle cx="34" cy="28" r="2.5"/><circle cx="40" cy="38" r="3"/><circle cx="28" cy="42" r="2.5"/><circle cx="36" cy="46" r="2"/></svg>',
  };

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  const state = {
    lang: store.get("aln-lang", (navigator.language || "").startsWith("ar") ? "ar" : C.defaultLanguage),
    cat: "all",
    q: "",
    cart: store.get("aln-cart", []), // [{ key, id, opts: [..], qty }]
  };

  const $ = (s) => document.querySelector(s);
  const t = (k) => STR[state.lang][k] ?? STR.he[k] ?? k;
  const L = (o) => (o && (o[state.lang] || o.he)) || "";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const catOf = (p) => CATS.find((c) => c.id === p.cat);
  const icon = (p) => ICONS[catOf(p)?.icon] || ICONS.implant;
  const money = (n) => new Intl.NumberFormat(state.lang, { style: "currency", currency: C.currency, maximumFractionDigits: 0 }).format(n);
  const priceText = (p) => (C.showPrices && p.price ? `${money(p.price)} / ${L(p.unit)}` : t("priceOnRequest"));

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg; el.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => (el.hidden = true), 2000);
  }

  // ---------- render ----------
  function applyLang() {
    const d = STR[state.lang];
    document.documentElement.lang = state.lang;
    document.documentElement.dir = d.dir;
    document.querySelectorAll("[data-t]").forEach((el) => (el.textContent = t(el.dataset.t)));
    $("#search").placeholder = t("search");
    $("#langBtn").textContent = d.other;
    $("#tagline").textContent = L(C.tagline);
    renderCats(); renderList(); renderCart();
  }

  function renderCats() {
    $("#cats").innerHTML = `<button class="cat ${state.cat === "all" ? "active" : ""}" data-cat="all">${esc(t("all"))}</button>` +
      CATS.map((c) => `<button class="cat ${state.cat === c.id ? "active" : ""}" data-cat="${c.id}">${ICONS[c.icon]}${esc(L(c.name))}</button>`).join("");
  }

  function matches(p) {
    const q = state.q.trim().toLowerCase();
    if (!q) return state.cat === "all" || p.cat === state.cat; // search always covers every category
    return [p.sku, p.name.he, p.name.ar, p.desc?.he, p.desc?.ar].some((s) => String(s || "").toLowerCase().includes(q));
  }

  function renderList() {
    const items = PRODUCTS.filter(matches);
    $("#list").innerHTML = items.length ? items.map((p) => `
      <button class="item" data-open="${p.id}">
        <div class="thumb" style="color:var(--primary)">${icon(p)}</div>
        <b>${esc(L(p.name))}</b>
        <span class="sku">${esc(p.sku)}</span>
        <span class="price">${esc(priceText(p))}</span>
      </button>`).join("") : `<div class="empty">${esc(t("noResults"))}</div>`;
  }

  function cartCount() { return state.cart.reduce((n, l) => n + l.qty, 0); }

  function renderCart() {
    $("#cartBadge").textContent = cartCount() || "";
    const box = $("#cartList");
    $("#orderForm").hidden = !state.cart.length;
    if (!state.cart.length) { box.innerHTML = `<div class="empty">🛒<br>${esc(t("emptyCart"))}</div>`; return; }
    let total = 0;
    box.innerHTML = state.cart.map((l) => {
      const p = byId(l.id);
      if (!p) return "";
      total += (p.price || 0) * l.qty;
      return `
      <div class="cart-row">
        <div class="thumb" style="color:var(--primary)">${icon(p)}</div>
        <div class="info"><b>${esc(L(p.name))}</b><span class="sku">${esc(p.sku)}${l.opts.length ? " · " + esc(l.opts.join(" / ")) : ""}</span></div>
        <div class="qty">
          <button data-qty="${esc(l.key)}" data-d="-1" aria-label="-">−</button>
          <span>${l.qty}</span>
          <button data-qty="${esc(l.key)}" data-d="1" aria-label="+">+</button>
        </div>
      </div>`;
    }).join("") + (C.showPrices ? `<div class="total"><span>${esc(t("total"))}</span><span>${esc(money(total))}</span></div>` : "");
  }

  // ---------- product sheet ----------
  let sel = { id: null, opts: [], qty: 1 };
  function openProduct(id) {
    const p = byId(id);
    if (!p) return;
    sel = { id, opts: p.options.map((o) => (o.values.length === 1 ? o.values[0] : null)), qty: 1 };
    drawProduct();
    $("#sheet").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function drawProduct() {
    const p = byId(sel.id);
    $("#sheetContent").innerHTML = `
      <div class="detail">
        <div class="thumb" style="color:var(--primary)">${icon(p)}</div>
        <h2>${esc(L(p.name))}</h2>
        <div class="muted small">${esc(t("sku"))}: <span dir="ltr">${esc(p.sku)}</span> · ${esc(L(catOf(p)?.name))}</div>
        <p>${esc(L(p.desc))}</p>
        <div class="price">${esc(priceText(p))}</div>
        <div class="opts">
          ${p.options.map((o, i) => `
            <div><div class="muted small"><b>${esc(L(o.label))}</b></div>
              <div class="chips">${o.values.map((v) => `<button class="chip ${sel.opts[i] === v ? "active" : ""}" data-opt="${i}" data-v="${esc(v)}">${esc(v)}</button>`).join("")}</div>
            </div>`).join("")}
        </div>
        <div class="add-row">
          <div class="qty">
            <button data-selqty="-1">−</button><span>${sel.qty}</span><button data-selqty="1">+</button>
          </div>
          <button class="btn primary" id="addBtn">🛒 ${esc(t("add"))}</button>
        </div>
      </div>`;
  }

  function addToCart() {
    const p = byId(sel.id);
    if (sel.opts.some((v) => v == null)) { toast(t("pickAll")); return; }
    const key = [p.id, ...sel.opts].join("|");
    const line = state.cart.find((l) => l.key === key);
    if (line) line.qty += sel.qty;
    else state.cart.push({ key, id: p.id, opts: sel.opts.slice(), qty: sel.qty });
    store.set("aln-cart", state.cart);
    renderCart();
    closeSheet();
    toast(t("added"));
  }

  function closeSheet() { $("#sheet").hidden = true; document.body.style.overflow = ""; }

  // ---------- order ----------
  function sendOrder(form) {
    const f = new FormData(form);
    const lines = state.cart.map((l, i) => {
      const p = byId(l.id);
      return `${i + 1}. ${L(p.name)} — ${p.sku}${l.opts.length ? " (" + l.opts.join(" / ") + ")" : ""} × ${l.qty}`;
    });
    const msg = [
      `*${t("orderTitle")}*`,
      `${t("clinic")}: ${f.get("clinic")}`,
      `${t("doctor")}: ${f.get("doctor")}`,
      `${t("phone")}: ${f.get("phone")}`,
      `${t("city")}: ${f.get("city")}`,
      "",
      ...lines,
      "",
      `${t("items")}: ${cartCount()}`,
      f.get("notes") ? `${t("notes")}: ${f.get("notes")}` : "",
    ].filter((x, i, a) => x !== "" || a[i - 1] !== "").join("\n");
    store.set("aln-clinic", { clinic: f.get("clinic"), doctor: f.get("doctor"), phone: f.get("phone"), city: f.get("city") });
    window.open(`https://wa.me/${encodeURIComponent(C.whatsapp)}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  }

  // ---------- views & events ----------
  function showView(v) {
    document.querySelectorAll(".view").forEach((el) => el.classList.toggle("active", el.id === `view-${v}`));
    document.querySelectorAll(".tabbar button").forEach((b) => b.classList.toggle("active", b.dataset.view === v));
    window.scrollTo(0, 0);
  }

  function bind() {
    $("#langBtn").onclick = () => { state.lang = state.lang === "he" ? "ar" : "he"; store.set("aln-lang", state.lang); applyLang(); if (!$("#sheet").hidden) drawProduct(); };
    $("#search").oninput = (e) => { state.q = e.target.value; renderList(); };
    document.querySelectorAll(".tabbar button").forEach((b) => (b.onclick = () => showView(b.dataset.view)));

    document.addEventListener("click", (e) => {
      const cat = e.target.closest("[data-cat]");
      if (cat) { state.cat = cat.dataset.cat; renderCats(); renderList(); return; }
      const open = e.target.closest("[data-open]");
      if (open) { openProduct(open.dataset.open); return; }
      const opt = e.target.closest("[data-opt]");
      if (opt) { sel.opts[+opt.dataset.opt] = opt.dataset.v; drawProduct(); return; }
      const sq = e.target.closest("[data-selqty]");
      if (sq) { sel.qty = Math.max(1, sel.qty + +sq.dataset.selqty); drawProduct(); return; }
      if (e.target.closest("#addBtn")) { addToCart(); return; }
      const q = e.target.closest("[data-qty]");
      if (q) {
        const l = state.cart.find((x) => x.key === q.dataset.qty);
        if (l) { l.qty += +q.dataset.d; if (l.qty < 1) state.cart = state.cart.filter((x) => x !== l); }
        store.set("aln-cart", state.cart); renderCart(); return;
      }
      if (e.target.closest("[data-close]")) closeSheet();
    });

    $("#orderForm").onsubmit = (e) => { e.preventDefault(); sendOrder(e.target); };
    const saved = store.get("aln-clinic", null);
    if (saved) Object.entries(saved).forEach(([k, v]) => { const el = $(`#orderForm [name="${k}"]`); if (el && v) el.value = v; });

    $("#shareBtn").onclick = async () => {
      const url = location.href.split("#")[0];
      try {
        if (navigator.share) await navigator.share({ title: C.name, text: L(C.tagline), url });
        else { await navigator.clipboard.writeText(url); toast(t("copied")); }
      } catch { /* cancelled */ }
    };
    $("#proOk").onclick = () => { store.set("aln-pro", true); $("#pro").hidden = true; };
  }

  function init() {
    const r = document.documentElement.style;
    r.setProperty("--primary", C.colors.primary);
    r.setProperty("--primary-dark", C.colors.primaryDark);
    r.setProperty("--accent", C.colors.accent);
    ["#logo", "#aboutLogo", "#proLogo"].forEach((s) => ($(s).src = C.logo));
    $("#brandName").textContent = C.name;
    $("#aboutName").textContent = C.name;
    $("#proName").textContent = C.name;
    $("#callBtn").href = `tel:${C.phone.replace(/[^\d+]/g, "")}`;
    $("#waBtn").href = `https://wa.me/${encodeURIComponent(C.whatsapp)}`;
    $("#mailBtn").href = `mailto:${C.email}`;
    if (!store.get("aln-pro", false)) $("#pro").hidden = false;
    bind();
    applyLang();
    if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  init();
})();
