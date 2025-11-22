const path = require("path");
const fs = require("fs");

const dataPath = path.join(process.cwd(), "data", "orders.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

function findOrder({ orderId, email, phone }) {
  const id = (orderId || "").trim();
  const em = (email || "").trim().toLowerCase();
  const ph = (phone || "").trim();
  return data.find(o =>
    (id && o.orderId === id) ||
    (em && o.email.toLowerCase() === em) ||
    (ph && o.phone === ph)
  ) || null;
}
module.exports = { findOrder };
