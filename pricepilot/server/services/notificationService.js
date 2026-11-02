const { sendPriceAlert } = require("./emailService");
const { sendTelegramAlert } = require("./telegramService");

async function sendNotifications({ user, product }) {
  const tasks = [];
  // Email is user-specific and is the primary delivery channel.
  tasks.push(["email", () => sendPriceAlert({ recipient: user.email, product })]);

  // Telegram is optional; when configured it is an additional channel.
  if (process.env.BOT_TOKEN && process.env.CHAT_ID) {
    const message = `Price target reached!\n\n${product.name}\nCurrent: ₹${product.currentPrice}\nTarget: ₹${product.targetPrice}\n${product.url}`;
    tasks.push(["telegram", () => sendTelegramAlert(message)]);
  }

  const results = await Promise.allSettled(tasks.map(([, send]) => send()));
  const channels = {};
  let delivered = false;
  results.forEach((result, index) => {
    const channel = tasks[index][0];
    channels[channel] = result.status === "fulfilled" ? "sent" : "failed";
    if (result.status === "fulfilled") delivered = true;
    else console.error(`${channel} notification failed:`, result.reason?.message || result.reason);
  });

  if (!delivered) {
    const reasons = results.filter(x => x.status === "rejected").map(x => x.reason?.message || "Unknown error");
    throw new Error(`All notification channels failed: ${reasons.join("; ")}`);
  }
  return { delivered: true, channels };
}
module.exports = { sendNotifications };
