import express from 'express';
import Item from '../models/Item.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/analytics/overview - Comprehensive analytics overview
router.get('/overview', async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all items
    const allItems = await Item.find({ userId });
    
    // Calculate trends
    const itemsLast30Days = allItems.filter(item => 
      new Date(item.createdAt) >= thirtyDaysAgo
    );
    const itemsLast7Days = allItems.filter(item => 
      new Date(item.createdAt) >= sevenDaysAgo
    );
    
    const consumedLast30Days = itemsLast30Days.filter(item => item.status === 'consumed');
    const consumedLast7Days = itemsLast7Days.filter(item => item.status === 'consumed');
    
    // Daily trends for last 30 days
    const dailyTrends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const itemsAdded = allItems.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= dayStart && itemDate <= dayEnd;
      }).length;
      
      const itemsConsumed = allItems.filter(item => {
        if (item.status !== 'consumed') return false;
        const itemDate = new Date(item.updatedAt);
        return itemDate >= dayStart && itemDate <= dayEnd;
      }).length;
      
      dailyTrends.push({
        date: dayStart.toISOString().split('T')[0],
        itemsAdded,
        itemsConsumed,
        itemsSaved: itemsConsumed
      });
    }
    
    // Category breakdown
    const categoryBreakdown = {};
    allItems.forEach(item => {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
    });
    
    // Status breakdown
    const statusBreakdown = {
      fresh: allItems.filter(i => i.status === 'fresh').length,
      expiring_soon: allItems.filter(i => i.status === 'expiring_soon').length,
      expired: allItems.filter(i => i.status === 'expired').length,
      consumed: allItems.filter(i => i.status === 'consumed').length
    };
    
    const user = await User.findById(userId);
    
    // Calculate environmental impact
    const itemsSaved = user.stats.itemsSaved || 0;
    const co2Saved = itemsSaved * 2.5; // kg CO2 per item saved
    const waterSaved = itemsSaved * 1800; // liters per item
    const mealsEquivalent = Math.round(itemsSaved * 0.5); // approximate meals
    
    res.json({
      overview: {
        totalItems: allItems.length,
        itemsSaved: itemsSaved,
        itemsWasted: user.stats.itemsWasted || 0,
        moneySaved: user.stats.moneySaved || 0,
        wasteReductionRate: allItems.length > 0 
          ? ((itemsSaved / (itemsSaved + (user.stats.itemsWasted || 0))) * 100).toFixed(1)
          : 0
      },
      trends: {
        last30Days: {
          itemsAdded: itemsLast30Days.length,
          itemsConsumed: consumedLast30Days.length,
          growth: itemsLast7Days.length > 0 
            ? (((itemsLast7Days.length - itemsLast30Days.length / 4.3) / (itemsLast30Days.length / 4.3)) * 100).toFixed(1)
            : 0
        },
        last7Days: {
          itemsAdded: itemsLast7Days.length,
          itemsConsumed: consumedLast7Days.length
        },
        daily: dailyTrends
      },
      breakdown: {
        byCategory: categoryBreakdown,
        byStatus: statusBreakdown
      },
      environmentalImpact: {
        co2Saved: Math.round(co2Saved * 10) / 10,
        waterSaved: Math.round(waterSaved),
        mealsEquivalent,
        treesEquivalent: Math.round(co2Saved / 21.77) // 1 tree = 21.77 kg CO2/year
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Error fetching analytics' });
  }
});

// GET /api/analytics/insights - AI-powered insights
router.get('/insights', async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const items = await Item.find({ userId });
    const expiringItems = await Item.find({
      userId,
      expiryDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      status: { $ne: 'consumed' }
    });
    
    const recentItems = items.filter(item => 
      new Date(item.createdAt) >= sevenDaysAgo
    );
    
    const insights = [];
    
    // Insight 1: Expiring items
    if (expiringItems.length > 0) {
      insights.push({
        type: 'warning',
        title: `${expiringItems.length} items expiring soon`,
        message: `You have ${expiringItems.length} items expiring in the next 7 days. Consider using them soon!`,
        action: 'View expiring items',
        priority: 'high'
      });
    }
    
    // Insight 2: Consumption rate
    const consumedRate = items.filter(i => i.status === 'consumed').length / Math.max(items.length, 1);
    if (consumedRate < 0.7 && items.length > 5) {
      insights.push({
        type: 'info',
        title: 'Improve consumption rate',
        message: `You're consuming ${(consumedRate * 100).toFixed(0)}% of tracked items. Aim for 80%+ to maximize waste reduction!`,
        action: 'View recommendations',
        priority: 'medium'
      });
    }
    
    // Insight 3: Category distribution
    const categoryCounts = {};
    items.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      insights.push({
        type: 'success',
        title: `${topCategory[0]} is your most tracked category`,
        message: `You've tracked ${topCategory[1]} ${topCategory[0]} items. Great job staying organized!`,
        action: null,
        priority: 'low'
      });
    }
    
    // Insight 4: Recent activity
    if (recentItems.length === 0) {
      insights.push({
        type: 'info',
        title: 'Start tracking again',
        message: 'You haven\'t added any items in the last 7 days. Keep up the good work!',
        action: 'Add new item',
        priority: 'low'
      });
    }
    
    res.json({ insights });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ error: 'Error fetching insights' });
  }
});

export default router;

