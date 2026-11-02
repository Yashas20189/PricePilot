const cron = require("node-cron");
const scrapeProducts = require("./scraper");

console.log("Cron Job Started");

cron.schedule("* * * * *", async () => {
  console.log("Running scraper...");

  try {
    await scrapeProducts();

    console.log("Scraping completed");
  } catch (error) {
    console.log(error);
  }
});