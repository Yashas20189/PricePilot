
const { chromium } = require("playwright");
const { randomUUID } = require("node:crypto");
const prisma = require("./prismaClient");
const { scrapeProduct } = require("./scrapers/scraperFactory");
const {
  validateProductUrl,
  assertSafeNavigation,
} = require("./security/productUrl");

const MAX_RETRIES = Number(process.env.SCRAPER_MAX_RETRIES || 5);

// Retry failed products after this cooldown once normal retries are exhausted.
const COOLDOWN_MINUTES = Number(
  process.env.SCRAPER_COOLDOWN_MINUTES || 360
);

function retryDelayMinutes(attempt) {
  return Math.min(
    30 * (2 ** Math.max(0, attempt - 1)),
    24 * 60
  );
}

async function markFailure(product, reason, retryable = true) {
  const nextAttempt = Math.min(product.retryCount + 1, MAX_RETRIES);

  const canRetrySoon =
    retryable && nextAttempt < MAX_RETRIES;

  const delayMinutes = canRetrySoon
    ? retryDelayMinutes(nextAttempt)
    : COOLDOWN_MINUTES;

  await prisma.product.update({
    where: { id: product.id },
    data: {
      status: "Failed",
      errorReason: String(reason).slice(0, 1000),
      lastChecked: new Date(),
      retryCount: canRetrySoon ? nextAttempt : MAX_RETRIES,
      nextRetryAt: new Date(
        Date.now() + delayMinutes * 60 * 1000
      ),
    },
  });

  console.log(
    `[scraper] Product ${product.id} failed. Next retry in ${delayMinutes} minutes.`
  );
}

async function runScraper() {
  console.log("[scraper] Starting price checks");

  let browser;

  try {
    const now = new Date();

    // Normal retries and products whose exhausted-retry cooldown has expired.
    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            AND: [
              { retryCount: { lt: MAX_RETRIES } },
              {
                OR: [
                  { nextRetryAt: null },
                  { nextRetryAt: { lte: now } },
                ],
              },
            ],
          },
          {
            AND: [
              { retryCount: { gte: MAX_RETRIES } },
              { nextRetryAt: { lte: now } },
            ],
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    if (!products.length) {
      console.log("[scraper] No products due for checking.");
      return;
    }

    console.log(
      `[scraper] Found ${products.length} products to check.`
    );

    browser = await chromium.launch({ headless: true });

    for (const product of products) {
      let page;

      try {
        const safeUrl = await validateProductUrl(product.url);

        page = await browser.newPage();

        page.setDefaultTimeout(20000);
        page.setDefaultNavigationTimeout(30000);

        // Validate every top-level navigation and redirect.
        await page.route("**/*", async (route) => {
          const request = route.request();

          if (!request.isNavigationRequest()) {
            return route.continue();
          }

          try {
            await assertSafeNavigation(request.url());
            return route.continue();
          } catch (error) {
            console.warn(
              "[scraper] Unsafe navigation blocked:",
              error.message
            );

            return route.abort("blockedbyclient");
          }
        });

        const result = await scrapeProduct(page, safeUrl);

        if (!result?.success) {
          const permanentInputError =
            result?.reason?.includes("Only HTTPS") ||
            result?.reason?.includes("Only Amazon") ||
            result?.reason?.includes("credentials are not allowed") ||
            result?.reason?.includes("Non-standard URL ports") ||
            result?.reason?.includes("restricted network");

          await markFailure(
            product,
            result?.reason || "Scraping failed",
            result?.retryable !== false && !permanentInputError
          );

          continue;
        }

        const price = Number(result.price);

        if (
          !Number.isFinite(price) ||
          price <= 0 ||
          price > 100000000
        ) {
          throw new Error(
            "Scraper returned an invalid or implausible price."
          );
        }

        await prisma.$transaction(async (tx) => {
          // Always compare against the latest saved price.
          const latestProduct = await tx.product.findUnique({
            where: { id: product.id },
            select: {
              currentPrice: true,
              targetPrice: true,
            },
          });

          if (!latestProduct) return;

          const targetPrice = Number(latestProduct.targetPrice);

          const previousPrice =
            latestProduct.currentPrice == null
              ? null
              : Number(latestProduct.currentPrice);

          // Alert on first successful observation below target,
          // or when price crosses from above to at/below target.
          const crossedBelowTarget =
            price <= targetPrice &&
            (
              previousPrice === null ||
              previousPrice > targetPrice
            );

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

              // Successful scraping resets the retry system.
              retryCount: 0,
              nextRetryAt: null,
            },
          });

          await tx.priceHistory.create({
            data: {
              price,
              productId: product.id,
            },
          });

          if (crossedBelowTarget) {
            const eventId = randomUUID();

            await tx.notification.create({
              data: {
                idempotencyKey:
                  `price-crossing:${product.id}:${eventId}`,
                type: "PRICE_TARGET",
                status: "PENDING",
                userId: product.userId,
                productId: product.id,
                priceAtTrigger: price,
                targetPriceAtTrigger: targetPrice,
                nextAttemptAt: new Date(),
              },
            });

            console.log(
              `[scraper] Price target crossed for product ${product.id}: ₹${price} (target ₹${targetPrice})`
            );
          }
        });

        console.log(
          `[scraper] Updated product ${product.id}: ₹${price}`
        );

      } catch (error) {
        console.error(
          `[scraper] Product ${product.id} failed:`,
          error.message
        );

        const permanentInputError =
          error.message?.includes("Only HTTPS") ||
          error.message?.includes("Only Amazon") ||
          error.message?.includes("credentials are not allowed") ||
          error.message?.includes("Non-standard URL ports") ||
          error.message?.includes("restricted network");

        try {
          await markFailure(
            product,
            error.message,
            !permanentInputError
          );
        } catch (dbError) {
          console.error(
            "[scraper] Could not persist failure:",
            dbError.message
          );
        }

      } finally {
        if (page) {
          await page.close().catch(() => {});
        }
      }
    }

  } catch (error) {
    console.error("[scraper] Job failed:", error);
    throw error;

  } finally {
    if (browser) {
      await browser.close().catch((error) =>
        console.error(
          "[scraper] Browser close:",
          error.message
        )
      );
    }

    console.log("[scraper] Finished price checks");
  }
}

module.exports = runScraper;
