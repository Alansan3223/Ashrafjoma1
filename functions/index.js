/* Server functions (Firebase Cloud Functions) for ASHRF Remas Tours.
 * - Only approved users (or the admin) can call them.
 * - The Duffel API key stays on the server (secret DUFFEL_TOKEN).
 * - Supplier cost and profit are stored in admin-only documents.
 */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { mapFlightOffer, mapHotelResult, publicOffer } = require("./mappers");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ region: "europe-west1", maxInstances: 5 });
const DUFFEL_TOKEN = defineSecret("DUFFEL_TOKEN");
const ADMIN_EMAILS = ["ante.wbs@gmail.com"]; // keep in sync with config.js and firestore.rules
const opts = { secrets: [DUFFEL_TOKEN], timeoutSeconds: 60 };

const IATA = /^[A-Z]{3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const CABINS = ["economy", "premium_economy", "business", "first"];

async function requireApproved(req) {
  if (!req.auth) throw new HttpsError("unauthenticated", "Sign in first");
  const t = req.auth.token;
  if (t.email_verified && ADMIN_EMAILS.includes(String(t.email).toLowerCase())) return null;
  const snap = await db.doc(`users/${req.auth.uid}`).get();
  if (!snap.exists || snap.get("status") !== "approved") throw new HttpsError("permission-denied", "Account not approved");
  return snap.data();
}

async function duffel(path, { method = "GET", body } = {}) {
  const res = await fetch("https://api.duffel.com" + path, {
    method,
    headers: {
      Authorization: `Bearer ${DUFFEL_TOKEN.value()}`,
      "Duffel-Version": "v2",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify({ data: body }) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    logger.error("Duffel error", res.status, json.errors);
    throw new HttpsError("unavailable", json.errors?.[0]?.message || `Supplier error ${res.status}`);
  }
  return json.data;
}

function int(v, min, max, def) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
}

function checkDate(d, name) {
  if (!DATE.test(String(d || ""))) throw new HttpsError("invalid-argument", `Bad ${name}`);
  const today = new Date().toISOString().slice(0, 10);
  if (d < today) throw new HttpsError("invalid-argument", `${name} is in the past`);
  return d;
}

// ---------- airports / cities autocomplete ----------
exports.placeSuggest = onCall(opts, async (req) => {
  await requireApproved(req);
  const q = String(req.data?.query || "").trim().slice(0, 40);
  if (q.length < 2) return [];
  const places = await duffel(`/places/suggestions?query=${encodeURIComponent(q)}`);
  return (places || []).slice(0, 8).map((p) => ({
    code: p.iata_code, name: p.name, type: p.type,
    city: p.city_name || p.city?.name || "", country: p.iata_country_code || "",
  }));
});

// ---------- flights ----------
exports.searchFlights = onCall(opts, async (req) => {
  await requireApproved(req);
  const d = req.data || {};
  const origin = String(d.origin || "").toUpperCase();
  const destination = String(d.destination || "").toUpperCase();
  if (!IATA.test(origin) || !IATA.test(destination)) throw new HttpsError("invalid-argument", "Bad airport code");
  const departDate = checkDate(d.departDate, "departDate");
  const returnDate = d.returnDate ? checkDate(d.returnDate, "returnDate") : null;
  if (returnDate && returnDate < departDate) throw new HttpsError("invalid-argument", "Return before departure");
  const adults = int(d.adults, 1, 9, 1);
  const children = int(d.children, 0, 8, 0);
  const infants = int(d.infants, 0, adults, 0);
  const cabin = CABINS.includes(d.cabin) ? d.cabin : "economy";

  const slices = [{ origin, destination, departure_date: departDate }];
  if (returnDate) slices.push({ origin: destination, destination: origin, departure_date: returnDate });
  const passengers = [
    ...Array(adults).fill({ type: "adult" }),
    ...Array(children).fill({ age: 8 }),
    ...Array(infants).fill({ type: "infant_without_seat" }),
  ];

  const result = await duffel("/air/offer_requests?return_offers=true&supplier_timeout=20000", {
    method: "POST",
    body: { slices, passengers, cabin_class: cabin, max_connections: 1 },
  });
  const offers = (result.offers || [])
    .map(mapFlightOffer)
    .filter((o) => Number.isFinite(o.cost))
    .sort((a, b) => a.price - b.price)
    .slice(0, 30);

  const params = { origin, destination, departDate, returnDate, adults, children, infants, cabin };
  const ref = await db.collection("searches").add({
    uid: req.auth.uid, type: "flight", params, offers, createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { searchId: ref.id, offers: offers.map(publicOffer) };
});

// ---------- hotels ----------
exports.searchHotels = onCall(opts, async (req) => {
  await requireApproved(req);
  const d = req.data || {};
  const lat = Number(d.lat), lon = Number(d.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    throw new HttpsError("invalid-argument", "Bad location");
  }
  const checkIn = checkDate(d.checkIn, "checkIn");
  const checkOut = checkDate(d.checkOut, "checkOut");
  const nights = Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000);
  if (nights < 1 || nights > 30) throw new HttpsError("invalid-argument", "Bad dates");
  const adults = int(d.adults, 1, 9, 2);
  const children = int(d.children, 0, 6, 0);
  const rooms = int(d.rooms, 1, 5, 1);

  const result = await duffel("/stays/search", {
    method: "POST",
    body: {
      location: { radius: 10, geographic_coordinates: { latitude: lat, longitude: lon } },
      check_in_date: checkIn,
      check_out_date: checkOut,
      rooms,
      guests: [...Array(adults).fill({ type: "adult" }), ...Array(children).fill({ type: "child", age: 8 })],
    },
  });
  const hotels = (result.results || [])
    .map((r) => mapHotelResult(r, nights))
    .filter((h) => Number.isFinite(h.cost))
    .sort((a, b) => a.price - b.price)
    .slice(0, 30);

  const params = { place: String(d.place || "").slice(0, 120), lat, lon, checkIn, checkOut, nights, adults, children, rooms };
  const ref = await db.collection("searches").add({
    uid: req.auth.uid, type: "hotel", params, offers: hotels, createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { searchId: ref.id, offers: hotels.map(publicOffer) };
});

// ---------- quote request ----------
exports.requestQuote = onCall({ timeoutSeconds: 30 }, async (req) => {
  const user = await requireApproved(req);
  const { searchId, index } = req.data || {};
  const snap = await db.doc(`searches/${String(searchId)}`).get();
  if (!snap.exists || snap.get("uid") !== req.auth.uid) throw new HttpsError("not-found", "Search not found");
  const offer = (snap.get("offers") || [])[int(index, 0, 999, -1)];
  if (!offer) throw new HttpsError("not-found", "Offer not found");

  const now = admin.firestore.FieldValue.serverTimestamp();
  const quoteRef = db.collection("quotes").doc();
  const pub = publicOffer(offer);
  const batch = db.batch();
  batch.set(quoteRef, {
    uid: req.auth.uid,
    type: snap.get("type"),
    params: snap.get("params"),
    offer: pub,
    price: offer.price,
    currency: offer.currency,
    customer: {
      name: String(req.data.name || user?.name || req.auth.token.name || "").slice(0, 80),
      email: req.auth.token.email || "",
      phone: String(req.data.phone || user?.phone || "").slice(0, 30),
    },
    notes: String(req.data.notes || "").slice(0, 500),
    status: "new",
    createdAt: now,
  });
  batch.set(db.doc(`quotes_private/${quoteRef.id}`), {
    supplierOfferId: offer.id, cost: offer.cost, fees: offer.fees, profit: offer.profit, price: offer.price,
    currency: offer.currency, createdAt: now,
  });
  await batch.commit();
  return { quoteId: quoteRef.id, price: offer.price, currency: offer.currency };
});
