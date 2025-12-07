// backend/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Route imports
import authRoutes from "./routes/auth.js";
import itemRoutes from "./routes/items.js";
import barcodeRoutes from "./routes/barcode.js";
import ocrRoutes from "./routes/ocr.js";
import recipeRoutes from "./routes/recipes.js";
import analyticsRoutes from "./routes/analytics.js";
import achievementRoutes from "./routes/achievements.js";
import notificationRoutes from "./routes/notifications.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import challengeRoutes from "./routes/challenges.js";
import mealPlanningRoutes from "./routes/mealPlanning.js";
import cronRoutes from "./routes/cron.js";

// Helper for dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env (works locally)
const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✅ Loaded .env file");
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// MongoDB Connection
async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn("⚠ MONGODB_URI is missing");
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
  }
}
await connectDB();

// API Routes
const apiRouter = express.Router();
apiRouter.use("/auth", authRoutes);
apiRouter.use("/items", itemRoutes);
apiRouter.use("/barcode", barcodeRoutes);
apiRouter.use("/ocr", ocrRoutes);
apiRouter.use("/recipes", recipeRoutes);
apiRouter.use("/analytics", analyticsRoutes);
apiRouter.use("/achievements", achievementRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/leaderboard", leaderboardRoutes);
apiRouter.use("/challenges", challengeRoutes);
apiRouter.use("/meal-planning", mealPlanningRoutes);
apiRouter.use("/cron", cronRoutes);

// Health check
apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend running" });
});

app.use("/api", apiRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: err.message || "Server Error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// EXPORT APP for Vercel Serverless
export default app;

// LOCAL DEV ONLY → Start Express server
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => console.log(`🚀 Local server running on port ${PORT}`));
}
