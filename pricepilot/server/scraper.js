const { chromium } = require("playwright");
const prisma = require("./prismaClient");
const { scrapeProduct } = require("./scrapers/scraperFactory");
const { validateProductUrl, assertSafeNavigation } = require("./security/productUrl");

const MAX_RETRIES = Number(process.env.SCRAPER_MAX_RETRIES || 5);

function retryDelayMinutes(attempt) {
  return Math.min(30 * (2 ** Math.max(0, attempt - 1)), 24 * 60);
}

async function markFailure(product, reason, retryable = true) {
  const nextAttempt = product.retryCount + 1;
  const canRetry = retryable && nextAttempt < MAX_RETRIES;
  await prisma.product.update({
    where: { id: product.id },
    data: {
      status: "Failed",
      errorReason: String(reason).slice(0, 1000),
      lastChecked: new Date(),
      retryCount: canRetry ? nextAttempt : MAX_RETRIES,
      nextRetryAt: canRetry
        ? new Date(Date.now() + retryDelayMinutes(nextAttempt) * 60 * 1000)
        : null,
    },
  });
}

async function runScraper() {
  console.log("[scraper] Starting price checks");
  let browser;
  try {
    const now = new Date();
    const products = await prisma.product.findMany({
      where: {
        retryCount: { lt: MAX_RETRIES },
        OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
      },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { id: "asc" },
    });

    if (!products.length) {
      console.log("[scraper] No products due for checking.");
      return;
    }

    browser = await chromium.launch({ headless: true });
    for (const product of products) {
      let page;
      try {
        const safeUrl = await validateProductUrl(product.url);
        page = await browser.newPage();
        page.setDefaultTimeout(20000);
        page.setDefaultNavigationTimeout(30000);

        // Check each top-level redirect/navigation to reduce SSRF exposure.
        await page.route("**/*", async route => {
          const request = route.request();
          if (!request.isNavigationRequest()) return route.continue();
          try {
            await assertSafeNavigation(request.url());
            return route.continue();
          } catch (error) {
            console.warn("[scraper] Unsafe navigation blocked:", error.message);
            return route.abort("blockedbyclient");
          }
        });

        const result = await scrapeProduct(page, safeUrl);
        if (!result?.success) {
          await markFailure(product, result?.reason || "Scraping failed", result?.retryable !== false);
          continue;
        }

        const price = Number(result.price);
        if (!Number.isFinite(price) || price <= 0 || price > 100000000) {
          throw new Error("Scraper returned an invalid or implausible price.");
        }

        await prisma.$transaction(async tx => {
          await tx.product.update({
            where: { id: product.id },
            data: {
              currentPrice: price,
              platform: result.platform,
              image: result.image || undefined,
              currency: result.currency || "INR",
              availability: result.availability || "Unknown",
              lastChecked: result.scrapedAt || new Date(),
              status: "Success",
              errorReason: null,
              retryCount: 0,
              nextRetryAt: null,
            },
          });
          await tx.priceHistory.create({
            data: { price, productId: product.id },
          });

          if (price <= Number(product.targetPrice) && !product.alertSent) {
            await tx.notification.upsert({
              where: { idempotencyKey: `price-target:${product.id}:${Number(product.targetPrice).toFixed(2)}` },
              create: {
                idempotencyKey: `price-target:${product.id}:${Number(product.targetPrice).toFixed(2)}`,
                type: "PRICE_TARGET",
                status: "PENDING",
                userId: product.userId,
                productId: product.id,
                nextAttemptAt: new Date(),
              },
              update: {},
            });
          }
        });
        console.log(`[scraper] Updated product ${product.id}: ₹${price}`);
      } catch (error) {
        console.error(`[scraper] Product ${product.id} failed:`, error.message);
        const permanentInputError =
          error.message?.includes("Only HTTPS") ||
          error.message?.includes("Only Amazon.in") ||
          error.message?.includes("credentials are not allowed") ||
          error.message?.includes("Non-standard URL ports");
        try { await markFailure(product, error.message, !permanentInputError); }
        catch (dbError) { console.error("[scraper] Could not persist failure:", dbError.message); }
      } finally {
        if (page) await page.close().catch(() => {});
      }
    }
  } catch (error) {
    console.error("[scraper] Job failed:", error);
    throw error;
  } finally {
    if (browser) await browser.close().catch(error => console.error("[scraper] Browser close:", error.message));
    console.log("[scraper] Finished price checks");
  }
}
module.exports = runScraper;
