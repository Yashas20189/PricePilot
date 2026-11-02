const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
});

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

async function sendPriceAlert({ recipient, product }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email service is not configured. Set EMAIL_USER and EMAIL_PASS.");
  }

  const to = String(recipient || "").trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new Error("A valid registered user email address is required.");
  }

  const productName = String(product?.name || "Your tracked product");
  const productUrl = String(product?.url || "");
  const currentPrice = Number(product?.currentPrice);
  const targetPrice = Number(product?.targetPrice);

  if (!Number.isFinite(currentPrice) || !Number.isFinite(targetPrice)) {
    throw new Error("Price alert is missing a valid current or target price.");
  }

  const safeName = escapeHtml(productName);
  const safeUrl = escapeHtml(productUrl);
  const current = currentPrice.toLocaleString("en-IN");
  const target = targetPrice.toLocaleString("en-IN");

  return transporter.sendMail({
    from: `"PricePilot" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Price target reached: ${productName}`,
    text: `${productName} is now ₹${current}. Your target was ₹${target}. ${productUrl}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px">
      <h2>Your price target has been reached</h2>
      <p><strong>${safeName}</strong></p>
      <p>Current price: <strong>₹${current}</strong></p>
      <p>Your target: <strong>₹${target}</strong></p>
      ${productUrl ? `<p><a href="${safeUrl}">View product</a></p>` : ""}
      <p style="color:#777;font-size:12px">PricePilot price alert</p>
    </div>`,
  });
}

module.exports = {
  sendPriceAlert,
  verifyEmailTransport: async () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email service is not configured. Set EMAIL_USER and EMAIL_PASS.");
    }
    return transporter.verify();
  },
};
