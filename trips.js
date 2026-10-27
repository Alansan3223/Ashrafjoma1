/* Trips store: group tours and packages with WhatsApp booking. Open to everyone. */
(() => {
  "use strict";
  const C = window.APP_CONFIG;
  const App = window.App;
  const esc = App.esc;
  const TRIPS = window.TRIPS || [];
  const TRUST = window.TRUST_POINTS || [];

  const T = {
    he: {
      heroTitle: "הטיול הבא שלכם מתחיל כאן",
      heroText: "טיולים מאורגנים וחבילות לכל העולם, עם הזמנה בוואטסאפ.",
      all: "הכול", group: "טיולים מאורגנים", package: "חבילות",
      from: "החל מ-", perPerson: "לאדם", days: "ימים", nights: "לילות",
      seatsLeft: "נשארו {n} מקומות", flexible: "תאריכים גמישים", nextDate: "יציאה קרובה",
      details: "לפרטים והרשמה", highlights: "מה מחכה לכם", itinerary: "מסלול הטיול", day: "יום",
      included: "כלול במחיר", chooseDate: "בחרו תאריך", yourDates: "התאריכים שלכם",
      adults: "מבוגרים", children: "ילדים", name: "שם מלא", phone: "טלפון", notes: "הערות (לא חובה)",
      book: "הרשמה בוואטסאפ", bookPackage: "קבלת הצעה בוואטסאפ", estimate: "הערכת מחיר",
      exploreDest: "גלו את היעד במדריך", share: "שיתוף הטיול", copied: "הקישור הועתק",
      ready: "הבקשה מוכנה", readyHint: "לחצו כדי לשלוח אותה אלינו בוואטסאפ. נחזור אליכם עם אישור מקום ופרטי תשלום.",
      sendWa: "שליחה בוואטסאפ", msgTitle: "בקשת הרשמה לטיול",
      date: "תאריך", travelers: "נוסעים", why: "למה לטייל איתנו",
      sample: "טיול לדוגמה",
      inc_flight: "טיסות", inc_hotel: "מלון", inc_breakfast: "ארוחת בוקר", inc_halfboard: "חצי פנסיון",
      inc_guide: "מדריך", inc_transfers: "העברות", inc_tours: "סיורים", inc_insurance: "ביטוח",
      pickDate: "בחרו תאריך יציאה", custom: "מותאם אישית",
    },
    ar: {
      heroTitle: "رحلتك القادمة تبدأ هنا",
      heroText: "رحلات منظّمة وباقات إلى كل العالم، مع الحجز عبر واتساب.",
      all: "الكل", group: "رحلات منظّمة", package: "باقات",
      from: "ابتداءً من ", perPerson: "للشخص", days: "أيام", nights: "ليالٍ",
      seatsLeft: "بقي {n} مقاعد", flexible: "تواريخ مرنة", nextDate: "أقرب موعد",
      details: "التفاصيل والتسجيل", highlights: "ما ينتظرك", itinerary: "برنامج الرحلة", day: "اليوم",
      included: "يشمل السعر", chooseDate: "اختر الموعد", yourDates: "تواريخك",
      adults: "بالغون", children: "أطفال", name: "الاسم الكامل", phone: "الهاتف", notes: "ملاحظات (اختياري)",
      book: "التسجيل عبر واتساب", bookPackage: "احصل على عرض عبر واتساب", estimate: "تقدير السعر",
      exploreDest: "اكتشف الوجهة في الدليل", share: "مشاركة الرحلة", copied: "تم نسخ الرابط",
      ready: "الطلب جاهز", readyHint: "اضغط لإرساله إلينا عبر واتساب. سنعود إليك لتأكيد المقعد وتفاصيل الدفع.",
      sendWa: "إرسال عبر واتساب", msgTitle: "طلب تسجيل لرحلة",
      date: "الموعد", travelers: "المسافرون", why: "لماذا تسافر معنا",
      sample: "رحلة للعرض",
      inc_flight: "طيران", inc_hotel: "فندق", inc_breakfast: "فطور", inc_halfboard: "نصف إقامة",
      inc_guide: "مرشد", inc_transfers: "تنقلات", inc_tours: "جولات", inc_insurance: "تأمين",
      pickDate: "اختر موعد السفر", custom: "حسب الطلب",
    },
    en: {
      heroTitle: "Your next trip starts here",
      heroText: "Group tours and travel packages worldwide, booked on WhatsApp.",
      all: "All", group: "Group tours", package: "Packages",
      from: "From ", perPerson: "per person", days: "days", nights: "nights",
      seatsLeft: "{n} seats left", flexible: "Flexible dates", nextDate: "Next departure",
      details: "Details & booking", highlights: "Highlights", itinerary: "Itinerary", day: "Day",
      included: "Included", chooseDate: "Choose a date", yourDates: "Your dates",
      adults: "Adults", children: "Children", name: "Full name", phone: "Phone", notes: "Notes (optional)",
      book: "Book on WhatsApp", bookPackage: "Get an offer on WhatsApp", estimate: "Estimated price",
      exploreDest: "Explore the destination", share: "Share trip", copied: "Link copied",
      ready: "Your request is ready", readyHint: "Tap to send it to us on WhatsApp. We'll confirm your seat and payment details.",
      sendWa: "Send on WhatsApp", msgTitle: "Trip booking request",
      date: "Date", travelers: "Travellers", why: "Why travel with us",
      sample: "Sample trip",
      inc_flight: "Flights", inc_hotel: "Hotel", inc_breakfast: "Breakfast", inc_halfboard: "Half board",
      inc_guide: "Guide", inc_transfers: "Transfers", inc_tours: "Tours", inc_insurance: "Insurance",
      pickDate: "Choose a departure date", custom: "Custom",
    },
  };
  const INC_ICON = { flight: "✈️", hotel: "🏨", breakfast: "🍳", halfboard: "🍽️", guide: "🧭", transfers: "🚌", tours: "🎟️", insurance: "🛡️" };
  // Set to false once the trips in trips-data.js are real.
  const SHOW_SAMPLE_BADGE = true;

  const lang = () => App.getLang();
  const t = (k) => (T[lang()] || T.en)[k] ?? T.en[k] ?? k;
  const L = (o) => (o && (o[lang()] || o.en || o.he)) || "";
  const root = document.getElementById("tripsApp");
  let filter = "all";
  let sel = null; // { id, date, adults, children }

  function money(n) {
    try { return new Intl.NumberFormat(lang(), { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n); }
    catch { return "$" + n; }
  }
  function dateRange(d) {
    const f = (s) => new Date(s + "T12:00:00Z").toLocaleDateString(lang(), { day: "numeric", month: "short", timeZone: "UTC" });
    return `${f(d.start)} – ${f(d.end)}`;
  }
  const upcoming = (trip) => trip.dates.filter((d) => d.end >= new Date().toISOString().slice(0, 10));

  // Real photo when the trip has one, otherwise the destination illustration (scenes.js).
  function cover(trip, big) {
    const art = trip.image
      ? `<div class="trip-photo" style="background-image:url('${esc(trip.image)}')"></div>`
      : (window.Scenes ? window.Scenes.render(trip.scene) : "");
    return `<div class="trip-cover ${big ? "big" : ""}">
      ${art}
      <span class="trip-type">${esc(t(trip.type))}</span>
      ${SHOW_SAMPLE_BADGE ? `<span class="trip-sample">${esc(t("sample"))}</span>` : ""}
      <span class="trip-dest">${trip.flag} ${esc(trip.days)} ${esc(t("days"))}</span>
    </div>`;
  }

  function seatsBadge(trip) {
    const next = upcoming(trip)[0];
    if (!next) return `<span class="tag">📅 ${esc(t("flexible"))}</span>`;
    const hot = next.seats <= 9;
    return `<span class="tag">📅 ${esc(dateRange(next))}</span>` +
      (next.seats != null ? `<span class="tag ${hot ? "hot" : ""}">${hot ? "🔥 " : ""}${esc(t("seatsLeft").replace("{n}", next.seats))}</span>` : "");
  }

  function render() {
    if (!root) return;
    const list = TRIPS.filter((x) => filter === "all" || x.type === filter);
    const tab = (k) => `<button data-trip-filter="${k}" class="${filter === k ? "active" : ""}">${esc(t(k))}</button>`;
    root.innerHTML = `
      <div class="trips-hero">
        ${window.Scenes ? window.Scenes.hero() : ""}
        <div class="trips-hero-text">
          <h2>${esc(t("heroTitle"))}</h2>
          <p>${esc(t("heroText"))}</p>
        </div>
      </div>
      <div class="seg trips-seg">${tab("all")}${tab("group")}${tab("package")}</div>
      <div class="trip-list">
        ${list.map((trip) => `
          <article class="trip-card" data-trip="${esc(trip.id)}" role="button" tabindex="0">
            ${cover(trip)}
            <div class="trip-body">
              <h3>${esc(L(trip.title))}</h3>
              <p class="muted small">${esc(L(trip.subtitle))} · ${trip.days} ${esc(t("days"))}</p>
              <div class="card-meta">${seatsBadge(trip)}</div>
              <div class="trip-foot">
                <div class="trip-price"><small>${esc(t("from"))}</small><b dir="ltr">${esc(money(trip.priceFrom))}</b><small>${esc(t("perPerson"))}</small></div>
                <span class="pill primary">${esc(t("details"))}</span>
              </div>
            </div>
          </article>`).join("")}
      </div>
      ${TRUST.length ? `<div class="box trust"><h3>${esc(t("why"))}</h3>${TRUST.map((p) => `<div class="trust-row"><span>${p.icon}</span><span>${esc(L(p.text))}</span></div>`).join("")}</div>` : ""}`;
  }

  // ---------- trip page ----------
  function openTrip(id) {
    const trip = TRIPS.find((x) => x.id === id);
    if (!trip) return;
    const dates = upcoming(trip);
    sel = sel && sel.id === id ? sel : { id, date: dates.length === 1 ? dates[0].start : null, adults: 2, children: 0, from: "", to: "" };
    drawTrip(trip);
    document.getElementById("sheet").hidden = false;
    document.body.style.overflow = "hidden";
    history.replaceState(null, "", "#trip-" + id);
  }

  function opt(from, to, v) {
    let s = "";
    for (let i = from; i <= to; i++) s += `<option value="${i}" ${i === v ? "selected" : ""}>${i}</option>`;
    return s;
  }

  function drawTrip(trip) {
    const dates = upcoming(trip);
    const people = sel.adults + sel.children;
    const items = L(trip.itinerary);
    document.getElementById("sheetContent").innerHTML = `
      <div class="trip-page">
        ${cover(trip, true)}
        <h2>${esc(L(trip.title))}</h2>
        <p class="muted">${esc(L(trip.subtitle))} · ${trip.days} ${esc(t("days"))} / ${trip.nights} ${esc(t("nights"))}</p>
        <div class="trip-price big"><small>${esc(t("from"))}</small><b dir="ltr">${esc(money(trip.priceFrom))}</b><small>${esc(t("perPerson"))}</small></div>

        <div class="box"><h3>${esc(t("included"))}</h3>
          <div class="inc">${trip.includes.map((k) => `<span class="tag">${INC_ICON[k] || "✓"} ${esc(t("inc_" + k))}</span>`).join("")}</div>
        </div>
        <div class="box"><h3>⭐ ${esc(t("highlights"))}</h3>
          <ul class="hl">${L(trip.highlights).map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
        </div>
        <div class="box"><h3>🗓️ ${esc(t("itinerary"))}</h3>
          <ol class="itin">${items.map((d, i) => `<li>${items.length > 1 ? `<b>${esc(t("day"))} ${i + 1}</b> ` : ""}${esc(d)}</li>`).join("")}</ol>
        </div>

        <form id="tripForm" class="q-form" data-trip-id="${esc(trip.id)}">
          <h3>${esc(dates.length ? t("chooseDate") : t("yourDates"))}</h3>
          ${dates.length ? `<div class="chips trip-dates">${dates.map((d) => `
            <button type="button" class="chip ${sel.date === d.start ? "active" : ""}" data-trip-date="${esc(d.start)}">
              ${esc(dateRange(d))}${d.seats != null ? `<small>${esc(t("seatsLeft").replace("{n}", d.seats))}</small>` : ""}
            </button>`).join("")}</div>`
          : `<div class="q-row">
              <div class="q-field"><label for="tFrom">${esc(t("date"))} ⬅</label><input id="tFrom" type="date" name="from" min="${new Date().toISOString().slice(0, 10)}" value="${esc(sel.from)}" required></div>
              <div class="q-field"><label for="tTo">➡</label><input id="tTo" type="date" name="to" min="${esc(sel.from || new Date().toISOString().slice(0, 10))}" value="${esc(sel.to)}" required></div>
            </div>`}
          <div class="q-row">
            <div class="q-field"><label for="tAdults">${esc(t("adults"))}</label><select id="tAdults" name="adults">${opt(1, 20, sel.adults)}</select></div>
            <div class="q-field"><label for="tChildren">${esc(t("children"))}</label><select id="tChildren" name="children">${opt(0, 10, sel.children)}</select></div>
          </div>
          <div class="q-field"><label for="tName">${esc(t("name"))}</label><input id="tName" name="name" autocomplete="name" required></div>
          <div class="q-field"><label for="tPhone">${esc(t("phone"))}</label><input id="tPhone" name="phone" type="tel" dir="ltr" autocomplete="tel" required></div>
          <div class="q-field"><label for="tNotes">${esc(t("notes"))}</label><textarea id="tNotes" name="notes" rows="2"></textarea></div>
          <div class="estimate">${esc(t("estimate"))}: <b dir="ltr">${esc(money(trip.priceFrom * people))}+</b> · ${people} ${esc(t("travelers"))}</div>
          <p class="gate-error" id="tripErr" hidden>${esc(t("pickDate"))}</p>
          <button class="gate-btn wa" type="submit">💬 ${esc(dates.length ? t("book") : t("bookPackage"))}</button>
        </form>
        <div class="trip-actions">
          ${trip.center ? `<button class="pill" data-trip-explore="${esc(trip.id)}">🧭 ${esc(t("exploreDest"))}</button>` : ""}
          <button class="pill" data-trip-share="${esc(trip.id)}">🔗 ${esc(t("share"))}</button>
        </div>
      </div>`;
  }

  function submit(form) {
    const trip = TRIPS.find((x) => x.id === form.dataset.tripId);
    const f = new FormData(form);
    const dates = upcoming(trip);
    let when;
    if (dates.length) {
      const d = dates.find((x) => x.start === sel.date);
      if (!d) { document.getElementById("tripErr").hidden = false; return; }
      when = dateRange(d);
    } else {
      when = `${f.get("from")} → ${f.get("to")}`;
    }
    const msg = [
      `*${t("msgTitle")}*`,
      `${trip.flag} ${L(trip.title)}`,
      `${t("date")}: ${when}`,
      `${t("adults")}: ${f.get("adults")} · ${t("children")}: ${f.get("children")}`,
      `${t("name")}: ${f.get("name")}`,
      `${t("phone")}: ${f.get("phone")}`,
      f.get("notes") ? `${t("notes").replace(/ \(.*\)/, "")}: ${f.get("notes")}` : "",
    ].filter(Boolean).join("\n");
    const url = `https://wa.me/${encodeURIComponent(C.contact.whatsapp)}?text=${encodeURIComponent(msg)}`;
    document.getElementById("sheetContent").innerHTML = `
      <h2>✅ ${esc(t("ready"))}</h2>
      <p class="muted">${esc(t("readyHint"))}</p>
      <pre class="order-text">${esc(msg)}</pre>
      <a class="gate-btn wa" href="${esc(url)}" target="_blank" rel="noopener">💬 ${esc(t("sendWa"))}</a>`;
  }

  // ---------- events ----------
  document.addEventListener("click", async (e) => {
    const fBtn = e.target.closest("[data-trip-filter]");
    if (fBtn) { filter = fBtn.dataset.tripFilter; render(); return; }
    const card = e.target.closest("[data-trip]");
    if (card) { openTrip(card.dataset.trip); return; }
    const dBtn = e.target.closest("[data-trip-date]");
    if (dBtn) { sel.date = dBtn.dataset.tripDate; drawTrip(TRIPS.find((x) => x.id === sel.id)); return; }
    const ex = e.target.closest("[data-trip-explore]");
    if (ex) {
      const trip = TRIPS.find((x) => x.id === ex.dataset.tripExplore);
      document.getElementById("sheet").hidden = true;
      document.body.style.overflow = "";
      App.exploreAt({ lat: trip.center.lat, lon: trip.center.lon, label: L(trip.title) });
      return;
    }
    const sh = e.target.closest("[data-trip-share]");
    if (sh) {
      const url = location.href.split("#")[0] + "#trip-" + sh.dataset.tripShare;
      try {
        if (navigator.share) await navigator.share({ title: C.businessName, url });
        else { await navigator.clipboard.writeText(url); App.toast(t("copied")); }
      } catch { /* cancelled */ }
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches("[data-trip]")) openTrip(e.target.dataset.trip);
  });
  document.addEventListener("change", (e) => {
    if (!sel) return;
    if (e.target.id === "tAdults" || e.target.id === "tChildren") {
      const el = (f, n) => f.elements.namedItem(n);
      const form = e.target.form;
      sel.adults = +el(form, "adults").value; sel.children = +el(form, "children").value;
      const keep = ["name", "phone", "notes"].map((n) => [n, el(form, n).value]);
      if (el(form, "from")) { sel.from = el(form, "from").value; sel.to = el(form, "to").value; }
      drawTrip(TRIPS.find((x) => x.id === sel.id));
      const nf = document.getElementById("tripForm");
      keep.forEach(([n, v]) => { el(nf, n).value = v; });
    }
  });
  document.addEventListener("submit", (e) => {
    if (e.target.id !== "tripForm") return;
    e.preventDefault();
    submit(e.target);
  });
  document.addEventListener("langchange", () => { render(); });

  render();
  const m = location.hash.match(/^#trip-([\w-]+)$/);
  if (m) openTrip(m[1]);
})();
