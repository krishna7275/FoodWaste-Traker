import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register - Create a new user and return token
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = new User({ name, email: email.toLowerCase().trim(), password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: user.toJSON() });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// POST /api/auth/login - Authenticate user and return token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: user.toJSON() });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// GET /api/auth/me - Return current authenticated user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

export default router;