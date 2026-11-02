const { scrapeAmazon } = require("./scrapers/amazonScraper");
const { scrapeFlipkart } = require("./scrapers/flipkartScraper");
const { validateProductUrl } = require("./security/productUrl");

function detectPlatform(url) {
  let host;
  try { host = new URL(url).hostname.toLowerCase(); } catch { return null; }
  if (host === "amazon.in" || host.endsWith(".amazon.in") || host === "amazon.com" || host.endsWith(".amazon.com")) return "amazon";
  if (host === "flipkart.com" || host.endsWith(".flipkart.com")) return "flipkart";
  return null;
}

async function scrapeProduct(page, url) {
  try {
    const safeUrl = await validateProductUrl(url);
    const platform = detectPlatform(safeUrl);
    if (!platform) return { success:false, platform:"unknown", reason:"Unsupported website", retryable:false };
    const result = platform === "amazon"
      ? await scrapeAmazon(page, safeUrl)
      : await scrapeFlipkart(page, safeUrl);
    return result;
  } catch (error) {
    return { success:false, reason:error.message, retryable:!error.message.includes("Only HTTPS") && !error.message.includes("Only Amazon") };
  }
}
module.exports = { scrapeProduct, detectPlatform };
