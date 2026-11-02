const express = require("express");
const cors = require("cors");
const prisma = require("./prismaClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("PricePilot Server Running");
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
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
    });

    res.json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
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
      "mysecretkey",
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
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();

  res.json(users);
});

app.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected Route Accessed",
    user: req.user,
  });
});

app.post("/products", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      url,
      targetPrice,
      currentPrice,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        url,
        targetPrice,
        currentPrice,
        userId: req.user.userId,
      },
    });

    await prisma.priceHistory.create({
    data: {
    price: currentPrice,
    productId: product.id,
   },
  });

    res.json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.get("/products", authMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        userId: req.user.userId,
      },
    });

    res.json(products);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.put("/products/:id/price", authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { price } = req.body;

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        currentPrice: price,
      },
    });

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
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.get("/products/:id/history", authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.id);

    const history = await prisma.priceHistory.findMany({
      where: {
        productId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(history);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.delete("/products/:id", authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.id);

 await prisma.priceHistory.deleteMany({
  where: {
    productId,
  },
});

await prisma.product.delete({
  where: {
    id: productId,
  },
});

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});