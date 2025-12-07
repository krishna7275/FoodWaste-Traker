import express from 'express';
import User from '../models/User.js';
import Item from '../models/Item.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Challenge definitions
const CHALLENGES = {
  zero_waste_week: {
    name: 'Zero Waste Week',
    description: 'No items wasted for 7 consecutive days',
    duration: 7,
    reward: 500,
    icon: '♻️'
  },
  streak_master: {
    name: 'Streak Master',
    description: 'Maintain a 30-day tracking streak',
    duration: 30,
    reward: 1000,
    icon: '🔥'
  },
  eco_champion: {
    name: 'Eco Champion',
    description: 'Save 100 items from waste',
    target: 100,
    reward: 2000,
    icon: '🌍'
  },
  money_saver: {
    name: 'Money Saver',
    description: 'Save ₹500 in food waste',
    target: 500,
    reward: 1500,
    icon: '💰'
  },
  recipe_explorer: {
    name: 'Recipe Explorer',
    description: 'Use 20 AI-generated recipes',
    target: 20,
    reward: 800,
    icon: '👨‍🍳'
  }
};

// GET /api/challenges - Get all challenges
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const challenges = Object.entries(CHALLENGES).map(([id, challenge]) => {
      let progress = 0;
      let completed = false;

      switch (id) {
        case 'zero_waste_week':
          // Check last 7 days for zero waste
          progress = user.stats.currentStreak >= 7 ? 100 : (user.stats.currentStreak / 7) * 100;
          completed = user.stats.currentStreak >= 7;
          break;
        case 'streak_master':
          progress = user.stats.currentStreak >= 30 ? 100 : (user.stats.currentStreak / 30) * 100;
          completed = user.stats.currentStreak >= 30;
          break;
        case 'eco_champion':
          progress = (user.stats.itemsSaved || 0) >= challenge.target
            ? 100
            : ((user.stats.itemsSaved || 0) / challenge.target) * 100;
          completed = (user.stats.itemsSaved || 0) >= challenge.target;
          break;
        case 'money_saver':
          progress = (user.stats.moneySaved || 0) >= challenge.target
            ? 100
            : ((user.stats.moneySaved || 0) / challenge.target) * 100;
          completed = (user.stats.moneySaved || 0) >= challenge.target;
          break;
        case 'recipe_explorer':
          // This would need to be tracked separately
          progress = 0;
          completed = false;
          break;
      }

      return {
        id,
        ...challenge,
        progress: Math.min(100, Math.max(0, progress)),
        completed,
        currentValue: id === 'zero_waste_week' || id === 'streak_master'
          ? user.stats.currentStreak
          : id === 'eco_champion'
          ? user.stats.itemsSaved || 0
          : id === 'money_saver'
          ? user.stats.moneySaved || 0
          : 0
      };
    });

    res.json({ challenges });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ error: 'Error fetching challenges' });
  }
});

// GET /api/challenges/active - Get active challenges
router.get('/active', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const challenges = Object.entries(CHALLENGES).map(([id, challenge]) => {
      let progress = 0;
      let completed = false;

      switch (id) {
        case 'zero_waste_week':
          progress = user.stats.currentStreak >= 7 ? 100 : (user.stats.currentStreak / 7) * 100;
          completed = user.stats.currentStreak >= 7;
          break;
        case 'streak_master':
          progress = user.stats.currentStreak >= 30 ? 100 : (user.stats.currentStreak / 30) * 100;
          completed = user.stats.currentStreak >= 30;
          break;
        case 'eco_champion':
          progress = (user.stats.itemsSaved || 0) >= challenge.target
            ? 100
            : ((user.stats.itemsSaved || 0) / challenge.target) * 100;
          completed = (user.stats.itemsSaved || 0) >= challenge.target;
          break;
        case 'money_saver':
          progress = (user.stats.moneySaved || 0) >= challenge.target
            ? 100
            : ((user.stats.moneySaved || 0) / challenge.target) * 100;
          completed = (user.stats.moneySaved || 0) >= challenge.target;
          break;
      }

      return {
        id,
        ...challenge,
        progress: Math.min(100, Math.max(0, progress)),
        completed,
        currentValue: id === 'zero_waste_week' || id === 'streak_master'
          ? user.stats.currentStreak
          : id === 'eco_champion'
          ? user.stats.itemsSaved || 0
          : id === 'money_saver'
          ? user.stats.moneySaved || 0
          : 0
      };
    }).filter(c => !c.completed && c.progress > 0);

    res.json({ challenges });
  } catch (error) {
    console.error('Get active challenges error:', error);
    res.status(500).json({ error: 'Error fetching active challenges' });
  }
});

export default router;

