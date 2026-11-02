const cron = require("node-cron");
const { randomUUID } = require("node:crypto");
const prisma = require("./prismaClient");
const scrapeProducts = require("./scraper");
const { processNotificationQueue } = require("./services/notificationWorker");

const LOCK_NAME = "pricepilot-scraper";
const LOCK_MINUTES = Number(process.env.SCRAPER_LOCK_MINUTES || 180);

async function acquireLock(owner) {
  try {
    await prisma.scraperLock.create({ data: { name: LOCK_NAME, owner: null, lockedUntil: null } });
  } catch (error) {
    if (error.code !== "P2002") throw error;
  }
  const result = await prisma.scraperLock.updateMany({
    where: { name: LOCK_NAME, OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }] },
    data: { owner, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000) },
  });
  return result.count === 1;
}

async function runScheduledJobs() {
  const owner = randomUUID();
  const locked = await acquireLock(owner);
  if (!locked) {
    console.log("[cron] Another instance owns the scraper lock. Skipping this run.");
    return;
  }
  try {
    await scrapeProducts();
  } finally {
    await prisma.scraperLock.updateMany({
      where: { name: LOCK_NAME, owner },
      data: { owner: null, lockedUntil: null },
    });
  }
}

if (process.env.DISABLE_CRON !== "true") {
  cron.schedule(process.env.SCRAPER_CRON || "*/30 * * * *", async () => {
    try { await runScheduledJobs(); }
    catch (error) { console.error("[cron] Scraper job failed:", error); }
  });
  cron.schedule("*/2 * * * *", async () => {
    try { await processNotificationQueue(); }
    catch (error) { console.error("[cron] Notification worker failed:", error); }
  });
  console.log("[cron] Scraper and notification workers scheduled.");
}

module.exports = { runScheduledJobs };
