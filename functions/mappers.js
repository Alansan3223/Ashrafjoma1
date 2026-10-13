// Convert Duffel API objects into compact offers for the app.
const { breakdown } = require("./pricing");

function bags(segment) {
  const b = segment?.passengers?.[0]?.baggages || [];
  const checked = b.filter((x) => x.type === "checked").reduce((n, x) => n + (x.quantity || 0), 0);
  const carry = b.filter((x) => x.type === "carry_on").reduce((n, x) => n + (x.quantity || 0), 0);
  return { checked, carry };
}

function mapFlightOffer(o) {
  const cost = parseFloat(o.total_amount);
  return {
    id: o.id,
    airline: o.owner?.name || "",
    airlineCode: o.owner?.iata_code || "",
    logo: o.owner?.logo_symbol_url || "",
    currency: o.total_currency,
    expiresAt: o.expires_at || null,
    slices: (o.slices || []).map((s) => {
      const segs = s.segments || [];
      return {
        from: s.origin?.iata_code, fromCity: s.origin?.city_name || s.origin?.name || "",
        to: s.destination?.iata_code, toCity: s.destination?.city_name || s.destination?.name || "",
        departAt: segs[0]?.departing_at || "",
        arriveAt: segs[segs.length - 1]?.arriving_at || "",
        duration: s.duration || "",
        stops: Math.max(0, segs.length - 1),
        via: segs.slice(0, -1).map((g) => g.destination?.iata_code).filter(Boolean),
        flights: segs.map((g) => `${g.marketing_carrier?.iata_code || ""}${g.marketing_carrier_flight_number || ""}`),
        bags: bags(segs[0]),
      };
    }),
    ...breakdown(cost, "flight"),
  };
}

function mapHotelResult(r, nights) {
  const a = r.accommodation || {};
  const cost = parseFloat(r.cheapest_rate_total_amount);
  const addr = a.location?.address || {};
  return {
    id: r.id,
    name: a.name || "",
    stars: a.rating || null,
    reviewScore: a.review_score || null,
    address: [addr.line_one, addr.city_name].filter(Boolean).join(", "),
    lat: a.location?.geographic_coordinates?.latitude ?? null,
    lon: a.location?.geographic_coordinates?.longitude ?? null,
    photo: a.photos?.[0]?.url || "",
    currency: r.cheapest_rate_currency,
    nights,
    ...breakdown(cost, "hotel"),
  };
}

// Strip internal numbers before sending to the customer.
const publicOffer = ({ cost, fees, profit, ...rest }) => rest;

module.exports = { mapFlightOffer, mapHotelResult, publicOffer };
