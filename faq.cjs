const POLICIES = {
  returnWindowDays: 7,
  refundTimeline: "2–5 business days after pickup",
  cod: "Available for eligible pin codes and items under ₹10,000.",
  shipping: "Standard delivery in 2–5 days; express in 1–2 days where available."
};

function answerFAQ(q) {
  const t = (q || "").toLowerCase();
  if (t.includes("return") || t.includes("exchange")) {
    return `Return window: ${POLICIES.returnWindowDays} days from delivery. Item must be unused with tags.`;
  }
  if (t.includes("refund")) {
    return `Refund timeline: ${POLICIES.refundTimeline}. Track refund in your Orders.`;
  }
  if (t.includes("cod") || t.includes("cash on delivery")) {
    return POLICIES.cod;
  }
  if (t.includes("shipping") || t.includes("delivery time")) {
    return POLICIES.shipping;
  }
  return null;
}
module.exports = { POLICIES, answerFAQ };
