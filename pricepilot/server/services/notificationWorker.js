const prisma = require("../prismaClient");
const { sendNotificationChannels } = require("./notificationService");

const MAX_ATTEMPTS = Number(process.env.NOTIFICATION_MAX_ATTEMPTS || 8);

function retryAt(attempt) {
  const minutes = Math.min(2 ** Math.max(0, attempt) * 5, 6 * 60);
  return new Date(Date.now() + minutes * 60 * 1000);
}

async function processNotificationQueue(limit = 25) {
  await prisma.notification.updateMany({
    where: {
      status: "PROCESSING",
      updatedAt: { lt: new Date(Date.now() - 10 * 60 * 1000) },
    },
    data: { status: "PENDING", nextAttemptAt: new Date() },
  });

  const pending = await prisma.notification.findMany({
    where: {
      status: "PENDING",
      nextAttemptAt: { lte: new Date() },
      attempts: { lt: MAX_ATTEMPTS },
    },
    include: {
      user: { select: { id: true, email: true, telegramChatId: true } },
      product: { select: { id: true, name: true, url: true, currentPrice: true, targetPrice: true } },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  for (const notification of pending) {
    const claim = await prisma.notification.updateMany({
      where: { id: notification.id, status: "PENDING", attempts: notification.attempts },
      data: { status: "PROCESSING", attempts: { increment: 1 } },
    });
    if (claim.count !== 1) continue;

    try {
      const productForAlert = {
        ...notification.product,
        currentPrice: notification.priceAtTrigger ?? notification.product.currentPrice,
        targetPrice: notification.targetPriceAtTrigger ?? notification.product.targetPrice,
      };

      const channelResults = await sendNotificationChannels({
        user: notification.user,
        product: productForAlert,
        notification,
      });

      const complete = channelResults.emailStatus === "SENT" &&
        (channelResults.telegramStatus === "SENT" || channelResults.telegramStatus === "SKIPPED");
      const attempts = notification.attempts + 1;
      const failedPermanently = !complete && attempts >= MAX_ATTEMPTS;

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          emailStatus: channelResults.emailStatus,
          telegramStatus: channelResults.telegramStatus,
          status: complete ? "SENT" : (failedPermanently ? "FAILED" : "PENDING"),
          sentAt: complete ? new Date() : null,
          nextAttemptAt: complete || failedPermanently
            ? new Date("9999-12-31T00:00:00.000Z")
            : retryAt(attempts),
          lastError: channelResults.errors.length
            ? channelResults.errors.join(" | ").slice(0, 1000)
            : null,
        },
      });

      console.log(`[notifications] ${complete ? "Completed" : "Partially delivered"} notification ${notification.id}; email=${channelResults.emailStatus}, telegram=${channelResults.telegramStatus}`);
    } catch (error) {
      const attempts = notification.attempts + 1;
      const failedPermanently = attempts >= MAX_ATTEMPTS;
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: failedPermanently ? "FAILED" : "PENDING",
          nextAttemptAt: failedPermanently
            ? new Date("9999-12-31T00:00:00.000Z")
            : retryAt(attempts),
          lastError: String(error.message || error).slice(0, 1000),
        },
      });
      console.error(`[notifications] Delivery failed for ${notification.id} (attempt ${attempts}/${MAX_ATTEMPTS}):`, error.message);
    }
  }

  return pending.length;
}

module.exports = { processNotificationQueue };
