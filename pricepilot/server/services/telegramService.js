
const axios = require("axios");

async function sendTelegramAlert(message) {
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      throw new Error("Telegram environment variables are missing");
    }

    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message,
      }
    );

    console.log("Telegram alert sent successfully");

    return response.data;

  } catch (error) {
    console.error(
      "Telegram notification failed:",
      error.response?.data || error.message
    );

    throw error;
  }
}

module.exports = { sendTelegramAlert };
