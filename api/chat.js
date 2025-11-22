const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { detectIntent } = require("../lib/intents.cjs");
const { answerFAQ } = require("../lib/faq.cjs");
const { findOrder } = require("../lib/orders.cjs");

async function grokFallback(prompt) {
  const key = "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";
  if (!key) return "I’m not fully sure. Let me connect you to a human agent.";

  try {
    const resp = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "grok-2-latest",
        messages: [
          { role: "system", content: "You are a concise e-commerce support assistant for Addiekart. If unsure, ask for orderId/email/phone or escalate politely." },
          { role: "user", content: prompt }
        ]
      })
    });
    const data = await resp.json();
    return data?.choices?.[0]?.message?.content || "Sorry, I couldn’t generate a response.";
  } catch (e) {
    console.error("Grok API error:", e?.message || e);
    return "I’m not fully sure. Let me connect you to a human agent.";
  }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message, orderId, email, phone } = req.body || {};
  const intent = detectIntent(message || "");

  // FAQ
  if (intent === "FAQ") {
    const a = answerFAQ(message);
    if (a) return res.status(200).json({ intent, answer: a, escalate: false });
  }

  // ORDER STATUS
  if (intent === "ORDER_STATUS") {
    const order = findOrder({ orderId, email, phone });
    if (!order) {
      return res.status(200).json({
        intent,
        answer: "I couldn’t find that order. Share orderId (e.g., 12345) or the email/phone linked to the order.",
        needVerification: true,
        escalate: false
      });
    }
    // Structured payload for UI wireframe
    const steps = ["Ordered","Packed","Shipped","Out for delivery","Delivered"];
    const currentIndex = Math.max(0, steps.findIndex(s => order.status.toLowerCase().includes(s.toLowerCase())));
    return res.status(200).json({
      intent,
      answer: `Order ${order.orderId}: ${order.status}. ETA: ${order.eta}. Return eligible until ${order.return.eligibleUntil}.`,
      order,
      timeline: { steps, currentIndex },
      escalate: false
    });
  }

  // REFUND STATUS
  if (intent === "REFUND_STATUS") {
    const order = findOrder({ orderId, email, phone });
    if (!order) {
      return res.status(200).json({
        intent,
        answer: "To check refund, share orderId / email / phone linked to that order.",
        needVerification: true,
        escalate: false
      });
    }
    return res.status(200).json({
      intent,
      answer: `Refund status for ${order.orderId}: ${order.refund.status}${order.refund.date ? ` (on ${order.refund.date})` : ""}.`,
      order,
      escalate: false
    });
  }

  // OTHER → Grok fallback (optional)
  const answer = await grokFallback(message || "");
  const escalate = /not fully sure|connect you to a human/i.test(answer);
  res.status(200).json({ intent, answer, escalate });
};
