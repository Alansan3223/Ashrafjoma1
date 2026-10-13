/* ASHRF Remas Tours — tourism finder (PWA)
 * Data: OpenStreetMap via Overpass API (places, transit) and Nominatim (search, addresses).
 */
(() => {
  "use strict";

  const C = window.APP_CONFIG;
  const I18N = window.I18N;

  const OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  ];
  const NOMINATIM = "https://nominatim.openstreetmap.org";
  const RADII = [1000, 3000, 10000, 25000];

  // ISO 3166-1 alpha-2 codes; names come from Intl.DisplayNames in the UI language.
  const COUNTRY_CODES = ("AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MO MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS XK YE ZA ZM ZW").split(" ");

  // Overpass selectors per category. {A} is replaced with the around() filter.
  const CATEGORIES = [
    { id: "attractions", icon: "🏛️", q: [
      'nwr["tourism"~"^(attraction|museum|viewpoint|gallery|zoo|theme_park|aquarium)$"]["name"]{A};',
      'nwr["historic"~"^(castle|monument|ruins|archaeological_site|fort|memorial|city_gate|palace)$"]["name"]{A};',
    ]},
    { id: "restaurants", icon: "🍽️", q: [
      'nwr["amenity"~"^(restaurant|fast_food)$"]["name"]{A};',
    ]},
    { id: "cafes", icon: "☕", q: [
      'nwr["amenity"~"^(cafe|ice_cream)$"]["name"]{A};',
    ]},
    { id: "hotels", icon: "🏨", q: [
      'nwr["tourism"~"^(hotel|guest_house|hostel|motel|apartment|chalet)$"]["name"]{A};',
    ]},
    { id: "nature", icon: "🏖️", q: [
      'nwr["natural"~"^(beach|peak|waterfall|cave_entrance|spring|bay)$"]["name"]{A};',
      'nwr["leisure"~"^(park|nature_reserve|garden|beach_resort)$"]["name"]{A};',
      'nwr["boundary"="national_park"]["name"]{A};',
    ]},
    { id: "shopping", icon: "🛍️", q: [
      'nwr["shop"~"^(mall|department_store|souvenir)$"]["name"]{A};',
      'nwr["amenity"="marketplace"]["name"]{A};',
    ]},
    { id: "religious", icon: "🕌", q: [
      'nwr["amenity"="place_of_worship"]["name"]{A};',
    ]},
  ];

  const TYPE_ICONS = {
    museum: "🏛️", gallery: "🖼️", viewpoint: "🌄", zoo: "🦁", aquarium: "🐠", theme_park: "🎢",
    attraction: "⭐", castle: "🏰", monument: "🗿", ruins: "🏚️", archaeological_site: "🏺", fort: "🏯",
    memorial: "🕯️", city_gate: "🚪", palace: "🏰",
    restaurant: "🍽️", fast_food: "🍔", cafe: "☕", ice_cream: "🍦",
    hotel: "🏨", guest_house: "🏡", hostel: "🛏️", motel: "🏩", apartment: "🏢", chalet: "🛖",
    beach: "🏖️", peak: "⛰️", waterfall: "💧", cave_entrance: "🕳️", spring: "💧", bay: "🌊",
    park: "🌳", nature_reserve: "🌿", garden: "🌷", beach_resort: "🏝️", national_park: "🏞️",
    mall: "🛍️", department_store: "🏬", souvenir: "🎁", marketplace: "🧺",
    christian: "⛪", muslim: "🕌", jewish: "🕍", buddhist: "☸️", hindu: "🛕", place_of_worship: "🛐",
  };

  const MODE_ICONS = { bus: "🚌", trolleybus: "🚎", tram: "🚊", light_rail: "🚈", subway: "🚇", train: "🚆", monorail: "🚝", ferry: "⛴️" };

  // ---------- state ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  const state = {
    lang: store.get("lang", null) || pickLang(),
    center: null,       // { lat, lon, label, country }
    me: null,           // { lat, lon }
    category: "attractions",
    radius: store.get("radius", 3000),
    places: [],
    favorites: store.get("favorites", []),
    view: "explore",
    reqId: 0,
  };

  function pickLang() {
    // Hebrew by default; Arabic phones get Arabic. English is available from the switcher.
    const nav = (navigator.language || "").slice(0, 2);
    return nav === "ar" || nav === "he" ? nav : (C.defaultLanguage || "he");
  }

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const t = (k) => (I18N[state.lang] && I18N[state.lang][k]) || I18N.en[k] || k;

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function safeUrl(u) {
    if (!u) return null;
    let s = String(u).trim().split(";")[0];
    if (!/^https?:\/\//i.test(s)) s = "https://" + s;
    try { const url = new URL(s); return /^https?:$/.test(url.protocol) ? url.href : null; } catch { return null; }
  }

  function toast(msg, ms = 2600) {
    const el = $("#toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (el.hidden = true), ms);
  }

  // ---------- geo helpers ----------
  function haversine(a, b) {
    const R = 6371000, rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function fmtDist(m) {
    return m < 1000 ? `${Math.round(m / 10) * 10} ${t("m")}` : `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} ${t("km")}`;
  }
  const walkMinutes = (m) => Math.max(1, Math.round((m * 1.25) / 80));
  const driveMinutes = (m) => Math.max(2, Math.round(((m * 1.35) / 1000 / 40) * 60 + 3));

  // ---------- network ----------
  async function fetchJSON(url, opts = {}, timeoutMs = 30000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...opts, signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async function overpass(query) {
    let lastErr;
    for (const ep of OVERPASS_ENDPOINTS) {
      try {
        return await fetchJSON(ep, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "data=" + encodeURIComponent(query),
        });
      } catch (e) { lastErr = e; }
    }
    throw lastErr;
  }

  function nominatim(path, params) {
    const qs = new URLSearchParams({ format: "jsonv2", "accept-language": state.lang, ...params });
    return fetchJSON(`${NOMINATIM}/${path}?${qs}`, {}, 20000);
  }

  // ---------- OSM element helpers ----------
  function elName(tags) {
    return tags[`name:${state.lang}`] || tags.name || tags["name:en"] || tags.brand || t("unnamed");
  }
  function elCoords(el) {
    if (el.lat != null) return { lat: el.lat, lon: el.lon };
    if (el.center) return { lat: el.center.lat, lon: el.center.lon };
    return null;
  }
  function elType(tags) {
    if (tags.amenity === "place_of_worship") return tags.religion && TYPE_ICONS[tags.religion] ? tags.religion : "place_of_worship";
    return tags.tourism || tags.historic || tags.amenity || tags.natural || tags.leisure || tags.shop || (tags.boundary === "national_park" ? "national_park" : "") || "attraction";
  }
  function elAddress(tags) {
    const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
    const parts = [street || tags["addr:place"], tags["addr:city"] || tags["addr:town"] || tags["addr:village"], tags["addr:postcode"]].filter(Boolean);
    return tags["addr:full"] || parts.join(", ");
  }
  function typeLabel(tags) {
    const type = elType(tags);
    const cuisine = tags.cuisine ? " · " + tags.cuisine.split(";").slice(0, 2).join(", ").replace(/_/g, " ") : "";
    const names = (window.TYPE_NAMES || {})[type];
    const idx = { he: 0, ar: 1 }[state.lang];
    return (names && idx != null ? names[idx] : type.replace(/_/g, " ")) + cuisine;
  }
  function notability(tags) {
    return (tags.wikidata ? 2 : 0) + (tags.wikipedia ? 1 : 0) + (tags.tourism === "attraction" ? 1 : 0) +
      (tags.website || tags["contact:website"] ? 0.5 : 0) + (tags.opening_hours ? 0.3 : 0) + (tags.stars ? 0.3 : 0);
  }
  function toPlace(el) {
    const c = elCoords(el);
    if (!c) return null;
    return { id: `${el.type[0]}${el.id}`, lat: c.lat, lon: c.lon, tags: el.tags || {} };
  }

  // ---------- branding & language ----------
  function setLogo(img) {
    img.src = C.logo;
    img.onerror = () => { img.onerror = null; img.src = C.logoFallback; };
  }

  function applyBrand() {
    const r = document.documentElement.style;
    r.setProperty("--primary", C.colors.primary);
    r.setProperty("--primary-dark", C.colors.primaryDark || C.colors.primary);
    r.setProperty("--accent", C.colors.accent);
    if (C.colors.teal) r.setProperty("--teal", C.colors.teal);
    setLogo($("#brandLogo"));
    setLogo($("#aboutLogo"));
    $("#brandName").textContent = C.businessName;
    $("#aboutName").textContent = C.businessName;
    $("#brandTagline").textContent = C.tagline;
    $("#aboutTagline").textContent = C.tagline;
  }

  function applyLang() {
    const d = I18N[state.lang];
    document.documentElement.lang = state.lang;
    document.documentElement.dir = d.dir;
    $$("[data-t]").forEach((el) => (el.textContent = t(el.dataset.t)));
    $("#searchInput").placeholder = t("searchPlaceholder");
    $("#countryFilter").placeholder = t("countrySearch");
    $("#langSelect").innerHTML = Object.keys(I18N).map((k) => `<option value="${k}" ${k === state.lang ? "selected" : ""}>${I18N[k].langName}</option>`).join("");
    renderCategories();
    renderRadius();
    renderContact();
    renderCurrentPlace();
    renderResults();
    renderFavorites();
  }

  // ---------- explore UI ----------
  function renderCategories() {
    $("#categories").innerHTML = CATEGORIES.map((c) =>
      `<button class="cat ${c.id === state.category ? "active" : ""}" data-cat="${c.id}"><span>${c.icon}</span>${esc(t("cat_" + c.id))}</button>`
    ).join("");
  }

  function renderRadius() {
    $("#radiusBtns").innerHTML = RADII.map((r) =>
      `<button data-r="${r}" class="${r === state.radius ? "active" : ""}">${r / 1000} ${esc(t("km"))}</button>`
    ).join("");
  }

  function renderCurrentPlace() {
    const el = $("#currentPlace");
    if (!state.center) { el.hidden = true; return; }
    el.hidden = false;
    const wa = C.contact.whatsapp
      ? `<a class="wa" target="_blank" rel="noopener" href="https://wa.me/${encodeURIComponent(C.contact.whatsapp)}?text=${encodeURIComponent(t("whatsappMsg") + (state.center.label || ""))}">💬 ${esc(t("whatsappUs"))}</a>`
      : "";
    el.innerHTML = `<div>📍 <b>${esc(state.center.label || "")}</b></div>${wa}`;
  }

  function placeCard(p, origin) {
    const tags = p.tags;
    const fav = isFav(p.id);
    const addr = elAddress(tags);
    const ref = origin || state.me;
    const dist = ref ? haversine(ref, p) : null;
    const meta = [];
    if (dist != null) meta.push(`<span class="tag dist">📏 ${fmtDist(dist)}</span>`);
    if (tags.opening_hours) meta.push(`<span class="tag">🕒 ${esc(tags.opening_hours.length > 28 ? tags.opening_hours.slice(0, 28) + "…" : tags.opening_hours)}</span>`);
    if (tags.stars) meta.push(`<span class="tag">${"★".repeat(Math.min(5, parseInt(tags.stars, 10) || 0))}</span>`);
    if (tags.wikipedia || tags.wikidata) meta.push(`<span class="tag">⭐</span>`);
    return `
      <div class="card" data-open="${p.id}" role="button" tabindex="0">
        <div class="card-icon">${TYPE_ICONS[elType(tags)] || "📍"}</div>
        <div class="card-main">
          <p class="card-title">${esc(elName(tags))}</p>
          <p class="card-sub">${esc(addr || typeLabel(tags))}</p>
          <div class="card-meta">${meta.join("")}</div>
        </div>
        <button class="fav-btn" data-fav="${p.id}" aria-label="${esc(fav ? t("removeFavorite") : t("addFavorite"))}">${fav ? "♥" : "♡"}</button>
      </div>`;
  }

  function renderResults() {
    const box = $("#results");
    if (state.loading) {
      box.innerHTML = `<div class="state"><div class="spinner"></div>${esc(t("loading"))}</div>` + '<div class="skeleton"></div>'.repeat(3);
      $("#resultsCount").textContent = "";
      return;
    }
    if (state.error) {
      box.innerHTML = `<div class="state">${esc(t("error"))}<br><button class="pill primary" id="retryBtn">${esc(t("retry"))}</button></div>`;
      return;
    }
    if (!state.center) {
      box.innerHTML = `<div class="empty">🧭<br>${esc(t("pickPlace"))}</div>`;
      $("#resultsCount").textContent = "";
      return;
    }
    $("#resultsCount").textContent = state.places.length ? `${state.places.length} ${t("resultsCount")}` : "";
    box.innerHTML = state.places.length
      ? state.places.map((p) => placeCard(p, state.center)).join("")
      : `<div class="empty">${esc(t("noResults"))}</div>`;
  }

  // ---------- data loading ----------
  async function loadPlaces() {
    if (!state.center) return;
    const id = ++state.reqId;
    const cat = CATEGORIES.find((c) => c.id === state.category);
    const A = `(around:${state.radius},${state.center.lat},${state.center.lon})`;
    const query = `[out:json][timeout:25];(${cat.q.map((s) => s.replace("{A}", A)).join("")});out center 200;`;
    state.loading = true; state.error = false;
    renderResults();
    try {
      const data = await overpass(query);
      if (id !== state.reqId) return;
      const seen = new Set();
      const places = [];
      for (const el of data.elements || []) {
        const p = toPlace(el);
        if (!p) continue;
        const key = elName(p.tags) + "|" + p.lat.toFixed(3) + p.lon.toFixed(3);
        if (seen.has(key)) continue;
        seen.add(key);
        p._score = haversine(state.center, p) / state.radius - 0.25 * notability(p.tags);
        places.push(p);
      }
      places.sort((a, b) => a._score - b._score);
      state.places = places.slice(0, 120);
      cachePlaces(state.places);
    } catch (e) {
      if (id !== state.reqId) return;
      console.error(e);
      state.error = true;
      state.places = [];
    } finally {
      if (id === state.reqId) {
        state.loading = false;
        renderResults();
        renderMapMarkers();
      }
    }
  }

  const placeCache = new Map();
  function cachePlaces(list) { list.forEach((p) => placeCache.set(p.id, p)); }
  function findPlace(id) { return placeCache.get(id) || state.favorites.find((f) => f.id === id); }

  function setCenter(center, { load = true } = {}) {
    state.center = center;
    store.set("lastCenter", center);
    renderCurrentPlace();
    if (map) map.setView([center.lat, center.lon], zoomForRadius());
    if (load) loadPlaces();
  }
  const zoomForRadius = () => ({ 1000: 15, 3000: 14, 10000: 12, 25000: 11 }[state.radius] || 13);

  // ---------- search ----------
  async function doSearch(q) {
    const list = $("#searchSuggestions");
    list.hidden = false;
    list.innerHTML = `<li>${esc(t("loading"))}</li>`;
    try {
      const res = await nominatim("search", { q, limit: 8, addressdetails: 1 });
      if (!res.length) { list.innerHTML = `<li>${esc(t("noResults"))}</li>`; return; }
      list.innerHTML = res.map((r, i) => `<li tabindex="0" data-i="${i}"><b>${esc(r.name || r.display_name.split(",")[0])}</b><small>${esc(r.display_name)}</small></li>`).join("");
      list._results = res;
    } catch {
      list.innerHTML = `<li>${esc(t("error"))}</li>`;
    }
  }

  function chooseSearchResult(r) {
    $("#searchSuggestions").hidden = true;
    $("#searchInput").value = "";
    const cc = r.address && r.address.country_code ? r.address.country_code.toUpperCase() : null;
    if (r.addresstype === "country" || r.type === "country") {
      if (cc) return chooseCountry(cc);
    }
    const label = r.name || r.display_name.split(",")[0];
    setCenter({ lat: +r.lat, lon: +r.lon, label, country: cc });
    if (cc) loadCities(cc);
  }

  // ---------- countries & cities ----------
  function flag(cc) {
    return cc === "XK" ? "🇽🇰" : String.fromCodePoint(...[...cc].map((c) => 0x1f1a5 + c.charCodeAt(0)));
  }
  function countryName(cc, lang = state.lang) {
    try { return new Intl.DisplayNames([lang], { type: "region" }).of(cc); } catch { return cc; }
  }

  function renderCountryList(filter = "") {
    const f = filter.trim().toLowerCase();
    const items = COUNTRY_CODES
      .map((cc) => ({ cc, name: countryName(cc), en: countryName(cc, "en") }))
      .filter((c) => !f || c.name.toLowerCase().includes(f) || c.en.toLowerCase().includes(f) || c.cc.toLowerCase() === f)
      .sort((a, b) => a.name.localeCompare(b.name, state.lang));
    $("#countryList").innerHTML = items.map((c) => `<li data-cc="${c.cc}"><span class="flag">${flag(c.cc)}</span>${esc(c.name)}</li>`).join("");
  }

  async function chooseCountry(cc) {
    closeSheet("#countrySheet");
    const chips = $("#cityChips");
    chips.hidden = false;
    chips.innerHTML = `<span class="chips-title">${flag(cc)} ${esc(countryName(cc))}</span><span class="chip">${esc(t("loading"))}</span>`;
    const cities = await loadCities(cc);
    if (cities && cities.length) {
      const c = cities[0];
      setCenter({ lat: c.lat, lon: c.lon, label: c.name, country: cc });
    } else {
      try {
        const r = await nominatim("search", { q: countryName(cc, "en"), featureType: "country", limit: 1 });
        if (r[0]) setCenter({ lat: +r[0].lat, lon: +r[0].lon, label: countryName(cc), country: cc });
      } catch { toast(t("error")); }
    }
  }

  const cityCache = {};
  async function loadCities(cc) {
    const chips = $("#cityChips");
    chips.hidden = false;
    if (!cityCache[cc]) {
      const q = (place) => `[out:json][timeout:40];area["ISO3166-1"="${cc}"][admin_level=2]->.a;node(area.a)["place"~"^(${place})$"]["population"];out 400;`;
      try {
        let data = await overpass(q("city"));
        if ((data.elements || []).length < 4) data = await overpass(q("city|town"));
        cityCache[cc] = (data.elements || [])
          .map((e) => ({ lat: e.lat, lon: e.lon, tags: e.tags, pop: parseInt(String(e.tags.population).replace(/[^\d]/g, ""), 10) || 0 }))
          .sort((a, b) => b.pop - a.pop)
          .slice(0, 20);
      } catch {
        chips.innerHTML = `<span class="chips-title">${flag(cc)} ${esc(countryName(cc))}</span>`;
        return null;
      }
    }
    const cities = cityCache[cc].map((c) => ({ ...c, name: elName(c.tags) }));
    chips.innerHTML = `<span class="chips-title">${flag(cc)} ${esc(t("popularCities"))}</span>` +
      cities.map((c, i) => `<button class="chip" data-city="${i}" data-cc="${cc}">${esc(c.name)}</button>`).join("");
    return cities;
  }

  // ---------- geolocation ----------
  function locateMe({ setAsCenter = true } = {}) {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        state.me = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        renderMeMarker();
        if (!setAsCenter) { renderResults(); return; }
        setCenter({ ...state.me, label: t("nearMe") });
        try {
          const r = await nominatim("reverse", { lat: state.me.lat, lon: state.me.lon, zoom: 10, addressdetails: 1 });
          const a = r.address || {};
          const label = a.city || a.town || a.village || a.county || r.name;
          if (label && state.center && state.center.lat === state.me.lat) {
            state.center.label = label;
            state.center.country = (a.country_code || "").toUpperCase();
            renderCurrentPlace();
            if (state.center.country) loadCities(state.center.country);
          }
        } catch { /* label stays "near me" */ }
      },
      () => {
        if (setAsCenter) {
          toast(t("locationDenied"));
          if (!state.center) setCenter({ lat: C.defaultCenter.lat, lon: C.defaultCenter.lon, label: C.contact.address?.[state.lang] || "" });
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 120000 }
    );
  }

  // ---------- map ----------
  let map, markersLayer, meMarker;
  function ensureMap() {
    if (map || !window.L) return;
    const c = state.center || C.defaultCenter;
    map = L.map("map", { zoomControl: true }).setView([c.lat, c.lon], zoomForRadius());
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
    renderMapMarkers();
    renderMeMarker();
  }

  function pinIcon(emoji) {
    return L.divIcon({ className: "", html: `<div class="map-pin"><span>${emoji}</span></div>`, iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -30] });
  }

  function renderMapMarkers() {
    if (!map) return;
    markersLayer.clearLayers();
    state.places.forEach((p) => {
      const m = L.marker([p.lat, p.lon], { icon: pinIcon(TYPE_ICONS[elType(p.tags)] || "📍") });
      m.bindPopup(`<b>${esc(elName(p.tags))}</b><br><small>${esc(elAddress(p.tags) || typeLabel(p.tags))}</small><br><button class="popup-btn" data-open="${p.id}">${esc(t("howToGet"))}</button>`);
      markersLayer.addLayer(m);
    });
    if (state.places.length) {
      const b = L.latLngBounds(state.places.map((p) => [p.lat, p.lon]));
      map.fitBounds(b.pad(0.1), { maxZoom: 16 });
    } else if (state.center) {
      map.setView([state.center.lat, state.center.lon], zoomForRadius());
    }
  }

  function renderMeMarker() {
    if (!map || !state.me) return;
    const icon = L.divIcon({ className: "", html: '<div class="me-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
    if (meMarker) meMarker.setLatLng([state.me.lat, state.me.lon]);
    else meMarker = L.marker([state.me.lat, state.me.lon], { icon, zIndexOffset: 1000 }).addTo(map);
  }

  // ---------- views ----------
  function showView(v) {
    if (!$(`#view-${v}`)) return;
    state.view = v;
    $$(".view").forEach((el) => el.classList.toggle("active", el.id === `view-${v}`));
    $$(".tabbar button").forEach((b) => b.classList.toggle("active", b.dataset.view === v));
    if (v === "map") {
      ensureMap();
      setTimeout(() => map && map.invalidateSize(), 50);
    }
    if (v === "favorites") renderFavorites();
    document.dispatchEvent(new CustomEvent("viewchange", { detail: v }));
    window.scrollTo(0, 0);
  }

  // ---------- favorites ----------
  const isFav = (id) => state.favorites.some((f) => f.id === id);
  function toggleFav(id) {
    if (isFav(id)) {
      state.favorites = state.favorites.filter((f) => f.id !== id);
    } else {
      const p = findPlace(id);
      if (!p) return;
      state.favorites.unshift({ id: p.id, lat: p.lat, lon: p.lon, tags: p.tags });
    }
    store.set("favorites", state.favorites);
    $$(`[data-fav="${id}"]`).forEach((b) => {
      const on = isFav(id);
      b.textContent = on ? "♥" : "♡";
      b.setAttribute("aria-label", on ? t("removeFavorite") : t("addFavorite"));
    });
    const sheetFav = $("#sheetFav");
    if (sheetFav && sheetFav.dataset.id === id) sheetFav.innerHTML = favLabel(id);
    if (state.view === "favorites") renderFavorites();
  }
  const favLabel = (id) => (isFav(id) ? `♥ ${esc(t("removeFavorite"))}` : `♡ ${esc(t("addFavorite"))}`);

  function renderFavorites() {
    $("#favorites").innerHTML = state.favorites.length
      ? state.favorites.map((p) => placeCard(p)).join("")
      : `<div class="empty">♡<br>${esc(t("noFavorites"))}</div>`;
  }

  // ---------- contact ----------
  function renderContact() {
    const c = C.contact;
    const btns = [];
    (c.phones || []).slice(0, 1).forEach((ph) => btns.push(`<a class="nav-btn" href="tel:${esc(ph.replace(/[^\d+]/g, ""))}">📞 ${esc(t("callUs"))}</a>`));
    if (c.whatsapp) btns.push(`<a class="nav-btn" style="background:#25D366;color:#fff;border-color:#25D366" target="_blank" rel="noopener" href="https://wa.me/${encodeURIComponent(c.whatsapp)}">💬 ${esc(t("whatsappUs"))}</a>`);
    if (c.email) btns.push(`<a class="nav-btn" href="mailto:${esc(c.email)}">✉️ ${esc(t("emailUs"))}</a>`);
    if (c.facebook) btns.push(`<a class="nav-btn" target="_blank" rel="noopener" href="${esc(c.facebook)}">📘 Facebook</a>`);
    if (c.tiktok) btns.push(`<a class="nav-btn" target="_blank" rel="noopener" href="${esc(c.tiktok)}">🎵 TikTok</a>`);
    if (c.website) btns.push(`<a class="nav-btn" target="_blank" rel="noopener" href="${esc(c.website)}">🌐 ${esc(t("website"))}</a>`);
    $("#contactBtns").innerHTML = btns.join("");
    const rows = [];
    (c.phones || []).forEach((ph) => rows.push(row("📞", `<a href="tel:${esc(ph.replace(/[^\d+]/g, ""))}" dir="ltr">${esc(ph)}</a>`)));
    if (c.email) rows.push(row("✉️", `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`));
    if (c.address) rows.push(row("📍", esc(c.address[state.lang] || c.address.en)));
    $("#contactInfo").innerHTML = rows.join("");
  }
  const row = (k, v) => `<div class="row"><span class="k">${k}</span><span class="v">${v}</span></div>`;

  // ---------- details sheet ----------
  let miniMap;
  function openSheet(sel) { $(sel).hidden = false; document.body.style.overflow = "hidden"; }
  function closeSheet(sel) {
    $(sel).hidden = true;
    if ($$(".sheet").every((s) => s.hidden)) document.body.style.overflow = "";
    if (sel === "#sheet" && location.hash.startsWith("#p=")) history.replaceState(null, "", location.pathname + location.search);
  }

  function navLinks(p) {
    const ll = `${p.lat},${p.lon}`;
    const name = elName(p.tags);
    return {
      transit: `https://www.google.com/maps/dir/?api=1&destination=${ll}&travelmode=transit`,
      walking: `https://www.google.com/maps/dir/?api=1&destination=${ll}&travelmode=walking`,
      driving: `https://www.google.com/maps/dir/?api=1&destination=${ll}&travelmode=driving`,
      waze: `https://waze.com/ul?ll=${ll}&navigate=yes`,
      apple: `https://maps.apple.com/?daddr=${ll}&dirflg=r`,
      moovit: `https://moovitapp.com/?to=${encodeURIComponent(name)}&tll=${p.lat}_${p.lon}&lang=${state.lang}`,
    };
  }

  function openPlace(id) {
    const p = findPlace(id);
    if (!p) return;
    const tags = p.tags;
    const name = elName(tags);
    const addr = elAddress(tags);
    const links = navLinks(p);
    const website = safeUrl(tags.website || tags["contact:website"] || tags.url);
    const phone = tags.phone || tags["contact:phone"];
    const wiki = tags.wikipedia && tags.wikipedia.includes(":")
      ? `https://${tags.wikipedia.split(":")[0]}.wikipedia.org/wiki/${encodeURIComponent(tags.wikipedia.split(":").slice(1).join(":"))}`
      : null;

    const rows = [
      row(esc(t("address")), `<span id="addrVal">${esc(addr || "…")}</span>`),
      row(esc(t("coordinates")), `<span dir="ltr">${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}</span>`),
    ];
    if (tags.opening_hours) rows.push(row(esc(t("openingHours")), `<span dir="ltr">${esc(tags.opening_hours)}</span>`));
    if (tags.cuisine) rows.push(row(esc(t("cuisine")), esc(tags.cuisine.replace(/[_;]/g, " "))));
    if (phone) rows.push(row(esc(t("phone")), `<a dir="ltr" href="tel:${esc(phone.split(";")[0].replace(/[^\d+]/g, ""))}">${esc(phone.split(";")[0])}</a>`));
    if (website) rows.push(row(esc(t("website")), `<a target="_blank" rel="noopener" href="${esc(website)}">${esc(new URL(website).hostname)}</a>`));
    if (wiki) rows.push(row("Wikipedia", `<a target="_blank" rel="noopener" href="${esc(wiki)}">${esc(tags.wikipedia.split(":").slice(1).join(":"))}</a>`));

    const eta = [];
    if (state.me) {
      const d = haversine(state.me, p);
      eta.push(`<span class="tag dist">📏 ${fmtDist(d)} ${esc(t("fromYou"))}</span>`);
      if (d < 4000) eta.push(`<span class="tag">🚶 ~${walkMinutes(d)} ${esc(t("min"))}</span>`);
      eta.push(`<span class="tag">🚗 ~${driveMinutes(d)} ${esc(t("min"))}</span>`);
    }

    const waText = `${t("whatsappMsg")}${state.center?.label || ""} — ${name}`;
    $("#sheetContent").innerHTML = `
      <div class="detail-head">
        <div class="card-icon">${TYPE_ICONS[elType(tags)] || "📍"}</div>
        <div><h2>${esc(name)}</h2><div class="muted">${esc(typeLabel(tags))}</div></div>
      </div>
      <div class="detail-actions">
        <button class="pill" id="sheetFav" data-fav-toggle="${p.id}" data-id="${p.id}">${favLabel(p.id)}</button>
        <button class="pill" id="shareBtn">🔗 ${esc(t("share"))}</button>
      </div>
      <div class="box">${rows.join("")}</div>
      <div id="miniMap" class="mini-map"></div>
      <div class="box">
        <h3>🧭 ${esc(t("howToGet"))}</h3>
        ${eta.length ? `<div class="eta">${eta.join("")}</div>` : ""}
        <div class="nav-grid">
          <a class="nav-btn transit" target="_blank" rel="noopener" href="${links.transit}">🚌 ${esc(t("transit"))} — Google Maps</a>
          <a class="nav-btn" target="_blank" rel="noopener" href="${links.moovit}">🚏 Moovit</a>
          <a class="nav-btn" target="_blank" rel="noopener" href="${links.walking}">🚶 ${esc(t("walking"))}</a>
          <a class="nav-btn" target="_blank" rel="noopener" href="${links.waze}">🚗 Waze</a>
          <a class="nav-btn" target="_blank" rel="noopener" href="${links.apple}">🍎 Apple Maps</a>
        </div>
      </div>
      <div class="box">
        <h3>🚏 ${esc(t("transitNearby"))}</h3>
        <div id="transitBox"><div class="muted"><div class="spinner"></div>${esc(t("transitLoading"))}</div></div>
      </div>
      ${C.contact.whatsapp ? `<a class="cta" target="_blank" rel="noopener" href="https://wa.me/${encodeURIComponent(C.contact.whatsapp)}?text=${encodeURIComponent(waText)}">💬 ${esc(t("bookTrip"))}</a>` : ""}
    `;
    openSheet("#sheet");
    history.replaceState(null, "", `#p=${p.id}`);

    $("#shareBtn").onclick = async () => {
      const url = location.href;
      const text = `${name}${addr ? " — " + addr : ""}\n${C.businessName}`;
      try {
        if (navigator.share) await navigator.share({ title: name, text, url });
        else { await navigator.clipboard.writeText(url); toast(t("copied")); }
      } catch { /* share cancelled */ }
    };

    // mini map
    if (window.L) {
      if (miniMap) { miniMap.remove(); miniMap = null; }
      miniMap = L.map("miniMap", { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false }).setView([p.lat, p.lon], 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(miniMap);
      L.marker([p.lat, p.lon], { icon: pinIcon(TYPE_ICONS[elType(tags)] || "📍") }).addTo(miniMap);
      miniMap._stops = L.layerGroup().addTo(miniMap);
      setTimeout(() => miniMap && miniMap.invalidateSize(), 80);
    }

    if (!addr) reverseAddress(p);
    loadTransit(p);
  }

  async function reverseAddress(p) {
    try {
      const r = await nominatim("reverse", { lat: p.lat, lon: p.lon, zoom: 18 });
      const el = $("#addrVal");
      if (el && $("#sheetFav")?.dataset.id === p.id) el.textContent = r.display_name || "—";
    } catch {
      const el = $("#addrVal");
      if (el) el.textContent = "—";
    }
  }

  function stopKind(tags) {
    if (tags.railway === "subway_entrance" || tags.station === "subway" || tags.subway === "yes") return ["subway", t("stopTypeSubway")];
    if (tags.railway === "tram_stop" || tags.tram === "yes") return ["tram", t("stopTypeTram")];
    if (tags.railway === "station" || tags.railway === "halt" || tags.train === "yes") return ["train", t("stopTypeTrain")];
    if (tags.amenity === "ferry_terminal" || tags.ferry === "yes") return ["ferry", t("stopTypeFerry")];
    if (tags.highway === "bus_stop" || tags.bus === "yes") return ["bus", t("stopTypeBus")];
    return ["bus", t("stopTypeStation")];
  }

  async function loadTransit(p) {
    const box = $("#transitBox");
    const q = `[out:json][timeout:25];
      (
        node["highway"="bus_stop"](around:600,${p.lat},${p.lon});
        node["public_transport"="platform"]["bus"="yes"](around:600,${p.lat},${p.lon});
        node["railway"~"^(station|halt|tram_stop|subway_entrance)$"](around:1200,${p.lat},${p.lon});
        node["public_transport"="station"](around:1200,${p.lat},${p.lon});
        node["amenity"="ferry_terminal"](around:1200,${p.lat},${p.lon});
      )->.s;
      .s out body;
      rel(bn.s)["type"="route"]["route"~"^(bus|trolleybus|tram|subway|train|light_rail|monorail|ferry)$"];
      out body;`;
    try {
      const data = await overpass(q);
      if ($("#sheetFav")?.dataset.id !== p.id) return; // sheet changed meanwhile
      const nodes = data.elements.filter((e) => e.type === "node");
      const rels = data.elements.filter((e) => e.type === "relation");
      const routesByNode = new Map();
      for (const r of rels) {
        for (const m of r.members || []) {
          if (m.type !== "node") continue;
          if (!routesByNode.has(m.ref)) routesByNode.set(m.ref, new Map());
          const ref = r.tags.ref || r.tags.name || "?";
          routesByNode.get(m.ref).set(`${r.tags.route}:${ref}`, { mode: r.tags.route, ref, to: r.tags.to });
        }
      }
      // group stops by name+kind so both sides of the street merge
      const groups = new Map();
      for (const n of nodes) {
        const tags = n.tags || {};
        const [kind, kindLabel] = stopKind(tags);
        const name = elName(tags);
        const key = `${kind}|${name}`;
        const d = haversine(p, n);
        const g = groups.get(key) || { kind, kindLabel, name, d, lat: n.lat, lon: n.lon, lines: new Map() };
        if (d < g.d) Object.assign(g, { d, lat: n.lat, lon: n.lon });
        (routesByNode.get(n.id) || new Map()).forEach((v, k) => g.lines.set(k, v));
        groups.set(key, g);
      }
      const stops = [...groups.values()]
        .sort((a, b) => (a.kind === "bus" ? a.d : a.d * 0.6) - (b.kind === "bus" ? b.d : b.d * 0.6))
        .slice(0, 8);

      if (!stops.length) { box.innerHTML = `<div class="muted">${esc(t("transitNone"))}</div>`; return; }

      const modes = new Map();
      rels.forEach((r) => modes.set(r.tags.route, (modes.get(r.tags.route) || 0) + 1));
      const modeTags = [...modes.entries()].map(([m, n]) => `<span class="tag">${MODE_ICONS[m] || "🚏"} ${esc(t("mode_" + m))} · ${n} ${esc(t("lines"))}</span>`).join("");

      box.innerHTML = (modeTags ? `<div class="modes">${modeTags}</div>` : "") + stops.map((s) => {
        const lines = [...s.lines.values()]
          .sort((a, b) => a.ref.localeCompare(b.ref, undefined, { numeric: true }))
          .slice(0, 14)
          .map((l) => `<span class="line mode-${esc(l.mode)}" title="${esc(l.to || "")}">${MODE_ICONS[l.mode] || ""} ${esc(l.ref)}</span>`).join("");
        return `<div class="stop">
          <div class="stop-icon">${MODE_ICONS[s.kind] || "🚏"}</div>
          <div class="stop-main">
            <div class="stop-name">${esc(s.name === t("unnamed") ? s.kindLabel : s.name)}</div>
            <div class="muted">${esc(s.kindLabel)} · ${fmtDist(s.d)} · ${walkMinutes(s.d)} ${esc(t("walkMin"))}</div>
            ${lines ? `<div class="lines">${lines}</div>` : ""}
          </div>
        </div>`;
      }).join("");

      if (miniMap && miniMap._stops) {
        const pts = [[p.lat, p.lon]];
        stops.forEach((s) => {
          L.marker([s.lat, s.lon], { icon: L.divIcon({ className: "", html: `<div class="stop-dot">${MODE_ICONS[s.kind] || "🚏"}</div>`, iconSize: [22, 22], iconAnchor: [11, 11] }) }).addTo(miniMap._stops);
          pts.push([s.lat, s.lon]);
        });
        miniMap.fitBounds(L.latLngBounds(pts).pad(0.2), { maxZoom: 17 });
      }
    } catch (e) {
      console.error(e);
      if ($("#sheetFav")?.dataset.id === p.id) box.innerHTML = `<div class="muted">${esc(t("error"))}</div>`;
    }
  }

  async function openFromHash() {
    const m = location.hash.match(/^#p=([nwr])(\d+)$/);
    if (!m) return;
    const id = m[1] + m[2];
    if (findPlace(id)) return openPlace(id);
    const type = { n: "node", w: "way", r: "relation" }[m[1]];
    try {
      const data = await overpass(`[out:json][timeout:20];${type}(${m[2]});out center;`);
      const p = data.elements[0] && toPlace(data.elements[0]);
      if (p) { cachePlaces([p]); openPlace(p.id); }
    } catch { /* ignore broken links */ }
  }

  // ---------- events ----------
  function bind() {
    $("#langSelect").addEventListener("change", (e) => {
      state.lang = e.target.value;
      store.set("lang", state.lang);
      applyLang();
      document.dispatchEvent(new CustomEvent("langchange", { detail: state.lang }));
      if ($("#countrySheet").hidden === false) renderCountryList($("#countryFilter").value);
    });

    $("#searchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = $("#searchInput").value.trim();
      if (q) doSearch(q);
    });
    $("#searchSuggestions").addEventListener("click", (e) => {
      const li = e.target.closest("li[data-i]");
      if (li) chooseSearchResult($("#searchSuggestions")._results[+li.dataset.i]);
    });

    $("#nearMeBtn").addEventListener("click", () => locateMe());
    $("#countryBtn").addEventListener("click", () => {
      renderCountryList();
      $("#countryFilter").value = "";
      openSheet("#countrySheet");
    });
    $("#countryFilter").addEventListener("input", (e) => renderCountryList(e.target.value));
    $("#countryList").addEventListener("click", (e) => {
      const li = e.target.closest("li[data-cc]");
      if (li) chooseCountry(li.dataset.cc);
    });

    $("#cityChips").addEventListener("click", async (e) => {
      const b = e.target.closest("[data-city]");
      if (!b) return;
      const cities = await loadCities(b.dataset.cc);
      const c = cities && cities[+b.dataset.city];
      if (c) setCenter({ lat: c.lat, lon: c.lon, label: c.name, country: b.dataset.cc });
    });

    $("#categories").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      state.category = b.dataset.cat;
      renderCategories();
      loadPlaces();
    });
    $("#radiusBtns").addEventListener("click", (e) => {
      const b = e.target.closest("[data-r]");
      if (!b) return;
      state.radius = +b.dataset.r;
      store.set("radius", state.radius);
      renderRadius();
      loadPlaces();
    });

    document.addEventListener("click", (e) => {
      const fav = e.target.closest("[data-fav], [data-fav-toggle]");
      if (fav) { e.stopPropagation(); toggleFav(fav.dataset.fav || fav.dataset.favToggle); return; }
      const open = e.target.closest("[data-open]");
      if (open) { openPlace(open.dataset.open); return; }
      if (e.target.closest("#retryBtn")) { loadPlaces(); return; }
      const close = e.target.closest("[data-close]");
      if (close) closeSheet("#" + close.closest(".sheet").id);
      if (!e.target.closest("#searchSuggestions, #searchForm")) $("#searchSuggestions").hidden = true;
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") $$(".sheet").forEach((s) => !s.hidden && closeSheet("#" + s.id));
      if (e.key === "Enter" && e.target.matches("[data-open], li[data-i], li[data-cc]")) e.target.click();
    });

    $$(".tabbar button").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));
    window.addEventListener("hashchange", openFromHash);

    let deferredPrompt;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      $("#installBtn").hidden = false;
    });
    $("#installBtn").addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      $("#installBtn").hidden = true;
    });
  }

  // ---------- init ----------
  // UI is prepared immediately; data (location, places) only loads after the
  // access gate (auth.js) calls window.startApp() for an approved user.
  function prepare() {
    applyBrand();
    bind();
    applyLang();
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  let started = false;
  function start() {
    if (started) return;
    started = true;
    const last = store.get("lastCenter", null);
    if (last) {
      setCenter(last);
      if (last.country) loadCities(last.country);
      locateMe({ setAsCenter: false });
    } else {
      locateMe();
    }
    openFromHash();
  }

  window.App = {
    start,
    showView,
    getLang: () => state.lang,
    getCenter: () => state.center,
    setLang(lang) {
      if (!I18N[lang] || lang === state.lang) return;
      state.lang = lang;
      store.set("lang", lang);
      applyLang();
    },
    esc,
  };

  prepare();
})();
