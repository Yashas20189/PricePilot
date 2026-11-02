const { validateProductUrl } = require("../security/productUrl");
const { parseJsonLd } = require("./jsonLdParser");
const { parseRupeePrice } = require("./amazonScraper");

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

async function scrapeFlipkart(page, url) {
  url = await validateProductUrl(url);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForLoadState("domcontentloaded").catch(() => {});

  const product = await parseJsonLd(page);
  const title = product?.title || await firstText(page, [
    "span.VU-ZEz",
    "span.B_NuCI",
    "h1 span",
    "h1",
  ]);

  let price = product?.price || null;
  if (!price) {
    const priceText = await firstText(page, [
      "[data-testid='price']",
      "div.Nx9bqj.CxhGGd",
      "div.Nx9bqj",
      "div._30jeq3._16Jk6d",
      "div._30jeq3",
      "meta[property='product:price:amount']",
    ]);
    price = parseRupeePrice(priceText);
    if (!price && priceText && /^[0-9][0-9,]*(?:\.\d{1,2})?$/.test(priceText)) {
      const numeric = Number(priceText.replace(/,/g, ""));
      if (Number.isFinite(numeric) && numeric > 0) price = numeric;
    }
  }

  const image = product?.image || await firstAttribute(page, [
    "img._396cs4",
    "img.DByuf4",
    "img._53J4C-",
    "img[fetchpriority='high']",
  ], "src");

  const body = await page.locator("body").innerText().catch(() => "");
  let availability = product?.availability || "Unknown";
  if (/currently out of stock|sold out|out of stock/i.test(body)) {
    availability = "Out of Stock";
  } else if (/add to cart|buy now/i.test(body)) {
    availability = "In Stock";
  }

  if (!title) {
    throw new Error(/captcha|robot|temporarily unavailable/i.test(body)
      ? "Flipkart returned a CAPTCHA or blocked page."
      : "Flipkart product title not found; page markup may have changed.");
  }
  if (!price) {
    throw new Error("Flipkart price not found or invalid; product may be unavailable or page markup may have changed.");
  }

  return {
    success: true,
    platform: "flipkart",
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

module.exports = { scrapeFlipkart };
