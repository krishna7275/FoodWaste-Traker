// backend/src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load .env (local dev)
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✅ Loaded .env from project root');
} else {
  dotenv.config();
  console.log('ℹ️ No ../../.env found; using environment variables');
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);

// health route (always available)
app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

// graceful error handlers so logs show stack
process.on('unhandledRejection', (reason, promise) => {
  console.error('✖ Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('✖ Uncaught Exception thrown:', err);
});

// Connect to MongoDB (safe: do not throw on failure — log and continue)
async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ MONGODB_URI not set. DB not connected.');
    return;
  }
  try {
    console.log('🔌 Attempting MongoDB connection...');
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DBNAME || undefined });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error (logged, not exiting):', err);
    // do not process.exit in serverless environment
  }
}

// Lazy import and mount routes AFTER DB attempt and basic logging
async function setupRoutes() {
  try {
    console.log('🔁 Importing routes...');
    const [
      { default: authRoutes },
      { default: itemRoutes },
      { default: barcodeRoutes },
      { default: ocrRoutes },
      { default: recipeRoutes },
      { default: analyticsRoutes },
      { default: achievementRoutes },
      { default: notificationRoutes },
      { default: leaderboardRoutes },
      { default: challengeRoutes },
      { default: mealPlanningRoutes },
      { default: cronRoutes }
    ] = await Promise.all([
      import('./routes/auth.js'),
      import('./routes/items.js'),
      import('./routes/barcode.js'),
      import('./routes/ocr.js'),
      import('./routes/recipes.js'),
      import('./routes/analytics.js'),
      import('./routes/achievements.js'),
      import('./routes/notifications.js'),
      import('./routes/leaderboard.js'),
      import('./routes/challenges.js'),
      import('./routes/mealPlanning.js'),
      import('./routes/cron.js')
    ]);

    const apiRouter = express.Router();
    apiRouter.use('/auth', authRoutes);
    apiRouter.use('/items', itemRoutes);
    apiRouter.use('/barcode', barcodeRoutes);
    apiRouter.use('/ocr', ocrRoutes);
    apiRouter.use('/recipes', recipeRoutes);
    apiRouter.use('/analytics', analyticsRoutes);
    apiRouter.use('/achievements', achievementRoutes);
    apiRouter.use('/notifications', notificationRoutes);
    apiRouter.use('/leaderboard', leaderboardRoutes);
    apiRouter.use('/challenges', challengeRoutes);
    apiRouter.use('/meal-planning', mealPlanningRoutes);
    apiRouter.use('/cron', cronRoutes);

    app.use('/api', apiRouter);

    console.log('✅ Routes mounted at /api/*');
  } catch (err) {
    console.error('❌ Error importing/mounting routes:', err);
    // keep app running so Vercel shows errors in function logs
  }
}

// call connectDb and setupRoutes immediately
await connectDb();
await setupRoutes();

// error and 404 handlers
app.use((err, req, res, next) => {
  console.error('❌ Express error handler:', err);
  res.status(500).json({ error: 'Something went wrong', message: String(err) });
});
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// export default for Vercel serverless
export default app;

// Only start local server when file is run directly
const executedFile = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (executedFile === fileURLToPath(import.meta.url)) {
  const port = PORT;
  app.listen(port, () => {
    console.log(`🚀 Local server running on http://localhost:${port}`);
  });
}
