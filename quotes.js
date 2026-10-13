/* Flight & hotel quotes: live search through the server (Duffel), prices already include
 * the business margin, and the customer sends a quote request that the owner handles
 * from the admin screen.
 */
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";
import {
  collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { fb, ready } from "./auth.js";

const C = window.APP_CONFIG;
const App = window.App;
const esc = App.esc;
const FUNCTIONS_REGION = "europe-west1";

const T = {
  he: {
    flights: "טיסות", hotels: "מלונות", myQuotes: "ההצעות שלי",
    from: "מאיפה (עיר / שדה)", to: "לאן (עיר / שדה)", depart: "יציאה", ret: "חזרה", oneWay: "כיוון אחד",
    adults: "מבוגרים", children: "ילדים", infants: "תינוקות", cabin: "מחלקה",
    cab_economy: "תיירים", cab_premium_economy: "פרימיום", cab_business: "עסקים", cab_first: "ראשונה",
    search: "חיפוש", searching: "מחפש את המחירים הטובים ביותר…",
    destination: "יעד (עיר)", checkIn: "צ'ק-אין", checkOut: "צ'ק-אאוט", rooms: "חדרים",
    noOffers: "לא נמצאו תוצאות. נסו תאריכים או יעד אחרים.",
    direct: "ישירה", stops: "עצירות", stop1: "עצירה אחת", via: "דרך",
    bagChecked: "מזוודה", bagNone: "ללא מזוודה",
    total: "סה\"כ", perStay: "לכל השהייה", nights: "לילות",
    request: "בקשת הצעת מחיר", requestTitle: "שליחת בקשה", name: "שם", phone: "טלפון", notes: "הערות (לא חובה)",
    send: "שליחה", sent: "הבקשה נשלחה! ניצור איתכם קשר בהקדם.", waNotify: "עדכון בוואטסאפ",
    priceNote: "המחיר עדכני לרגע החיפוש וכפוף לזמינות. ההזמנה הסופית מתבצעת מול נציג.",
    pickPlace: "בחרו מהרשימה", badPlace: "בחרו שדה תעופה מהרשימה", badDates: "בדקו את התאריכים",
    geoFail: "לא מצאנו את היעד", error: "משהו השתבש. נסו שוב.", notApproved: "החשבון עוד לא מאושר",
    noQuotes: "עוד לא שלחתם בקשות להצעת מחיר.",
    st_new: "חדשה", st_contacted: "נשלחה הצעה", st_booked: "הוזמן ✔", st_cancelled: "בוטלה",
    // admin
    customer: "לקוח", cost: "עלות ספק", price: "מחיר ללקוח", profit: "רווח נקי", fees: "עמלות",
    setContacted: "סמן: נשלחה הצעה", setBooked: "סמן: הוזמן", setCancelled: "ביטול",
    waCustomer: "וואטסאפ ללקוח", offerId: "מזהה הצעה (Duffel)", totalProfit: "רווח מהזמנות",
    openQuotes: "בקשות פתוחות", noAdminQuotes: "אין בקשות",
    waMsgToCustomer: "שלום {name}, כאן {biz}. לגבי בקשתך: {summary}. המחיר: {price}. לאישור ההזמנה השב/י להודעה זו.",
    waMsgToOwner: "שלום, שלחתי בקשה להצעת מחיר: {summary} — {price}",
  },
  ar: {
    flights: "رحلات طيران", hotels: "فنادق", myQuotes: "عروضي",
    from: "من (مدينة / مطار)", to: "إلى (مدينة / مطار)", depart: "الذهاب", ret: "العودة", oneWay: "اتجاه واحد",
    adults: "بالغون", children: "أطفال", infants: "رضّع", cabin: "الدرجة",
    cab_economy: "سياحية", cab_premium_economy: "سياحية مميزة", cab_business: "رجال أعمال", cab_first: "أولى",
    search: "بحث", searching: "نبحث عن أفضل الأسعار…",
    destination: "الوجهة (مدينة)", checkIn: "تسجيل الدخول", checkOut: "تسجيل المغادرة", rooms: "غرف",
    noOffers: "لا توجد نتائج. جرّب تواريخ أو وجهة أخرى.",
    direct: "مباشرة", stops: "توقفات", stop1: "توقف واحد", via: "عبر",
    bagChecked: "حقيبة", bagNone: "بدون حقيبة",
    total: "المجموع", perStay: "لكامل الإقامة", nights: "ليالٍ",
    request: "طلب عرض سعر", requestTitle: "إرسال الطلب", name: "الاسم", phone: "الهاتف", notes: "ملاحظات (اختياري)",
    send: "إرسال", sent: "تم إرسال الطلب! سنتواصل معك قريبًا.", waNotify: "إبلاغ عبر واتساب",
    priceNote: "السعر محدّث لحظة البحث وخاضع للتوفر. يتم الحجز النهائي مع مندوب.",
    pickPlace: "اختر من القائمة", badPlace: "اختر مطارًا من القائمة", badDates: "تحقق من التواريخ",
    geoFail: "لم نجد الوجهة", error: "حدث خطأ. حاول مرة أخرى.", notApproved: "الحساب غير موافق عليه بعد",
    noQuotes: "لم ترسل طلبات عروض أسعار بعد.",
    st_new: "جديد", st_contacted: "تم إرسال العرض", st_booked: "تم الحجز ✔", st_cancelled: "ملغى",
    customer: "الزبون", cost: "تكلفة المورد", price: "سعر الزبون", profit: "صافي الربح", fees: "العمولات",
    setContacted: "تم إرسال العرض", setBooked: "تم الحجز", setCancelled: "إلغاء",
    waCustomer: "واتساب للزبون", offerId: "رقم العرض (Duffel)", totalProfit: "أرباح الحجوزات",
    openQuotes: "طلبات مفتوحة", noAdminQuotes: "لا توجد طلبات",
    waMsgToCustomer: "مرحبًا {name}، معك {biz}. بخصوص طلبك: {summary}. السعر: {price}. لتأكيد الحجز يرجى الرد على هذه الرسالة.",
    waMsgToOwner: "مرحبًا، أرسلت طلب عرض سعر: {summary} — {price}",
  },
  en: {
    flights: "Flights", hotels: "Hotels", myQuotes: "My quotes",
    from: "From (city / airport)", to: "To (city / airport)", depart: "Depart", ret: "Return", oneWay: "One way",
    adults: "Adults", children: "Children", infants: "Infants", cabin: "Cabin",
    cab_economy: "Economy", cab_premium_economy: "Premium", cab_business: "Business", cab_first: "First",
    search: "Search", searching: "Finding the best prices…",
    destination: "Destination (city)", checkIn: "Check-in", checkOut: "Check-out", rooms: "Rooms",
    noOffers: "No results. Try other dates or destination.",
    direct: "Direct", stops: "stops", stop1: "1 stop", via: "via",
    bagChecked: "bag", bagNone: "No checked bag",
    total: "Total", perStay: "for the stay", nights: "nights",
    request: "Request a quote", requestTitle: "Send request", name: "Name", phone: "Phone", notes: "Notes (optional)",
    send: "Send", sent: "Request sent! We'll contact you soon.", waNotify: "Notify on WhatsApp",
    priceNote: "Price is live at search time and subject to availability. Final booking is done with an agent.",
    pickPlace: "Pick from the list", badPlace: "Pick an airport from the list", badDates: "Check the dates",
    geoFail: "Destination not found", error: "Something went wrong. Please try again.", notApproved: "Account not approved yet",
    noQuotes: "You haven't requested any quotes yet.",
    st_new: "New", st_contacted: "Quote sent", st_booked: "Booked ✔", st_cancelled: "Cancelled",
    customer: "Customer", cost: "Supplier cost", price: "Customer price", profit: "Net profit", fees: "Fees",
    setContacted: "Mark: quote sent", setBooked: "Mark: booked", setCancelled: "Cancel",
    waCustomer: "WhatsApp customer", offerId: "Offer ID (Duffel)", totalProfit: "Profit from bookings",
    openQuotes: "Open requests", noAdminQuotes: "No requests",
    waMsgToCustomer: "Hi {name}, this is {biz}. About your request: {summary}. Price: {price}. Reply to this message to confirm the booking.",
    waMsgToOwner: "Hi, I sent a quote request: {summary} — {price}",
  },
};

const lang = () => App.getLang();
const t = (k) => (T[lang()] && T[lang()][k]) || T.en[k] || k;
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k] ?? "");

const root = document.getElementById("quoteApp");
const ui = {
  tab: "flights",
  flight: { from: null, to: null, oneWay: false, depart: "", ret: "", adults: 1, children: 0, infants: 0, cabin: "economy" },
  hotel: { place: "", lat: null, lon: null, checkIn: "", checkOut: "", adults: 2, children: 0, rooms: 1 },
  results: { flights: null, hotels: null },
  loading: false,
  error: "",
  myQuotes: [],
};

let functions;
const call = (name, data) => httpsCallable(functions, name, { timeout: 70000 })(data).then((r) => r.data);

// ---------- formatting ----------
function money(amount, currency) {
  try {
    return new Intl.NumberFormat(lang() === "ar" ? "ar" : lang(), { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch { return `${amount} ${currency}`; }
}
// Duffel times are local to the airport: format the string as-is (no timezone conversion).
const hhmm = (iso) => (iso || "").slice(11, 16);
function dayLabel(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(lang(), { day: "numeric", month: "short", timeZone: "UTC" });
}
function dur(iso) {
  const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/.exec(iso || "");
  if (!m) return "";
  const h = (+m[1] || 0) * 24 + (+m[2] || 0);
  return `${h}:${String(+m[3] || 0).padStart(2, "0")}`;
}
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d, n) => new Date(Date.parse(d) + n * 86400000).toISOString().slice(0, 10);

function errText(e) {
  if (e?.code === "functions/permission-denied") return t("notApproved");
  return t("error");
}

// ---------- render ----------
function render() {
  const tabs = ["flights", "hotels", "myQuotes"].map((k) =>
    `<button data-q-tab="${k}" class="${ui.tab === k ? "active" : ""}">${k === "flights" ? "✈️" : k === "hotels" ? "🏨" : "📋"} ${esc(t(k))}</button>`).join("");
  let body = "";
  if (ui.tab === "flights") body = flightForm() + resultsHtml("flights");
  if (ui.tab === "hotels") body = hotelForm() + resultsHtml("hotels");
  if (ui.tab === "myQuotes") body = myQuotesHtml();
  root.innerHTML = `<div class="seg q-tabs">${tabs}</div>${body}`;
}

function opt(n, from, to, sel) {
  let s = "";
  for (let i = from; i <= to; i++) s += `<option value="${i}" ${i === sel ? "selected" : ""}>${i}</option>`;
  return s;
}

function placeLabel(p) { return p ? `${p.city || p.name} (${p.code})` : ""; }

function flightForm() {
  const f = ui.flight;
  return `
  <form id="flightForm" class="q-form" autocomplete="off">
    <div class="q-field q-ac">
      <label>${esc(t("from"))}</label>
      <input name="from" value="${esc(placeLabel(f.from))}" placeholder="TLV" required>
      <ul class="q-sugg" data-for="from" hidden></ul>
    </div>
    <button type="button" class="q-swap" data-q-swap aria-label="swap">⇅</button>
    <div class="q-field q-ac">
      <label>${esc(t("to"))}</label>
      <input name="to" value="${esc(placeLabel(f.to))}" placeholder="CDG" required>
      <ul class="q-sugg" data-for="to" hidden></ul>
    </div>
    <div class="q-row">
      <div class="q-field"><label>${esc(t("depart"))}</label><input type="date" name="depart" min="${today()}" value="${esc(f.depart)}" required></div>
      <div class="q-field"><label>${esc(t("ret"))}</label><input type="date" name="ret" min="${esc(f.depart || today())}" value="${esc(f.ret)}" ${f.oneWay ? "disabled" : ""}></div>
    </div>
    <label class="q-check"><input type="checkbox" name="oneWay" ${f.oneWay ? "checked" : ""}> ${esc(t("oneWay"))}</label>
    <div class="q-row q-row-4">
      <div class="q-field"><label>${esc(t("adults"))}</label><select name="adults">${opt(0, 1, 9, f.adults)}</select></div>
      <div class="q-field"><label>${esc(t("children"))}</label><select name="children">${opt(0, 0, 8, f.children)}</select></div>
      <div class="q-field"><label>${esc(t("infants"))}</label><select name="infants">${opt(0, 0, 4, f.infants)}</select></div>
      <div class="q-field"><label>${esc(t("cabin"))}</label><select name="cabin">${["economy", "premium_economy", "business", "first"].map((c) => `<option value="${c}" ${c === f.cabin ? "selected" : ""}>${esc(t("cab_" + c))}</option>`).join("")}</select></div>
    </div>
    <button class="gate-btn primary" type="submit" ${ui.loading ? "disabled" : ""}>🔍 ${esc(t("search"))}</button>
  </form>`;
}

function hotelForm() {
  const h = ui.hotel;
  if (!h.place) {
    const c = App.getCenter();
    if (c && c.label) Object.assign(h, { place: c.label, lat: c.lat, lon: c.lon });
  }
  if (!h.checkIn) { h.checkIn = addDays(today(), 14); h.checkOut = addDays(today(), 17); }
  return `
  <form id="hotelForm" class="q-form" autocomplete="off">
    <div class="q-field"><label>${esc(t("destination"))}</label><input name="place" value="${esc(h.place)}" required></div>
    <div class="q-row">
      <div class="q-field"><label>${esc(t("checkIn"))}</label><input type="date" name="checkIn" min="${today()}" value="${esc(h.checkIn)}" required></div>
      <div class="q-field"><label>${esc(t("checkOut"))}</label><input type="date" name="checkOut" min="${esc(h.checkIn)}" value="${esc(h.checkOut)}" required></div>
    </div>
    <div class="q-row q-row-3">
      <div class="q-field"><label>${esc(t("adults"))}</label><select name="adults">${opt(0, 1, 9, h.adults)}</select></div>
      <div class="q-field"><label>${esc(t("children"))}</label><select name="children">${opt(0, 0, 6, h.children)}</select></div>
      <div class="q-field"><label>${esc(t("rooms"))}</label><select name="rooms">${opt(0, 1, 5, h.rooms)}</select></div>
    </div>
    <button class="gate-btn primary" type="submit" ${ui.loading ? "disabled" : ""}>🔍 ${esc(t("search"))}</button>
  </form>`;
}

function resultsHtml(kind) {
  if (ui.loading) return `<div class="state"><div class="spinner"></div>${esc(t("searching"))}</div>`;
  if (ui.error) return `<div class="state">${esc(ui.error)}</div>`;
  const r = ui.results[kind];
  if (!r) return "";
  if (!r.offers.length) return `<div class="empty">${esc(t("noOffers"))}</div>`;
  const cards = r.offers.map((o, i) => (kind === "flights" ? flightCard(o, i) : hotelCard(o, i))).join("");
  return `<p class="muted small q-note">ℹ️ ${esc(t("priceNote"))}</p><div class="results">${cards}</div>`;
}

function stopsText(s) {
  if (!s.stops) return t("direct");
  return (s.stops === 1 ? t("stop1") : `${s.stops} ${t("stops")}`) + (s.via.length ? ` · ${t("via")} ${s.via.join(", ")}` : "");
}

function flightCard(o, i) {
  const slices = o.slices.map((s) => `
    <div class="fl-slice">
      <div class="fl-time"><b>${esc(hhmm(s.departAt))}</b><small>${esc(s.from)}</small></div>
      <div class="fl-mid"><small>${esc(dur(s.duration))}</small><div class="fl-line"></div><small>${esc(stopsText(s))}</small></div>
      <div class="fl-time"><b>${esc(hhmm(s.arriveAt))}</b><small>${esc(s.to)}</small></div>
    </div>
    <div class="muted small" dir="ltr">${esc(dayLabel(s.departAt))} · ${esc(s.flights.join(" · "))} · 🧳 ${s.bags.checked ? `${s.bags.checked}× ${esc(t("bagChecked"))}` : esc(t("bagNone"))}</div>`).join("");
  return `
  <div class="card q-card">
    <div class="q-card-head">
      ${o.logo ? `<img class="airline-logo" src="${esc(o.logo)}" alt="">` : `<div class="card-icon">✈️</div>`}
      <b>${esc(o.airline)}</b>
      <div class="q-price"><b dir="ltr">${esc(money(o.price, o.currency))}</b><small>${esc(t("total"))}</small></div>
    </div>
    ${slices}
    <button class="pill primary q-req" data-q-request="flights:${i}">🎫 ${esc(t("request"))}</button>
  </div>`;
}

function hotelCard(h, i) {
  return `
  <div class="card q-card">
    ${h.photo ? `<img class="hotel-photo" src="${esc(h.photo)}" alt="" loading="lazy">` : ""}
    <div class="q-card-head">
      <div style="min-width:0">
        <b>${esc(h.name)}</b>
        <div class="muted small">${h.stars ? "★".repeat(Math.min(5, h.stars)) + " · " : ""}${h.reviewScore ? `${esc(h.reviewScore)}/10 · ` : ""}${esc(h.address)}</div>
      </div>
      <div class="q-price"><b dir="ltr">${esc(money(h.price, h.currency))}</b><small>${esc(h.nights)} ${esc(t("nights"))}</small></div>
    </div>
    <button class="pill primary q-req" data-q-request="hotels:${i}">🎫 ${esc(t("request"))}</button>
  </div>`;
}

function summaryOf(q) {
  if (q.type === "flight") {
    const p = q.params;
    const s0 = q.offer.slices[0];
    return `✈️ ${s0.fromCity || p.origin} → ${s0.toCity || p.destination} · ${p.departDate}${p.returnDate ? " ↔ " + p.returnDate : ""} · ${q.offer.airline} · ${p.adults + p.children + p.infants}👤`;
  }
  const p = q.params;
  return `🏨 ${q.offer.name} · ${p.place} · ${p.checkIn} → ${p.checkOut} · ${p.adults + p.children}👤 · ${p.rooms}🛏️`;
}

function myQuotesHtml() {
  if (!ui.myQuotes.length) return `<div class="empty">📋<br>${esc(t("noQuotes"))}</div>`;
  return `<div class="results">${ui.myQuotes.map((q) => `
    <div class="card q-card">
      <div class="q-card-head">
        <div style="min-width:0"><b>${esc(summaryOf(q))}</b><div class="muted small">${esc(fmtTs(q.createdAt))}</div></div>
        <div class="q-price"><b dir="ltr">${esc(money(q.price, q.currency))}</b><span class="tag st-${esc(q.status)}">${esc(t("st_" + q.status))}</span></div>
      </div>
    </div>`).join("")}</div>`;
}

function fmtTs(ts) {
  return ts && ts.toDate ? ts.toDate().toLocaleString(lang(), { dateStyle: "short", timeStyle: "short" }) : "";
}

// ---------- airport autocomplete ----------
let suggTimer;
function onAcInput(input) {
  const field = input.name;
  ui.flight[field] = null;
  clearTimeout(suggTimer);
  const list = root.querySelector(`.q-sugg[data-for="${field}"]`);
  const q = input.value.trim();
  if (q.length < 2) { list.hidden = true; return; }
  suggTimer = setTimeout(async () => {
    try {
      const places = await call("placeSuggest", { query: q });
      if (input.value.trim() !== q) return;
      list._places = places;
      list.innerHTML = places.map((p, i) => `<li data-i="${i}">${p.type === "city" ? "🏙️" : "🛫"} <b>${esc(p.city || p.name)}</b> <span dir="ltr">${esc(p.code)}</span><small>${esc(p.name)} · ${esc(p.country)}</small></li>`).join("");
      list.hidden = !places.length;
    } catch (e) { console.error(e); }
  }, 350);
}

// ---------- actions ----------
async function searchFlights(form) {
  const fd = new FormData(form);
  const f = ui.flight;
  Object.assign(f, {
    depart: fd.get("depart"), ret: fd.get("ret") || "", oneWay: !!fd.get("oneWay"),
    adults: +fd.get("adults"), children: +fd.get("children"), infants: +fd.get("infants"), cabin: fd.get("cabin"),
  });
  if (!f.from || !f.to) { ui.error = t("badPlace"); render(); return; }
  if (!f.oneWay && f.ret && f.ret < f.depart) { ui.error = t("badDates"); render(); return; }
  await runSearch("flights", "searchFlights", {
    origin: f.from.code, destination: f.to.code, departDate: f.depart, returnDate: f.oneWay ? null : (f.ret || null),
    adults: f.adults, children: f.children, infants: f.infants, cabin: f.cabin,
  });
}

async function searchHotels(form) {
  const fd = new FormData(form);
  const h = ui.hotel;
  const place = String(fd.get("place") || "").trim();
  Object.assign(h, { checkIn: fd.get("checkIn"), checkOut: fd.get("checkOut"), adults: +fd.get("adults"), children: +fd.get("children"), rooms: +fd.get("rooms") });
  if (!(h.checkOut > h.checkIn)) { ui.error = t("badDates"); render(); return; }
  if (place !== h.place || h.lat == null) {
    try {
      const qs = new URLSearchParams({ q: place, format: "jsonv2", limit: "1", "accept-language": lang() });
      const r = await fetch(`https://nominatim.openstreetmap.org/search?${qs}`).then((x) => x.json());
      if (!r[0]) { ui.error = t("geoFail"); render(); return; }
      Object.assign(h, { place, lat: +r[0].lat, lon: +r[0].lon });
    } catch { ui.error = t("error"); render(); return; }
  }
  await runSearch("hotels", "searchHotels", {
    place: h.place, lat: h.lat, lon: h.lon, checkIn: h.checkIn, checkOut: h.checkOut, adults: h.adults, children: h.children, rooms: h.rooms,
  });
}

async function runSearch(kind, fn, data) {
  ui.loading = true; ui.error = ""; ui.results[kind] = null;
  render();
  try {
    ui.results[kind] = await call(fn, data);
  } catch (e) {
    console.error(e);
    ui.error = errText(e);
  } finally {
    ui.loading = false;
    render();
  }
}

function openRequest(kind, index) {
  const r = ui.results[kind];
  const o = r && r.offers[index];
  if (!o) return;
  const fake = { type: kind === "flights" ? "flight" : "hotel", offer: o, params: kind === "flights"
    ? { origin: ui.flight.from.code, destination: ui.flight.to.code, departDate: ui.flight.depart, returnDate: ui.flight.oneWay ? null : ui.flight.ret, adults: ui.flight.adults, children: ui.flight.children, infants: ui.flight.infants }
    : { ...ui.hotel } };
  const summary = summaryOf(fake);
  const priceTxt = money(o.price, o.currency);
  const sheet = document.getElementById("sheet");
  document.getElementById("sheetContent").innerHTML = `
    <h2>🎫 ${esc(t("requestTitle"))}</h2>
    <div class="box"><b>${esc(summary)}</b><div class="q-price big"><b dir="ltr">${esc(priceTxt)}</b></div></div>
    <form id="quoteReqForm" class="q-form" data-kind="${esc(kind)}" data-index="${index}">
      <div class="q-field"><label>${esc(t("name"))}</label><input name="name" value="${esc(fb.user?.displayName || "")}" required></div>
      <div class="q-field"><label>${esc(t("phone"))}</label><input name="phone" type="tel" dir="ltr" required></div>
      <div class="q-field"><label>${esc(t("notes"))}</label><textarea name="notes" rows="3"></textarea></div>
      <button class="gate-btn primary" type="submit">${esc(t("send"))}</button>
      <p class="gate-error" id="qReqErr" hidden></p>
    </form>
    <p class="muted small">${esc(t("priceNote"))}</p>`;
  sheet.hidden = false;
  document.body.style.overflow = "hidden";
  sheet._summary = summary;
  sheet._price = priceTxt;
}

async function submitRequest(form) {
  const kind = form.dataset.kind;
  const index = +form.dataset.index;
  const fd = new FormData(form);
  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true;
  try {
    await call("requestQuote", {
      searchId: ui.results[kind].searchId, index,
      name: fd.get("name"), phone: fd.get("phone"), notes: fd.get("notes"),
    });
    const sheet = document.getElementById("sheet");
    const wa = C.contact.whatsapp
      ? `https://wa.me/${encodeURIComponent(C.contact.whatsapp)}?text=${encodeURIComponent(fill(t("waMsgToOwner"), { summary: sheet._summary, price: sheet._price }))}`
      : null;
    document.getElementById("sheetContent").innerHTML = `
      <div class="state" style="border:0">
        <div class="gate-icon">✅</div>
        <p><b>${esc(t("sent"))}</b></p>
        ${wa ? `<a class="gate-btn wa" target="_blank" rel="noopener" href="${esc(wa)}">💬 ${esc(t("waNotify"))}</a>` : ""}
      </div>`;
  } catch (e) {
    console.error(e);
    const err = document.getElementById("qReqErr");
    err.textContent = errText(e);
    err.hidden = false;
    btn.disabled = false;
  }
}

// ---------- events ----------
root.addEventListener("click", (e) => {
  const tab = e.target.closest("[data-q-tab]");
  if (tab) { ui.tab = tab.dataset.qTab; ui.error = ""; render(); return; }
  if (e.target.closest("[data-q-swap]")) {
    [ui.flight.from, ui.flight.to] = [ui.flight.to, ui.flight.from];
    const form = root.querySelector("#flightForm");
    form.from.value = placeLabel(ui.flight.from);
    form.to.value = placeLabel(ui.flight.to);
    return;
  }
  const li = e.target.closest(".q-sugg li[data-i]");
  if (li) {
    const list = li.parentElement;
    const field = list.dataset.for;
    ui.flight[field] = list._places[+li.dataset.i];
    root.querySelector(`#flightForm [name="${field}"]`).value = placeLabel(ui.flight[field]);
    list.hidden = true;
    return;
  }
  const req = e.target.closest("[data-q-request]");
  if (req) {
    const [kind, i] = req.dataset.qRequest.split(":");
    openRequest(kind, +i);
  }
});
root.addEventListener("input", (e) => {
  if (e.target.matches('#flightForm [name="from"], #flightForm [name="to"]')) onAcInput(e.target);
});
root.addEventListener("change", (e) => {
  const f = e.target.form;
  if (!f) return;
  if (e.target.name === "oneWay") { f.ret.disabled = e.target.checked; ui.flight.oneWay = e.target.checked; }
  if (e.target.name === "depart") { f.ret.min = e.target.value; if (f.ret.value && f.ret.value < e.target.value) f.ret.value = ""; }
  if (e.target.name === "checkIn") { f.checkOut.min = e.target.value; if (f.checkOut.value <= e.target.value) f.checkOut.value = addDays(e.target.value, 1); }
});
root.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.id === "flightForm") searchFlights(e.target);
  if (e.target.id === "hotelForm") searchHotels(e.target);
});
document.addEventListener("submit", (e) => {
  if (e.target.id !== "quoteReqForm") return;
  e.preventDefault();
  submitRequest(e.target);
});
document.addEventListener("langchange", () => { render(); renderAdminQuotes(); });

// ---------- admin: quote requests ----------
let adminQuotes = [];
let adminPrivate = {};
let adminQuoteFilter = "open";

function renderAdminQuotes() {
  const box = document.getElementById("adminQuotes");
  if (!box || !fb.isAdmin) return;
  const open = adminQuotes.filter((q) => q.status === "new" || q.status === "contacted");
  const newCount = adminQuotes.filter((q) => q.status === "new").length;
  document.getElementById("quotesBadge").textContent = newCount ? String(newCount) : "";
  const profitBooked = adminQuotes.filter((q) => q.status === "booked")
    .reduce((acc, q) => { const p = adminPrivate[q.id]; if (p) acc[p.currency] = (acc[p.currency] || 0) + p.profit; return acc; }, {});
  const profitTxt = Object.entries(profitBooked).map(([c, v]) => money(v, c)).join(" + ") || money(0, C.price.currency);
  const list = adminQuoteFilter === "open" ? open : adminQuotes;
  const fbtn = (k, label) => `<button data-aq-filter="${k}" class="${adminQuoteFilter === k ? "active" : ""}">${esc(label)}</button>`;
  box.innerHTML = `
    <div class="admin-stats">
      <div><b>${newCount}</b><small>${esc(t("st_new"))}</small></div>
      <div><b>${open.length}</b><small>${esc(t("openQuotes"))}</small></div>
      <div><b dir="ltr">${esc(profitTxt)}</b><small>${esc(t("totalProfit"))}</small></div>
    </div>
    <div class="seg admin-seg">${fbtn("open", t("openQuotes"))}${fbtn("all", "∑")}</div>
    <div class="admin-list">
      ${list.length ? list.map(adminQuoteCard).join("") : `<div class="empty">${esc(t("noAdminQuotes"))}</div>`}
    </div>`;
}

function adminQuoteCard(q) {
  const p = adminPrivate[q.id] || {};
  const priceTxt = money(q.price, q.currency);
  const phoneDigits = String(q.customer?.phone || "").replace(/[^\d]/g, "").replace(/^0/, "972");
  const waText = fill(t("waMsgToCustomer"), { name: q.customer?.name || "", biz: C.businessName, summary: summaryOf(q), price: priceTxt });
  const wa = phoneDigits ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(waText)}` : null;
  return `
  <div class="admin-user">
    <div class="admin-user-head">
      <div style="min-width:0"><b>${esc(summaryOf(q))}</b><div class="muted small">${esc(fmtTs(q.createdAt))}</div></div>
      <span class="tag st-${esc(q.status)}">${esc(t("st_" + q.status))}</span>
    </div>
    <div class="row"><span class="k">${esc(t("customer"))}</span><span class="v"><b>${esc(q.customer?.name || "")}</b><br><a dir="ltr" href="tel:${esc(String(q.customer?.phone || "").replace(/[^\d+]/g, ""))}">${esc(q.customer?.phone || "")}</a><br><span dir="ltr">${esc(q.customer?.email || "")}</span></span></div>
    ${q.notes ? `<div class="row"><span class="k">📝</span><span class="v">${esc(q.notes)}</span></div>` : ""}
    <div class="money-grid">
      <div><small>${esc(t("cost"))}</small><b dir="ltr">${p.cost != null ? esc(money(p.cost, p.currency)) : "—"}</b></div>
      <div><small>${esc(t("fees"))}</small><b dir="ltr">${p.fees != null ? esc(money(p.fees, p.currency)) : "—"}</b></div>
      <div><small>${esc(t("price"))}</small><b dir="ltr">${esc(priceTxt)}</b></div>
      <div class="profit"><small>${esc(t("profit"))}</small><b dir="ltr">${p.profit != null ? esc(money(p.profit, p.currency)) : "—"}</b></div>
    </div>
    ${p.supplierOfferId ? `<div class="muted small">${esc(t("offerId"))}: <code dir="ltr">${esc(p.supplierOfferId)}</code></div>` : ""}
    <div class="admin-actions">
      ${wa ? `<a class="pill" style="background:#25D366;color:#fff;border-color:#25D366;text-decoration:none" target="_blank" rel="noopener" href="${esc(wa)}">💬 ${esc(t("waCustomer"))}</a>` : ""}
      ${q.status === "new" ? `<button class="pill" data-aq-set="contacted" data-id="${esc(q.id)}">📨 ${esc(t("setContacted"))}</button>` : ""}
      ${q.status !== "booked" && q.status !== "cancelled" ? `<button class="pill primary" data-aq-set="booked" data-id="${esc(q.id)}">✔ ${esc(t("setBooked"))}</button>` : ""}
      ${q.status !== "cancelled" && q.status !== "booked" ? `<button class="pill" data-aq-set="cancelled" data-id="${esc(q.id)}">✖ ${esc(t("setCancelled"))}</button>` : ""}
    </div>
  </div>`;
}

document.addEventListener("click", async (e) => {
  const sec = e.target.closest("[data-admin-section]");
  if (sec) {
    document.querySelectorAll("[data-admin-section]").forEach((b) => b.classList.toggle("active", b === sec));
    document.getElementById("adminPanel").hidden = sec.dataset.adminSection !== "users";
    document.getElementById("adminQuotes").hidden = sec.dataset.adminSection !== "quotes";
    return;
  }
  const f = e.target.closest("[data-aq-filter]");
  if (f) { adminQuoteFilter = f.dataset.aqFilter; renderAdminQuotes(); return; }
  const s = e.target.closest("[data-aq-set]");
  if (s) {
    s.disabled = true;
    try {
      await updateDoc(doc(fb.db, "quotes", s.dataset.id), { status: s.dataset.aqSet, updatedAt: serverTimestamp() });
    } catch (err) { console.error(err); alert(t("error")); s.disabled = false; }
  }
});

// ---------- boot ----------
render();
ready.then(() => {
  functions = getFunctions(fb.app, FUNCTIONS_REGION);
  onSnapshot(query(collection(fb.db, "quotes"), where("uid", "==", fb.user.uid)), (snap) => {
    ui.myQuotes = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    if (ui.tab === "myQuotes") render();
  }, (e) => console.error(e));
  if (fb.isAdmin) {
    onSnapshot(query(collection(fb.db, "quotes"), orderBy("createdAt", "desc")), (snap) => {
      adminQuotes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderAdminQuotes();
    }, (e) => console.error(e));
    onSnapshot(collection(fb.db, "quotes_private"), (snap) => {
      adminPrivate = Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]));
      renderAdminQuotes();
    }, (e) => console.error(e));
  }
});
