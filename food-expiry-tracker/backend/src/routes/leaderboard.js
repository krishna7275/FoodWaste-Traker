import express from 'express';
import User from '../models/User.js';
import Item from '../models/Item.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/leaderboard - Get global leaderboard
router.get('/', async (req, res) => {
  try {
    const { type = 'points', limit = 50 } = req.query;
    
    let sortField;
    switch (type) {
      case 'points':
        sortField = 'stats.points';
        break;
      case 'itemsSaved':
        sortField = 'stats.itemsSaved';
        break;
      case 'streak':
        sortField = 'stats.longestStreak';
        break;
      case 'co2':
        // Calculate CO2 saved (itemsSaved * 2.5)
        sortField = 'stats.itemsSaved';
        break;
      default:
        sortField = 'stats.points';
    }

    const users = await User.find({})
      .select('name email stats.itemsSaved stats.points stats.longestStreak stats.currentStreak stats.moneySaved')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      email: user.email,
      points: user.stats.points || 0,
      itemsSaved: user.stats.itemsSaved || 0,
      longestStreak: user.stats.longestStreak || 0,
      currentStreak: user.stats.currentStreak || 0,
      moneySaved: user.stats.moneySaved || 0,
      co2Saved: Math.round((user.stats.itemsSaved || 0) * 2.5 * 10) / 10,
      level: Math.floor((user.stats.points || 0) / 100) + 1
    }));

    res.json({ leaderboard, type });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Error fetching leaderboard' });
  }
});

// GET /api/leaderboard/community-stats - Get global community statistics
router.get('/community-stats', async (req, res) => {
  try {
    const [totalUsers, totalItems, totalSaved, totalWasted] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      User.aggregate([
        { $group: { _id: null, total: { $sum: '$stats.itemsSaved' } } }
      ]),
      User.aggregate([
        { $group: { _id: null, total: { $sum: '$stats.itemsWasted' } } }
      ])
    ]);

    const totalItemsSaved = totalSaved[0]?.total || 0;
    const totalItemsWasted = totalWasted[0]?.total || 0;
    const totalCo2Saved = Math.round(totalItemsSaved * 2.5 * 10) / 10;
    const totalWaterSaved = totalItemsSaved * 1800;
    const totalMealsEquivalent = Math.round(totalItemsSaved * 0.5);
    const totalMoneySaved = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$stats.moneySaved' } } }
    ]);

    res.json({
      totalUsers,
      totalItems,
      totalItemsSaved,
      totalItemsWasted,
      totalCo2Saved,
      totalWaterSaved,
      totalMealsEquivalent,
      totalMoneySaved: totalMoneySaved[0]?.total || 0,
      wasteReductionRate: totalItemsSaved + totalItemsWasted > 0
        ? ((totalItemsSaved / (totalItemsSaved + totalItemsWasted)) * 100).toFixed(1)
        : 0
    });
  } catch (error) {
    console.error('Community stats error:', error);
    res.status(500).json({ error: 'Error fetching community stats' });
  }
});

// GET /api/leaderboard/user-rank - Get current user's rank
router.get('/user-rank', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userPoints = user.stats.points || 0;
    const userItemsSaved = user.stats.itemsSaved || 0;

    const [pointsRank, itemsRank] = await Promise.all([
      User.countDocuments({ 'stats.points': { $gt: userPoints } }),
      User.countDocuments({ 'stats.itemsSaved': { $gt: userItemsSaved } })
    ]);

    res.json({
      pointsRank: pointsRank + 1,
      itemsSavedRank: itemsRank + 1,
      totalUsers: await User.countDocuments()
    });
  } catch (error) {
    console.error('User rank error:', error);
    res.status(500).json({ error: 'Error fetching user rank' });
  }
});

export default router;

