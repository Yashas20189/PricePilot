
const { chromium } = require("playwright");
const prisma = require("./prismaClient");

const { scrapeProduct } = require("./scrapers/scraperFactory");

const { sendNotifications } = require("./services/notificationService");

async function runScraper() {
  console.log("\n========================================");
  console.log("🚀 Starting PricePilot Scraper");
  console.log("========================================\n");

  let browser;

  try {
    const products = await prisma.product.findMany();

    console.log(`📦 Found ${products.length} products\n`);

    if (products.length === 0) {
      console.log("No products available for scraping.");
      return;
    }

    browser = await chromium.launch({
      headless: true,
    });

    for (const product of products) {
      let page;

      try {
        console.log("----------------------------------------");
        console.log(`📦 ${product.name}`);
        console.log("----------------------------------------");

        page = await browser.newPage();

        page.setDefaultTimeout(30000);
        page.setDefaultNavigationTimeout(45000);

        const result = await scrapeProduct(page, product.url);

        // HANDLE FAILED SCRAPE
        if (!result || !result.success) {
          const reason = result?.reason || "Scraping failed";

          console.log(`❌ ${reason}`);

          await prisma.product.update({
            where: {
              id: product.id,
            },
            data: {
              status: "Failed",
              errorReason: reason,
              lastChecked: result?.scrapedAt || new Date(),
              retryCount: {
                increment: 1,
              },
            },
          });

          continue;
        }

        // VALIDATE SCRAPED PRICE
        const scrapedPrice = Number(result.price);

        if (!Number.isFinite(scrapedPrice) || scrapedPrice < 0) {
          throw new Error("Invalid price received from scraper");
        }

        console.log(`Platform      : ${result.platform}`);
        console.log(`Title         : ${result.title}`);
        console.log(`Price         : ₹${scrapedPrice}`);
        console.log(`Availability  : ${result.availability}`);
        console.log(`Method        : ${result.method}`);

        // UPDATE PRODUCT AND PRICE HISTORY
        await prisma.$transaction([
          prisma.product.update({
            where: {
              id: product.id,
            },
            data: {
              currentPrice: scrapedPrice,
              platform: result.platform,
              image: result.image,
              currency: result.currency,
              availability: result.availability,
              lastChecked: result.scrapedAt || new Date(),
              status: "Success",
              errorReason: null,
              retryCount: 0,
            },
          }),

          prisma.priceHistory.create({
            data: {
              price: scrapedPrice,
              productId: product.id,
            },
          }),
        ]);

        // CHECK TARGET PRICE
        if (
          scrapedPrice <= Number(product.targetPrice) &&
          !product.alertSent
        ) {
          console.log("🎉 Target price reached!");

          try {
            await sendNotifications({
              name: result.title || product.name,
              currentPrice: scrapedPrice,
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

            console.log("✅ Notification process completed.");
          } catch (notificationError) {
            console.error(
              "❌ Notification failed:",
              notificationError.message
            );
          }
        }

        console.log("✅ Database updated.\n");

      } catch (error) {
        console.error("❌ Unexpected Error:", error.message);

        try {
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
        } catch (dbError) {
          console.error(
            "❌ Failed to update product error status:",
            dbError.message
          );
        }

      } finally {
        if (page) {
          await page.close().catch((error) => {
            console.error("Page close error:", error.message);
          });
        }
      }
    }

  } catch (error) {
    console.error("❌ Scraper startup error:", error);

  } finally {
    if (browser) {
      await browser.close().catch((error) => {
        console.error("Browser close error:", error.message);
      });
    }

    console.log("\n========================================");
    console.log("✅ Scraping Completed");
    console.log("========================================\n");
  }
}

module.exports = runScraper;
