const { sendPriceAlert } = require("./emailService");
const { sendTelegramAlert } = require("./telegramService");

function formatTelegramMessage(product) {
  return [
    "PricePilot price alert",
    product.name || "Tracked product",
    `Current price: ₹${Number(product.currentPrice).toLocaleString("en-IN")}`,
    `Target price: ₹${Number(product.targetPrice).toLocaleString("en-IN")}`,
    product.url || "",
  ].filter(Boolean).join("\\n");
}

async function sendNotificationChannels({ user, product, notification }) {
  const result = {
    emailStatus: notification.emailStatus || "PENDING",
    telegramStatus: user?.telegramChatId
      ? (notification.telegramStatus === "SENT" ? "SENT" : "PENDING")
      : "SKIPPED",
    errors: [],
  };

  if (result.emailStatus !== "SENT") {
    try {
      if (!user?.email) throw new Error("Registered user email is missing.");
      await sendPriceAlert({ recipient: user.email, product });
      result.emailStatus = "SENT";
    } catch (error) {
      result.errors.push(`Email: ${error.message}`);
    }
  }

  if (user?.telegramChatId && result.telegramStatus !== "SENT") {
    try {
      await sendTelegramAlert(user.telegramChatId, formatTelegramMessage(product));
      result.telegramStatus = "SENT";
    } catch (error) {
      result.errors.push(`Telegram: ${error.message}`);
    }
  }

  return result;
}

module.exports = { sendNotificationChannels };
