function typeIncludes(type, expected) {
  return Array.isArray(type) ? type.includes(expected) : type === expected;
}

function firstOffer(offers) {
  if (Array.isArray(offers)) return offers.find(Boolean) || null;
  return offers || null;
}

function extractProduct(data) {
  if (!data || typeof data !== "object") return null;

  if (typeIncludes(data["@type"], "ProductGroup") && Array.isArray(data.hasVariant)) {
    for (const variant of data.hasVariant) {
      const found = extractProduct(variant);
      if (found?.price) return found;
    }
  }

  if (!typeIncludes(data["@type"], "Product")) return null;

  const offer = firstOffer(data.offers);
  const priceSpecification = firstOffer(offer?.priceSpecification);
  const rawPrice = offer?.price ?? offer?.lowPrice ?? offer?.highPrice ??
    priceSpecification?.price ?? null;
  const price = rawPrice == null ? null : Number(String(rawPrice).replace(/,/g, ""));
  const currency = offer?.priceCurrency ?? priceSpecification?.priceCurrency ?? null;
  const availabilityRaw = offer?.availability ?? null;
  const availability = availabilityRaw ? String(availabilityRaw).split("/").pop() : null;

  const imageValue = Array.isArray(data.image) ? data.image[0] : data.image;
  const image = typeof imageValue === "string" ? imageValue : imageValue?.url || null;
  const brand = typeof data.brand === "string" ? data.brand : data.brand?.name || null;

  return {
    title: data.name || null,
    price: Number.isFinite(price) && price > 0 ? price : null,
    image,
    currency,
    availability,
    brand,
    rating: data.aggregateRating?.ratingValue ? Number(data.aggregateRating.ratingValue) : null,
    reviews: data.aggregateRating?.reviewCount ? Number(data.aggregateRating.reviewCount) : null,
  };
}

async function parseJsonLd(page) {
  try {
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    for (const script of scripts) {
      try {
        const root = JSON.parse(script);
        const candidates = [];
        const visit = value => {
          if (!value) return;
          if (Array.isArray(value)) return value.forEach(visit);
          if (typeof value !== "object") return;
          candidates.push(value);
          if (value["@graph"]) visit(value["@graph"]);
          if (value.mainEntity) visit(value.mainEntity);
        };
        visit(root);
        for (const candidate of candidates) {
          const product = extractProduct(candidate);
          if (product?.title && product.price) return product;
        }
      } catch {
        // Some product pages include malformed or unrelated JSON-LD blocks.
      }
    }
    return null;
  } catch (error) {
    console.warn("[scraper] JSON-LD extraction failed:", error.message);
    return null;
  }
}

module.exports = { parseJsonLd, extractProduct };
