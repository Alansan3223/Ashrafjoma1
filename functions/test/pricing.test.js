const test = require("node:test");
const assert = require("node:assert");
const { breakdown, PRICING } = require("../pricing");
const { mapFlightOffer, mapHotelResult, publicOffer } = require("../mappers");

test("net profit is at least 20% of cost after all fees", () => {
  for (const type of ["flight", "hotel"]) {
    for (const cost of [35, 99.5, 250, 812.4, 2400]) {
      const b = breakdown(cost, type);
      assert.ok(b.profit >= cost * PRICING.margin - 0.01, `${type} ${cost}: ${JSON.stringify(b)}`);
      assert.ok(b.profit < cost * PRICING.margin + 2, `rounding adds at most ~1 unit: ${JSON.stringify(b)}`);
      assert.strictEqual(b.price, Math.round(b.price));
    }
  }
});

test("maps a Duffel flight offer", () => {
  const o = mapFlightOffer({
    id: "off_1", total_amount: "250.00", total_currency: "USD", expires_at: "2026-11-01T10:00:00Z",
    owner: { name: "El Al", iata_code: "LY", logo_symbol_url: "x.svg" },
    slices: [{ origin: { iata_code: "TLV", city_name: "Tel Aviv" }, destination: { iata_code: "CDG", city_name: "Paris" }, duration: "PT5H10M",
      segments: [
        { departing_at: "2026-11-20T08:30:00", arriving_at: "2026-11-20T10:00:00", destination: { iata_code: "ATH" }, marketing_carrier: { iata_code: "LY" }, marketing_carrier_flight_number: "541", passengers: [{ baggages: [{ type: "checked", quantity: 1 }, { type: "carry_on", quantity: 1 }] }] },
        { departing_at: "2026-11-20T11:00:00", arriving_at: "2026-11-20T13:40:00", destination: { iata_code: "CDG" }, marketing_carrier: { iata_code: "A3" }, marketing_carrier_flight_number: "610" },
      ] }],
  });
  assert.strictEqual(o.slices[0].stops, 1);
  assert.deepStrictEqual(o.slices[0].via, ["ATH"]);
  assert.deepStrictEqual(o.slices[0].flights, ["LY541", "A3610"]);
  assert.deepStrictEqual(o.slices[0].bags, { checked: 1, carry: 1 });
  assert.strictEqual(o.cost, 250);
  const pub = publicOffer(o);
  assert.ok(!("cost" in pub) && !("profit" in pub) && !("fees" in pub) && pub.price > 300);
});

test("maps a Duffel stays result", () => {
  const h = mapHotelResult({ id: "srr_1", cheapest_rate_total_amount: "420.00", cheapest_rate_currency: "EUR",
    accommodation: { name: "Hotel X", rating: 4, review_score: 8.6, photos: [{ url: "p.jpg" }],
      location: { address: { line_one: "1 Rue A", city_name: "Paris" }, geographic_coordinates: { latitude: 48.8, longitude: 2.3 } } } }, 3);
  assert.strictEqual(h.name, "Hotel X");
  assert.strictEqual(h.address, "1 Rue A, Paris");
  assert.strictEqual(h.nights, 3);
  assert.ok(h.price > 420 * 1.2);
});
