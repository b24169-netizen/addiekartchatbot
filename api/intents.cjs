function detectIntent(text) {
  const t = (text || "").toLowerCase();
  if (t.includes("where is my order") || t.includes("order status") || /\b\d{5}\b/.test(t)) return "ORDER_STATUS";
  if (t.includes("refund") && (t.includes("status") || t.includes("when"))) return "REFUND_STATUS";
  if (t.includes("return") || t.includes("refund") || t.includes("policy") || t.includes("shipping") || t.includes("cod"))
    return "FAQ";
  return "OTHER";
}
module.exports = { detectIntent };
