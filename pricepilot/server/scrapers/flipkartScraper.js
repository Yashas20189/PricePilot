const { validateProductUrl } = require("../security/productUrl");
const { parseJsonLd } = require("./jsonLdParser");

async function scrapeFlipkart(page, url) {
  url = await validateProductUrl(url);
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await page.waitForTimeout(1200);

  // ============================
  // JSON-LD First
  // ============================

  const product = await parseJsonLd(page);

  if (product && product.price) {
    console.log("✅ Flipkart: JSON-LD Success");

    return {
      success: true,

      platform: "flipkart",

      ...product,

      method: "jsonld",

      scrapedAt: new Date(),
    };
  }

  console.log("⚠️ Flipkart: Falling back to CSS");

  // ============================
  // Title
  // ============================

  const titleSelectors = [
    "span.VU-ZEz",
    "span.B_NuCI",
    "h1",
  ];

  let title = "";

  for (const selector of titleSelectors) {
    try {
      title = await page
        .locator(selector)
        .first()
        .textContent({ timeout: 2000 });

      if (title) break;
    } catch {}
  }

  // ============================
  // Price
  // ============================

  const priceSelectors = [
    "div.Nx9bqj",
    "div.Nx9bqj.CxhGGd",
    "div._30jeq3",
    "div._30jeq3._16Jk6d",
  ];

  let priceText = "";

  for (const selector of priceSelectors) {
    try {
      priceText = await page
        .locator(selector)
        .first()
        .textContent({ timeout: 2000 });

      if (priceText) break;
    } catch {}
  }

  // Last fallback

  if (!priceText) {
    const prices = await page
      .locator("text=/₹\\s*[0-9,]+/")
      .allTextContents();

    const numbers = prices
      .map(p => Number(p.replace(/[^0-9]/g, "")))
      .filter(p => p > 50);

    if (numbers.length) {
      priceText = numbers[0].toString();
    }
  }

  // ============================
  // Image
  // ============================

  let image = null;

  const imageSelectors = [
    "img._396cs4",
    "img.DByuf4",
    "img._53J4C-",
  ];

  for (const selector of imageSelectors) {
    try {
      image = await page
        .locator(selector)
        .first()
        .getAttribute("src");

      if (image) break;
    } catch {}
  }

  // ============================
  // Availability
  // ============================

  let availability = "In Stock";

  try {
    const body = await page.textContent("body");

    if (
      body.includes("Currently out of stock") ||
      body.includes("Sold Out")
    ) {
      availability = "Out of Stock";
    }
  } catch {}

  if (!title)
    throw new Error("Flipkart title not found.");

  if (!priceText)
    throw new Error("Flipkart price not found.");

  const price = Number(
    priceText.replace(/[^0-9.]/g, "")
  );

  return {
    success: true,

    platform: "flipkart",

    title: title.trim(),

    price,

    image,

    currency: "INR",

    availability,

    method: "css",

    scrapedAt: new Date(),
  };
}

module.exports = {
  scrapeFlipkart,
};