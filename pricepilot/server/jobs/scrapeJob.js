require("dotenv").config();

const { randomUUID } = require("node:crypto");
const prisma = require("../prismaClient");
const scrapeProducts = require("../scraper");

const LOCK_NAME = "pricepilot-scraper";
const LOCK_MINUTES = Number(process.env.SCRAPER_LOCK_MINUTES || 180);

async function acquireLock(owner) {
  try {
    await prisma.scraperLock.create({ data: { name: LOCK_NAME, owner: null, lockedUntil: null } });
  } catch (error) {
    if (error.code !== "P2002") throw error;
  }
  const result = await prisma.scraperLock.updateMany({
    where: {
      name: LOCK_NAME,
      OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }],
    },
    data: { owner, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000) },
  });
  return result.count === 1;
}

async function main() {
  const owner = randomUUID();
  let locked = false;
  try {
    locked = await acquireLock(owner);
    if (!locked) {
      console.log("[scrape-job] Another scraper owns the lock; this run is skipped.");
      return;
    }
    await scrapeProducts();
  } finally {
    if (locked) {
      await prisma.scraperLock.updateMany({
        where: { name: LOCK_NAME, owner },
        data: { owner: null, lockedUntil: null },
      });
    }
    await prisma.$disconnect();
  }
}

main().catch(error => {
  console.error("[scrape-job] Fatal error:", error);
  process.exitCode = 1;
});
