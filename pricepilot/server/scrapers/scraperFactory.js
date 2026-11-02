const { scrapeAmazon } = require("./amazonScraper");
const { scrapeFlipkart } = require("./flipkartScraper");

// Future imports
// const { scrapeMyntra } = require("./myntraScraper");
// const { scrapeAjio } = require("./ajioScraper");

function detectPlatform(url) {
  url = url.toLowerCase();

  if (
    url.includes("amazon.in") ||
    url.includes("amazon.com") ||
    url.includes("amzn.in")
  ) {
    return "amazon";
  }

  if (url.includes("flipkart")) {
    return "flipkart";
  }

  // Future
  // if (url.includes("myntra")) return "myntra";
  // if (url.includes("ajio")) return "ajio";
  // if (url.includes("croma")) return "croma";

  return null;
}

async function scrapeProduct(page, url) {
  const platform = detectPlatform(url);

  if (!platform) {
    return {
      success: false,
      platform: "unknown",
      reason: "Unsupported website",
      retryable: false,
      scrapedAt: new Date(),
    };
  }

  try {
    switch (platform) {
      case "amazon":
        return await scrapeAmazon(page, url);

      case "flipkart":
        return await scrapeFlipkart(page, url);

      // Future
      // case "myntra":
      //   return await scrapeMyntra(page, url);

      // case "ajio":
      //   return await scrapeAjio(page, url);

      default:
        return {
          success: false,
          platform,
          reason: "Scraper not implemented",
          retryable: false,
          scrapedAt: new Date(),
        };
    }
  } catch (error) {
    console.error(`${platform} Scraper Error:`, error.message);

    return {
      success: false,
      platform,
      reason: error.message,
      retryable: true,
      scrapedAt: new Date(),
    };
  }
}

module.exports = {
  scrapeProduct,
  detectPlatform,
};