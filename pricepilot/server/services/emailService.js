
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendPriceAlert(product) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `🎉 Price Drop Alert - ${product.name}`,
      html: `
        <h2>Price Drop Alert!</h2>
        <p><strong>Product:</strong> ${product.name}</p>
        <p><strong>Current Price:</strong> ₹${product.currentPrice}</p>
        <p><strong>Target Price:</strong> ₹${product.targetPrice}</p>
        <p>🚀 Time to Buy!</p>
      `,
    });

    console.log("Email sent:", info.messageId);
    return info;

  } catch (error) {
    console.error("Email notification failed:", error.message);
    throw error;
  }
}

module.exports = sendPriceAlert;
