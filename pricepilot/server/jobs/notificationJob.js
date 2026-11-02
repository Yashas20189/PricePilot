require("dotenv").config();

const prisma = require("../prismaClient");
const { processNotificationQueue } = require("../services/notificationWorker");

async function main() {
  try {
    const processed = await processNotificationQueue(
      Number(process.env.NOTIFICATION_BATCH_SIZE || 25)
    );
    console.log(`[notification-job] Queue pass complete. Candidates: ${processed}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(error => {
  console.error("[notification-job] Fatal error:", error);
  process.exitCode = 1;
});
