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
import { startReminderJob } from './jobs/reminderJob.js';

// Get the directory of the current file (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root directory
const envPath = path.resolve(__dirname, '../../.env');
console.log('Looking for .env at:', envPath);
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  dotenv.config({ path: envPath });
} else {
  console.warn('⚠️  .env file not found at', envPath);
}

// Debug: log if API key is loaded
console.log('ANTHROPIC_API_KEY value:', process.env.ANTHROPIC_API_KEY);
if (process.env.ANTHROPIC_API_KEY) {
  console.log('✅ Anthropic API key loaded successfully');
} else {
  console.warn('⚠️  ANTHROPIC_API_KEY not found in environment');
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
    // Start the reminder cron job
    startReminderJob();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
// Routes - Order matters! More specific routes first
app.use('/api/auth', authRoutes);

// Health check (before other routes)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Food Expiry Tracker API is running' });
});

// Other routes
app.use('/api/items', itemRoutes);
app.use('/api/barcode', barcodeRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/recipes', recipeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Food Expiry Tracker API is running' });
});

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