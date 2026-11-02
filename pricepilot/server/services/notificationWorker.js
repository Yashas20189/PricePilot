const prisma = require("../prismaClient");
const { sendNotifications } = require("./notificationService");

const MAX_ATTEMPTS = Number(process.env.NOTIFICATION_MAX_ATTEMPTS || 8);

function retryAt(attempt) {
  const minutes = Math.min(2 ** Math.max(0, attempt) * 5, 6 * 60);
  return new Date(Date.now() + minutes * 60 * 1000);
}

async function processNotificationQueue(limit = 25) {
  // Recover work left PROCESSING by a process that crashed mid-send.
  await prisma.notification.updateMany({
    where: { status: "PROCESSING", updatedAt: { lt: new Date(Date.now() - 10 * 60 * 1000) } },
    data: { status: "PENDING", nextAttemptAt: new Date() },
  });

  const pending = await prisma.notification.findMany({
    where: { status: "PENDING", nextAttemptAt: { lte: new Date() }, attempts: { lt: MAX_ATTEMPTS } },
    include: {
      user: { select: { id: true, email: true } },
      product: { select: { id: true, name: true, url: true, currentPrice: true, targetPrice: true } },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  for (const notification of pending) {
    // Claim atomically so two workers do not send the same outbox item together.
    const claim = await prisma.notification.updateMany({
      where: { id: notification.id, status: "PENDING", attempts: notification.attempts },
      data: { status: "PROCESSING", attempts: { increment: 1 } },
    });
    if (claim.count !== 1) continue;

    try {
      await sendNotifications({ user: notification.user, product: notification.product });
      await prisma.$transaction([
        prisma.notification.update({
          where: { id: notification.id },
          data: { status: "SENT", sentAt: new Date(), lastError: null },
        }),
        prisma.product.update({
          where: { id: notification.productId },
          data: { alertSent: true },
        }),
      ]);
      console.log(`[notifications] Delivered notification ${notification.id}`);
    } catch (error) {
      const attempts = notification.attempts + 1;
      const failedPermanently = attempts >= MAX_ATTEMPTS;
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: failedPermanently ? "FAILED" : "PENDING",
          nextAttemptAt: failedPermanently ? new Date("9999-12-31T00:00:00.000Z") : retryAt(attempts),
          lastError: String(error.message || error).slice(0, 1000),
        },
      });
      console.error(`[notifications] Delivery ${notification.id} failed (attempt ${attempts}/${MAX_ATTEMPTS}):`, error.message);
    }
  }
  return pending.length;
}

module.exports = { processNotificationQueue };
