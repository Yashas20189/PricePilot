const { chromium } = require("playwright");
const prisma = require("./prismaClient");

const {
  scrapeProduct,
} = require("./scrapers/scraperFactory");

const {
  sendNotifications,
} = require("./services/notificationService");

async function runScraper() {
  console.log("\n========================================");
  console.log("🚀 Starting PricePilot Scraper");
  console.log("========================================\n");

  const products = await prisma.product.findMany();

  console.log(`📦 Found ${products.length} products\n`);

  const browser = await chromium.launch({
    headless: false, // Change to true in production
  });

  for (const product of products) {
    const page = await browser.newPage();

    try {
      console.log("----------------------------------------");
      console.log(`📦 ${product.name}`);
      console.log("----------------------------------------");

      const result = await scrapeProduct(
        page,
        product.url
      );

      // ===========================
      // Handle Failed Scrape
      // ===========================

      if (!result.success) {
        console.log(`❌ ${result.reason}`);

        await prisma.product.update({
          where: {
            id: product.id,
          },
          data: {
            status: "Failed",
            errorReason: result.reason,
            lastChecked: result.scrapedAt,
            retryCount: {
              increment: 1,
            },
          },
        });

        continue;
      }

      // ===========================
      // Success
      // ===========================

      console.log(`Platform      : ${result.platform}`);
      console.log(`Title         : ${result.title}`);
      console.log(`Price         : ₹${result.price}`);
      console.log(`Availability  : ${result.availability}`);
      console.log(`Method        : ${result.method}`);

      // Save Product + Price History
      await prisma.$transaction([

        prisma.product.update({
          where: {
            id: product.id,
          },
          data: {

            currentPrice: result.price,

            platform: result.platform,

            image: result.image,

            currency: result.currency,

            availability: result.availability,

            lastChecked: result.scrapedAt,

            status: "Success",

            errorReason: null,

            retryCount: 0,
          },
        }),

        prisma.priceHistory.create({
          data: {
            price: result.price,
            productId: product.id,
          },
        }),

      ]);

      // ===========================
      // Price Drop Notification
      // ===========================

      if (
        result.price <= product.targetPrice &&
        !product.alertSent
      ) {

        console.log("🎉 Target price reached!");

        await sendNotifications({

          name: result.title,

          currentPrice: result.price,

          targetPrice: product.targetPrice,

          url: product.url,

        });

        await prisma.product.update({

          where: {
            id: product.id,
          },

          data: {
            alertSent: true,
          },

        });

        console.log("✅ Notifications sent.");
      }

      console.log("✅ Database updated.\n");

    } catch (error) {

      console.log(`❌ Unexpected Error`);
      console.log(error.message);

      await prisma.product.update({

        where: {
          id: product.id,
        },

        data: {

          status: "Failed",

          errorReason: error.message,

          lastChecked: new Date(),

          retryCount: {
            increment: 1,
          },

        },

      });

    } finally {

      await page.close();

    }
  }

  await browser.close();

  console.log("\n========================================");
  console.log("✅ Scraping Completed");
  console.log("========================================\n");
}

module.exports = runScraper;