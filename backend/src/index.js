require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { PrismaClient } = require("@prisma/client");
const prisma = require("./utils/prisma");
const { errorHandler, notFound } = require("./middleware/error");

const app = express();

// CORS
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());
app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, true); // allow all in demo; tighten for production
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  message: { success: false, error: "Too many requests, please try again later." },
});
app.use("/api/auth", authLimiter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "nirovveda-api", time: new Date().toISOString() });
});

// Routes
const routes = require("./routes");
app.use("/api", routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Nirovveda API running on port ${PORT}`);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});