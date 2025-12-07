import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import barcodeRoutes from './routes/barcode.js';
import ocrRoutes from './routes/ocr.js';
import recipeRoutes from './routes/recipes.js';
import analyticsRoutes from './routes/analytics.js';
import achievementRoutes from './routes/achievements.js';
import notificationRoutes from './routes/notifications.js';
import leaderboardRoutes from './routes/leaderboard.js';
import challengeRoutes from './routes/challenges.js';
import mealPlanningRoutes from './routes/mealPlanning.js';
import cronRoutes from './routes/cron.js'; // Import the new cron routes
// We will no longer start the job directly, so the import below can be removed.

// Get the directory of the current file (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root directory
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✅ Loaded environment variables from .env file');
} else {
  console.log('ℹ️ No .env file found, relying on hosting provider environment variables.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // The cron job is now handled by Vercel, so we no longer start it here.
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Create a master router for all API endpoints
const apiRouter = express.Router();

// Mount all routes onto the master router
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

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Food Expiry Tracker API is running' });
});

// Mount the master router under the /api base path
app.use('/api', apiRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});