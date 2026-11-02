const axios = require("axios");

const TELEGRAM_API = "https://api.telegram.org";

function botConfig() {
  const token = process.env.BOT_TOKEN;
  const username = process.env.TELEGRAM_BOT_USERNAME;
  if (!token) throw new Error("BOT_TOKEN is not configured.");
  return { token, username };
}

async function telegramRequest(method, payload) {
  const { token } = botConfig();
  const response = await axios.post(
    `${TELEGRAM_API}/bot${token}/${method}`,
    payload,
    { timeout: 12000 }
  );
  if (!response.data?.ok) {
    throw new Error(response.data?.description || `Telegram ${method} failed.`);
  }
  return response.data.result;
}

async function getTelegramConnectUrl(linkToken) {
  const { username } = botConfig();
  if (!username) throw new Error("TELEGRAM_BOT_USERNAME is not configured.");
  return `https://t.me/${username}?start=${encodeURIComponent(linkToken)}`;
}

async function sendTelegramAlert(chatId, message) {
  if (!chatId) throw new Error("Telegram chat is not connected.");
  return telegramRequest("sendMessage", {
    chat_id: chatId,
    text: message,
    disable_web_page_preview: true,
  });
}

async function sendTelegramWelcome(chatId) {
  return sendTelegramAlert(
    chatId,
    "Your Telegram account is now connected to PricePilot. You will receive price alerts here."
  );
}

module.exports = {
  telegramRequest,
  getTelegramConnectUrl,
  sendTelegramAlert,
  sendTelegramWelcome,
};
