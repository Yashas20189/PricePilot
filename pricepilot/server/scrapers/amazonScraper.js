const { parseJsonLd } = require("./jsonLdParser");

async function getFirstText(page, selectors) {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();

      if (await locator.count()) {
        const text = await locator.textContent({
          timeout: 2000,
        });

        if (text && text.trim()) {
          return text.trim();
        }
      }
    } catch {}
  }

  return null;
}

async function getFirstAttribute(page, selectors, attribute) {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();

      if (await locator.count()) {
        const value = await locator.getAttribute(attribute);

        if (value) {
          return value;
        }
      }
    } catch {}
  }

  return null;
}

async function scrapeAmazon(page, url) {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await page.waitForSelector("span#productTitle", {
    timeout: 15000
});

  console.log("Trying Amazon JSON-LD...");

  const product = await parseJsonLd(page);

  if (product && product.price) {
    console.log("✅ Amazon JSON-LD Success");

    return {
      success: true,

      platform: "amazon",

      ...product,

      method: "jsonld",

      scrapedAt: new Date(),
    };
  }

  console.log("⚠️ Falling back to Amazon CSS...");

  // -----------------------------
  // Title
  // -----------------------------

  const title = await getFirstText(page, [
    "span#productTitle",
    "h1 span.a-size-large",
    "h1.a-size-large",
    "#title span",
  ]);

  // -----------------------------
  // Price
  // -----------------------------

  const priceText = await getFirstText(page, [
    ".apexPriceToPay .a-offscreen",
    ".a-price .a-offscreen",
    ".a-price-whole",
    "#corePriceDisplay_desktop_feature_div .a-offscreen",
  ]);

  // -----------------------------
  // Image
  // -----------------------------

  const image = await getFirstAttribute(page, [
    "#landingImage",
    "#imgTagWrapperId img",
    "#main-image",
  ], "src");

  // -----------------------------
  // Availability
  // -----------------------------

  let availability = "Unknown";

  try {
    const text = await getFirstText(page, [
      "#availability span",
      "#availability",
    ]);

    if (text) {
      availability = text;
    }
  } catch {}

  if (!title) {
    throw new Error("Amazon title not found.");
  }

  if (!priceText) {
    throw new Error("Amazon price not found.");
  }

  const price = Number(
    priceText.replace(/[^0-9.]/g, "")
  );

  if (isNaN(price)) {
    throw new Error("Invalid Amazon price.");
  }

  return {
    success: true,

    platform: "amazon",

    title,

    price,

    image,

    currency: "INR",

    availability,

    method: "css",

    scrapedAt: new Date(),
  };
}

module.exports = {
  scrapeAmazon,
};