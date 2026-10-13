// Pricing: the customer price guarantees a NET profit of `margin` on the supplier cost,
// after payment-processor and supplier fees. All values can be changed here.
const PRICING = {
  margin: 0.20,              // 20% net profit on cost
  paymentFeePct: 0.044,      // PayPal (international) ≈ 4.4%
  paymentFeeFixed: 0.30,     // PayPal fixed fee per payment
  supplier: {
    flight: { pct: 0.01, fixed: 3 },  // Duffel: ~1% + $3 per order
    hotel: { pct: 0, fixed: 0 },
  },
};

function breakdown(cost, type) {
  const s = PRICING.supplier[type] || { pct: 0, fixed: 0 };
  const target = cost * (1 + PRICING.margin) + cost * s.pct + s.fixed + PRICING.paymentFeeFixed;
  const price = Math.ceil(target / (1 - PRICING.paymentFeePct)); // round up to a whole unit
  const fees = price * PRICING.paymentFeePct + PRICING.paymentFeeFixed + cost * s.pct + s.fixed;
  const profit = +(price - cost - fees).toFixed(2);
  return { cost: +cost.toFixed(2), price, fees: +fees.toFixed(2), profit };
}

module.exports = { PRICING, breakdown };
