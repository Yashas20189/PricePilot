const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
});

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[char]));
}

async function sendPriceAlert({ recipient, product }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email service is not configured.");
  }
  if (!recipient) throw new Error("User email address is missing.");
  const name = escapeHtml(product.name);
  const url = escapeHtml(product.url);
  const current = Number(product.currentPrice).toLocaleString("en-IN");
  const target = Number(product.targetPrice).toLocaleString("en-IN");
  return transporter.sendMail({
    from: `"PricePilot" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject: `Price target reached: ${product.name}`,
    text: `${product.name} is now ₹${current}. Your target was ₹${target}. ${product.url}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px">
      <h2>Your price target has been reached</h2>
      <p><strong>${name}</strong></p>
      <p>Current price: <strong>₹${current}</strong></p>
      <p>Your target: <strong>₹${target}</strong></p>
      <p><a href="${url}">View product</a></p>
      <p style="color:#777;font-size:12px">PricePilot price alert</p>
    </div>`
  });
}
module.exports = { sendPriceAlert, verifyEmailTransport: () => transporter.verify() };
