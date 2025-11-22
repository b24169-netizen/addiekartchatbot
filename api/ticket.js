let tickets = []; // in-memory (per-runtime) mock

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { message, orderId, email, phone } = req.body || {};
  const id = "ADK-" + Math.floor(Math.random() * 900000 + 100000);
  tickets.push({ id, message, orderId, email, phone, ts: Date.now(), status: "OPEN" });
  res.status(200).json({ ok: true, ticketId: id, status: "OPEN" });
};
