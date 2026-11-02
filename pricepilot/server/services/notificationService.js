const sendPriceAlert = require("./emailService");
const { sendTelegramAlert } = require("./telegramService");

async function sendNotifications(product) {
  try {
    // Email Notification
    await sendPriceAlert(product);
    console.log("✅ Email notification sent");

    // Telegram Notification
    await sendTelegramAlert(
      `🎉 Price Drop Alert!

📦 Product: ${product.name}

💰 Current Price: ₹${product.currentPrice}

🎯 Target Price: ₹${product.targetPrice}

🔗 ${product.url}`
    );

    console.log("✅ Telegram notification sent");

  } catch (error) {
    console.log("❌ Notification Error");
    console.log(error.message);
  }
}

module.exports = {
  sendNotifications,
};