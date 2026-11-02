const { validateProductUrl } = require("../security/productUrl");
const { parseJsonLd } = require("./jsonLdParser");

async function firstText(page, selectors) {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();
      if (await locator.count()) {
        const value = (await locator.textContent({ timeout: 2500 }))?.trim();
        if (value) return value;
      }
    } catch {}
  }
  return null;
}

async function firstAttribute(page, selectors, attribute) {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();
      if (await locator.count()) {
        const value = await locator.getAttribute(attribute, { timeout: 2500 });
        if (value) return value;
      }
    } catch {}
  }
  return null;
}

function parseRupeePrice(value) {
  if (!value) return null;
  const match = String(value).replace(/\u00a0/g, " ").match(/(?:₹|Rs\.?\s*)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i);
  if (!match) return null;
  const price = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(price) && price > 0 && price <= 100000000 ? price : null;
}

async function scrapeAmazon(page, url) {
  url = await validateProductUrl(url);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForLoadState("domcontentloaded").catch(() => {});

  // Do not make the title selector a hard prerequisite: Amazon sometimes changes
  // its markup or serves a consent/robot page before the product content.
  const product = await parseJsonLd(page);
  const title = product?.title || await firstText(page, [
    "#productTitle",
    "h1 span.a-size-large",
    "h1.a-size-large",
    "#title span",
  ]);

  let price = product?.price || null;
  if (!price) {
    const priceText = await firstText(page, [
      "#corePriceDisplay_desktop_feature_div .apexPriceToPay .a-offscreen",
      "#corePrice_feature_div .a-offscreen",
      ".apexPriceToPay .a-offscreen",
      "#priceblock_dealprice",
      "#priceblock_ourprice",
      "span.a-price:not(.a-text-price) span.a-offscreen",
    ]);
    price = parseRupeePrice(priceText);
  }

  const image = product?.image || await firstAttribute(page, [
    "#landingImage",
    "#imgTagWrapperId img",
    "#main-image",
  ], "src");

  let availability = product?.availability || "Unknown";
  const availabilityText = await firstText(page, ["#availability span", "#availability"]);
  if (availabilityText) availability = availabilityText;

  if (!title) {
    const body = (await page.locator("body").innerText().catch(() => "")).slice(0, 500);
    throw new Error(body.match(/captcha|robot check|automated access/i)
      ? "Amazon returned a CAPTCHA or robot-check page."
      : "Amazon product title not found; page markup may have changed.");
  }
  if (!price) {
    throw new Error("Amazon price not found or invalid; product may be unavailable or page markup may have changed.");
  }

  return {
    success: true,
    platform: "amazon",
    title: title.trim(),
    price,
    image,
    currency: product?.currency || "INR",
    availability,
    brand: product?.brand || null,
    method: product?.price ? "jsonld" : "css",
    scrapedAt: new Date(),
  };
}

module.exports = { scrapeAmazon, parseRupeePrice };
