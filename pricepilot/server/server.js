
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const prisma = require("./prismaClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");

// Start scheduled scraping
require("./cron");

const app = express();

app.use(cors());
app.use(express.json());

// Check required environment variables
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from environment variables");
}

app.get("/", (req, res) => {
  res.send("PricePilot Server Running");
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// USERS (Protected; returns no password hashes)
app.get("/users", authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Users error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// PROFILE
app.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected Route Accessed",
    user: req.user,
  });
});

// ADD PRODUCT
app.post("/products", authMiddleware, async (req, res) => {
  try {
    const { name, url, targetPrice, currentPrice } = req.body;

    const target = Number(targetPrice);
    const current = Number(currentPrice);

    if (
      !name ||
      !url ||
      !Number.isFinite(target) ||
      !Number.isFinite(current) ||
      target < 0 ||
      current < 0
    ) {
      return res.status(400).json({
        message: "Please provide valid product details",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        url,
        targetPrice: target,
        currentPrice: current,
        userId: req.user.userId,
        priceHistory: {
          create: {
            price: current,
          },
        },
      },
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("Add product error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// GET USER PRODUCTS
app.get("/products", authMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        userId: req.user.userId,
      },
    });

    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// UPDATE PRODUCT PRICE
app.put("/products/:id/price", authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const price = Number(req.body.price);

    if (
      !Number.isInteger(productId) ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return res.status(400).json({
        message: "Invalid product ID or price",
      });
    }

    const result = await prisma.product.updateMany({
      where: {
        id: productId,
        userId: req.user.userId,
      },
      data: {
        currentPrice: price,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await prisma.priceHistory.create({
      data: {
        price,
        productId,
      },
    });

    res.json({
      message: "Price updated successfully",
    });
  } catch (error) {
    console.error("Update price error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// GET PRODUCT PRICE HISTORY
app.get("/products/:id/history", authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const history = await prisma.priceHistory.findMany({
      where: {
        productId,
        product: {
          userId: req.user.userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(history);
  } catch (error) {
    console.error("Price history error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// DELETE PRODUCT
app.delete("/products/:id", authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const result = await prisma.product.deleteMany({
      where: {
        id: productId,
        userId: req.user.userId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
