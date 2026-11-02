const cron = require("node-cron");
const scrapeProducts = require("./scraper");

let isScraping = false;

console.log("Cron Job Started");

cron.schedule("*/30 * * * *", async () => {
  if (isScraping) {
    console.log("Previous scraping job is still running. Skipping...");
    return;
  }

  isScraping = true;

  console.log("Running scraper...");

  try {
    await scrapeProducts();
    console.log("Scraping completed");
  } catch (error) {
    console.error("Scraping failed:", error.message);
  } finally {
    isScraping = false;
  }
});