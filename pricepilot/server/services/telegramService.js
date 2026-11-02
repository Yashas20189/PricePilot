const axios = require("axios");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function sendTelegramAlert(message) {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message,
      }
    );

    console.log("✅ Telegram alert sent");
    return response.data;

  } catch (error) {
    console.log("❌ Telegram Error");
    console.log(error.response?.data || error.message);
  }
}

module.exports = { sendTelegramAlert };