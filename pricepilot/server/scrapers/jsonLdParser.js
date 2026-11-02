function extractProduct(data) {
  if (!data) return null;

  // -----------------------------------
  // Handle ProductGroup
  // -----------------------------------

  if (
    data["@type"] === "ProductGroup" &&
    Array.isArray(data.hasVariant)
  ) {
    data = data.hasVariant[0];
  }

  if (data["@type"] !== "Product") {
    return null;
  }

  // -----------------------------------
  // Offers
  // -----------------------------------

  let offers = data.offers;

  if (Array.isArray(offers)) {
    offers = offers[0];
  }

  const price =
    offers?.price ??
    offers?.lowPrice ??
    offers?.highPrice ??
    null;

  const currency =
    offers?.priceCurrency ??
    null;

  const availability =
    offers?.availability
      ? offers.availability.split("/").pop()
      : null;

  // -----------------------------------
  // Image
  // -----------------------------------

  let image = null;

  if (Array.isArray(data.image)) {
    image = data.image[0];
  } else {
    image = data.image || null;
  }

  // -----------------------------------
  // Brand
  // -----------------------------------

  let brand = null;

  if (typeof data.brand === "string") {
    brand = data.brand;
  } else {
    brand = data.brand?.name || null;
  }

  // -----------------------------------
  // Return standardized object
  // -----------------------------------

  return {
    title: data.name || null,

    price:
      price !== null
        ? Number(price)
        : null,

    image,

    currency,

    availability,

    brand,

    rating:
      data.aggregateRating?.ratingValue
        ? Number(data.aggregateRating.ratingValue)
        : null,

    reviews:
      data.aggregateRating?.reviewCount
        ? Number(data.aggregateRating.reviewCount)
        : null,
  };
}

async function parseJsonLd(page) {
  try {
    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();

    for (const script of scripts) {
      try {
        let json = JSON.parse(script);

        // -----------------------------
        // Case 1: Array
        // -----------------------------

        if (Array.isArray(json)) {
          for (const item of json) {
            const product = extractProduct(item);

            if (product) {
              return product;
            }
          }
        }

        // -----------------------------
        // Case 2: @graph
        // -----------------------------

        else if (json["@graph"]) {
          for (const item of json["@graph"]) {
            const product = extractProduct(item);

            if (product) {
              return product;
            }
          }
        }

        // -----------------------------
        // Case 3: Single Product
        // -----------------------------

        else {
          const product = extractProduct(json);

          if (product) {
            return product;
          }
        }
      } catch {
        // Ignore invalid JSON-LD
      }
    }

    return null;
  } catch (error) {
    console.log("JSON-LD Error:", error.message);
    return null;
  }
}

module.exports = {
  parseJsonLd,
};