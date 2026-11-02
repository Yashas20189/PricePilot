
const sendPriceAlert = require("./emailService");
const { sendTelegramAlert } = require("./telegramService");

async function sendNotifications(product) {
  const results = await Promise.allSettled([
    sendPriceAlert(product),

    sendTelegramAlert(
      `🎉 Price Drop Alert!

📦 Product: ${product.name}

💰 Current Price: ₹${product.currentPrice}

🎯 Target Price: ₹${product.targetPrice}

🔗 ${product.url}`
    ),
  ]);

  const [emailResult, telegramResult] = results;

  if (emailResult.status === "fulfilled") {
    console.log("✅ Email notification sent");
  } else {
    console.error("❌ Email notification failed:", emailResult.reason.message);
  }

  if (telegramResult.status === "fulfilled") {
    console.log("✅ Telegram notification sent");
  } else {
    console.error("❌ Telegram notification failed:", telegramResult.reason.message);
  }

  return {
    email: emailResult.status,
    telegram: telegramResult.status,
  };
}

module.exports = {
  sendNotifications,
};
