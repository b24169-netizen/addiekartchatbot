let store = []; // in-memory (per-runtime) mock

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { rating, message } = req.body || {};
  const id = "csat_" + Math.random().toString(36).slice(2, 8);
  store.push({ id, rating, message, ts: Date.now() });
  res.status(200).json({ ok: true, id });
};
