const axios = require("axios");

async function sendTelegramAlert(message) {
  const token = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;
  if (!token || !chatId) throw new Error("Telegram is not configured.");
  const response = await axios.post(
    `https://api.telegram.org/bot${token}/sendMessage`,
    { chat_id: chatId, text: message, disable_web_page_preview: true },
    { timeout: 10000 }
  );
  if (!response.data?.ok) throw new Error("Telegram API did not confirm delivery.");
  return response.data;
}
module.exports = { sendTelegramAlert };
