import express from 'express';
import Achievement from '../models/Achievement.js';
import User from '../models/User.js';
import Item from '../models/Item.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = {
  first_item: { name: 'First Step', description: 'Added your first item', points: 10, icon: '🎯' },
  items_saved_10: { name: 'Saver', description: 'Saved 10 items from waste', points: 50, icon: '💚' },
  items_saved_50: { name: 'Eco Hero', description: 'Saved 50 items from waste', points: 200, icon: '🌱' },
  items_saved_100: { name: 'Waste Warrior', description: 'Saved 100 items from waste', points: 500, icon: '🛡️' },
  streak_7: { name: 'Week Warrior', description: '7-day tracking streak', points: 100, icon: '🔥' },
  streak_30: { name: 'Monthly Master', description: '30-day tracking streak', points: 500, icon: '⭐' },
  zero_waste_week: { name: 'Zero Waste Week', description: 'No waste for 7 days', points: 300, icon: '♻️' },
  eco_warrior: { name: 'Eco Warrior', description: 'Saved 1 ton of CO2', points: 1000, icon: '🌍' },
  money_saver: { name: 'Money Saver', description: 'Saved ₹100', points: 250, icon: '💰' },
  recipe_master: { name: 'Recipe Master', description: 'Used 10 AI recipes', points: 150, icon: '👨‍🍳' },
  early_bird: { name: 'Early Bird', description: 'Consumed 5 items before expiry', points: 100, icon: '🐦' },
  perfect_tracker: { name: 'Perfect Tracker', description: '100% consumption rate (10+ items)', points: 400, icon: '✨' }
};

// GET /api/achievements - Get all user achievements
router.get('/', async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.userId }).sort({ unlockedAt: -1 });
    const allAchievements = Object.entries(ACHIEVEMENT_DEFINITIONS).map(([type, def]) => {
      const unlocked = achievements.find(a => a.type === type);
      return {
        type,
        ...def,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt || null
      };
    });
    
    res.json({ achievements: allAchievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Error fetching achievements' });
  }
});

// POST /api/achievements/check - Check and unlock achievements
router.post('/check', async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const items = await Item.find({ userId });
    const achievements = await Achievement.find({ userId });
    const unlockedTypes = new Set(achievements.map(a => a.type));
    const newlyUnlocked = [];
    
    // Check each achievement type
    for (const [type, def] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
      if (unlockedTypes.has(type)) continue;
      
      let shouldUnlock = false;
      
      switch (type) {
        case 'first_item':
          shouldUnlock = items.length >= 1;
          break;
        case 'items_saved_10':
          shouldUnlock = (user.stats.itemsSaved || 0) >= 10;
          break;
        case 'items_saved_50':
          shouldUnlock = (user.stats.itemsSaved || 0) >= 50;
          break;
        case 'items_saved_100':
          shouldUnlock = (user.stats.itemsSaved || 0) >= 100;
          break;
        case 'streak_7':
          shouldUnlock = (user.stats.currentStreak || 0) >= 7;
          break;
        case 'streak_30':
          shouldUnlock = (user.stats.currentStreak || 0) >= 30;
          break;
        case 'zero_waste_week':
          // Check last 7 days for zero waste
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const recentWasted = items.filter(item => 
            item.status === 'expired' && new Date(item.updatedAt) >= sevenDaysAgo
          ).length;
          shouldUnlock = recentWasted === 0 && items.length >= 7;
          break;
        case 'eco_warrior':
          const co2Saved = (user.stats.itemsSaved || 0) * 2.5;
          shouldUnlock = co2Saved >= 1000; // 1 ton
          break;
        case 'money_saver':
          shouldUnlock = (user.stats.moneySaved || 0) >= 100;
          break;
        case 'early_bird':
          const earlyConsumed = items.filter(item => 
            item.status === 'consumed' && 
            item.daysUntilExpiry > 0
          ).length;
          shouldUnlock = earlyConsumed >= 5;
          break;
        case 'perfect_tracker':
          const consumedItems = items.filter(i => i.status === 'consumed').length;
          const totalTracked = items.length;
          shouldUnlock = totalTracked >= 10 && consumedItems === totalTracked;
          break;
      }
      
      if (shouldUnlock) {
        const achievement = new Achievement({
          userId,
          type,
          points: def.points
        });
        await achievement.save();
        
        // Update user points and level
        await User.findByIdAndUpdate(userId, {
          $inc: { 'stats.points': def.points },
          $set: { 
            'stats.level': Math.floor((user.stats.points + def.points) / 100) + 1
          }
        });
        
        newlyUnlocked.push({
          ...def,
          type,
          unlockedAt: achievement.unlockedAt
        });
      }
    }
    
    res.json({ newlyUnlocked, total: newlyUnlocked.length });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({ error: 'Error checking achievements' });
  }
});

// GET /api/achievements/stats - Get achievement stats
router.get('/stats', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const achievements = await Achievement.find({ userId: req.userId });
    const totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), 0);
    
    res.json({
      totalAchievements: achievements.length,
      totalPossible: Object.keys(ACHIEVEMENT_DEFINITIONS).length,
      totalPoints: user.stats.points || 0,
      level: user.stats.level || 1,
      currentStreak: user.stats.currentStreak || 0,
      longestStreak: user.stats.longestStreak || 0,
      progress: (achievements.length / Object.keys(ACHIEVEMENT_DEFINITIONS).length * 100).toFixed(1)
    });
  } catch (error) {
    console.error('Achievement stats error:', error);
    res.status(500).json({ error: 'Error fetching achievement stats' });
  }
});

export default router;

