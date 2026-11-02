require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const prisma = require("./prismaClient");
const authMiddleware = require("./middleware/authMiddleware");
const { validateProductUrl } = require("./security/productUrl");
const { getTelegramConnectUrl, sendTelegramWelcome } = require("./services/telegramService");

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be configured with at least 32 characters.");
}

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",").map(value => value.trim()).filter(Boolean);

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "20kb" }));

function validId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
function validPrice(value, { allowZero = false } = {}) {
  if (value === null || value === undefined || value === "") return null;
  const price = Number(value);
  if (!Number.isFinite(price) || price > 100000000 || (allowZero ? price < 0 : price <= 0)) return null;
  return price;
}
function platformFromUrl(value) {
  const host = new URL(value).hostname.toLowerCase();
  return host.includes("flipkart") ? "flipkart" : "amazon";
}

app.get("/", (req, res) => res.json({ service: "PricePilot API", status: "ok" }));

// Create a short-lived, single-use Telegram linking token for the authenticated user.
app.post("/telegram/connect", authMiddleware, async (req, res) => {
  try {
    if (!process.env.BOT_TOKEN || !process.env.TELEGRAM_BOT_USERNAME) {
      return res.status(503).json({ message: "Telegram connection is not configured." });
    }
    const linkToken = crypto.randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { telegramLinkToken: linkToken, telegramLinkExpiresAt: expiresAt },
    });
    const connectUrl = await getTelegramConnectUrl(linkToken);
    return res.json({ connectUrl, expiresAt });
  } catch (error) {
    console.error("[telegram] Could not create link:", error);
    return res.status(500).json({ message: "Unable to create Telegram connection." });
  }
});

app.delete("/telegram/connect", authMiddleware, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { telegramChatId: null, telegramLinkToken: null, telegramLinkExpiresAt: null },
    });
    return res.json({ message: "Telegram account disconnected." });
  } catch (error) {
    console.error("[telegram] Disconnect failed:", error);
    return res.status(500).json({ message: "Unable to disconnect Telegram." });
  }
});

// Telegram calls this endpoint after a user presses Start on the bot deep link.
// Configure the webhook with TELEGRAM_WEBHOOK_SECRET as Telegram's secret_token.
app.post("/telegram/webhook", async (req, res) => {
  try {
    const expected = process.env.TELEGRAM_WEBHOOK_SECRET || "";
    const supplied = req.get("x-telegram-bot-api-secret-token") || "";
    if (!expected || !supplied ||
        Buffer.byteLength(expected) !== Buffer.byteLength(supplied) ||
        !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) {
      return res.sendStatus(401);
    }

    const message = req.body?.message;
    const chatId = message?.chat?.id;
    const text = typeof message?.text === "string" ? message.text.trim() : "";
    const match = text.match(/^\/start\s+([A-Za-z0-9_-]{20,100})$/);
    if (!chatId || !match) return res.sendStatus(200);

    const linkToken = match[1];
    const user = await prisma.user.findFirst({
      where: { telegramLinkToken: linkToken, telegramLinkExpiresAt: { gt: new Date() } },
      select: { id: true },
    });
    if (!user) return res.sendStatus(200);

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { telegramChatId: String(chatId), telegramLinkToken: null, telegramLinkExpiresAt: null },
      });
      await sendTelegramWelcome(String(chatId));
    } catch (error) {
      if (error.code === "P2002") {
        console.warn("[telegram] Chat is already linked to another account.");
        return res.sendStatus(200);
      }
      throw error;
    }
    return res.sendStatus(200);
  } catch (error) {
    console.error("[telegram] Webhook error:", error);
    return res.sendStatus(500);
  }
});


app.post("/register", async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = req.body.password;
    if (!name || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof password !== "string" || password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: "Enter a valid name, email and password (8–128 characters)." });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true },
    });
    return res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ message: "Email already registered." });
    console.error("[auth] Registration error:", error);
    return res.status(500).json({ message: "Unable to create account." });
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = req.body.password;
    if (!email || typeof password !== "string") return res.status(400).json({ message: "Email and password are required." });
    const user = await prisma.user.findUnique({ where: { email } });
    const valid = user ? await bcrypt.compare(password, user.password) : false;
    if (!valid) return res.status(401).json({ message: "Invalid email or password." });
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("[auth] Login error:", error);
    return res.status(500).json({ message: "Unable to sign in." });
  }
});

app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, telegramChatId: true },
    });
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ user: { id: user.id, name: user.name, email: user.email, telegramConnected: Boolean(user.telegramChatId) } });
  } catch (error) {
    console.error("[profile] Error:", error);
    return res.status(500).json({ message: "Unable to load profile." });
  }
});

app.post("/products", authMiddleware, async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const targetPrice = validPrice(req.body.targetPrice);
    const currentPrice = validPrice(req.body.currentPrice);
    if (!name || name.length > 250 || targetPrice === null || (req.body.currentPrice != null && currentPrice === null)) {
      return res.status(400).json({ message: "Provide a product name, positive target price and a valid optional current price." });
    }
    let url;
    try {
      url = await validateProductUrl(req.body.url);
    } catch (urlError) {
      return res.status(400).json({ message: urlError.message || "Invalid product URL." });
    }
    const duplicate = await prisma.product.findFirst({
      where: { userId: req.user.userId, url },
      select: { id: true },
    });
    if (duplicate) return res.status(409).json({ message: "This product is already in your watchlist." });

    const product = await prisma.product.create({
      data: {
        name, url, targetPrice, currentPrice,
        platform: platformFromUrl(url),
        userId: req.user.userId,
        ...(currentPrice !== null ? { priceHistory: { create: { price: currentPrice } } } : {}),
      },
    });
    return res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    if (error.message?.includes("URL") || error.message?.includes("HTTPS") || error.message?.includes("Amazon.in")) {
      return res.status(400).json({ message: error.message });
    }
    console.error("[products] Create error:", error);
    return res.status(500).json({ message: "Unable to add product." });
  }
});

app.get("/products", authMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { userId: req.user.userId },
      orderBy: { id: "desc" },
    });
    return res.json(products);
  } catch (error) {
    console.error("[products] List error:", error);
    return res.status(500).json({ message: "Unable to load products." });
  }
});

app.put("/products/:id/price", authMiddleware, async (req, res) => {
  const productId = validId(req.params.id);
  const price = validPrice(req.body.price);
  if (!productId || price === null) return res.status(400).json({ message: "Invalid product ID or price." });
  try {
    const updated = await prisma.$transaction(async tx => {
      const result = await tx.product.updateMany({
        where: { id: productId, userId: req.user.userId },
        data: { currentPrice: price, lastChecked: new Date(), status: "Success", errorReason: null },
      });
      if (!result.count) return false;
      await tx.priceHistory.create({ data: { price, productId } });
      return true;
    });
    if (!updated) return res.status(404).json({ message: "Product not found." });
    return res.json({ message: "Price and history updated successfully." });
  } catch (error) {
    console.error("[products] Price update error:", error);
    return res.status(500).json({ message: "Unable to update product price." });
  }
});

app.get("/products/:id/history", authMiddleware, async (req, res) => {
  const productId = validId(req.params.id);
  if (!productId) return res.status(400).json({ message: "Invalid product ID." });
  try {
    const history = await prisma.priceHistory.findMany({
      where: { productId, product: { userId: req.user.userId } },
      orderBy: { createdAt: "asc" },
    });
    return res.json(history);
  } catch (error) {
    console.error("[history] Error:", error);
    return res.status(500).json({ message: "Unable to load price history." });
  }
});

app.delete("/products/:id", authMiddleware, async (req, res) => {
  const productId = validId(req.params.id);
  if (!productId) return res.status(400).json({ message: "Invalid product ID." });
  try {
    const result = await prisma.product.deleteMany({ where: { id: productId, userId: req.user.userId } });
    if (!result.count) return res.status(404).json({ message: "Product not found." });
    return res.json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("[products] Delete error:", error);
    return res.status(500).json({ message: "Unable to delete product." });
  }
});

app.use((error, req, res, next) => {
  if (error.message === "Origin is not allowed by CORS.") return res.status(403).json({ message: error.message });
  console.error("[server] Unhandled error:", error);
  return res.status(500).json({ message: "Internal server error." });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`PricePilot API listening on port ${PORT}`));
}
module.exports = app;
