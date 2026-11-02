require("dotenv").config();

const {
  sendTelegramAlert,
} = require("./services/telegramService");

async function main() {
  await sendTelegramAlert(
    `🚀 PricePilot Test

Telegram notification is working successfully!`
  );
}

main();