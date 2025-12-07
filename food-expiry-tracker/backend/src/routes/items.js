import express from 'express';
import Item from '../models/Item.js';
import Alert from '../models/Alert.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/items - Create new item
router.post('/', async (req, res) => {
  try {
    const { name, category, quantity, unit, expiryDate, purchaseDate, barcode, notes, estimatedPrice } = req.body;

    if (!name || !expiryDate) {
      return res.status(400).json({ error: 'Name and expiry date are required' });
    }

    const item = new Item({
      userId: req.userId,
      name,
      category,
      quantity,
      unit,
      expiryDate: new Date(expiryDate),
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      barcode,
      notes,
      estimatedPrice
    });

    await item.save();

    // Update user stats
    const user = await User.findById(req.userId);
    await User.findByIdAndUpdate(req.userId, { 
      $inc: { 'stats.totalItems': 1 },
      $set: { 'stats.lastActiveDate': new Date() }
    });

    res.status(201).json({ message: 'Item added successfully', item });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: error.message || 'Error creating item' });
  }
});

// GET /api/items - Get all items for user
router.get('/', async (req, res) => {
  try {
    const { status, category, sort = '-expiryDate' } = req.query;

    const filter = { userId: req.userId };
    
    if (status) filter.status = status;
    if (category) filter.category = category;

    const items = await Item.find(filter).sort(sort);

    res.json({ items, count: items.length });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Error fetching items' });
  }
});

// GET /api/items/expiring - Get items expiring soon
router.get('/expiring', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const items = await Item.find({
      userId: req.userId,
      expiryDate: { $gte: now, $lte: futureDate },
      status: { $ne: 'consumed' }
    }).sort('expiryDate');

    res.json({ items, count: items.length });
  } catch (error) {
    console.error('Get expiring items error:', error);
    res.status(500).json({ error: 'Error fetching expiring items' });
  }
});

// GET /api/items/stats - Get statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.userId;

    const [totalItems, expiringItems, expiredItems, consumedItems] = await Promise.all([
      Item.countDocuments({ userId, status: { $ne: 'consumed' } }),
      Item.countDocuments({ userId, status: 'expiring_soon' }),
      Item.countDocuments({ userId, status: 'expired' }),
      Item.countDocuments({ userId, status: 'consumed' })
    ]);

    const user = await User.findById(userId);

    res.json({
      totalItems,
      expiringItems,
      expiredItems,
      consumedItems,
      itemsSaved: user.stats.itemsSaved || 0,
      itemsWasted: user.stats.itemsWasted || 0,
      moneySaved: user.stats.moneySaved || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

// GET /api/items/:id - Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.userId });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ item });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching item' });
  }
});

// PUT /api/items/:id - Update item
router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.userId });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const allowedUpdates = ['name', 'category', 'quantity', 'unit', 'expiryDate', 'notes', 'estimatedPrice'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    await item.save();

    res.json({ message: 'Item updated successfully', item });
  } catch (error) {
    res.status(500).json({ error: 'Error updating item' });
  }
});

// PATCH /api/items/:id/consume - Mark item as consumed
router.patch('/:id/consume', async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.userId });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    item.status = 'consumed';
    await item.save();

    // Update user stats
    const wasSaved = item.daysUntilExpiry >= 0;
    const updateField = wasSaved ? 'stats.itemsSaved' : 'stats.itemsWasted';
    
    const user = await User.findById(req.userId);
    const today = new Date().toDateString();
    const lastActive = user.stats.lastActiveDate ? new Date(user.stats.lastActiveDate).toDateString() : null;
    
    // Update streak
    let currentStreak = user.stats.currentStreak || 0;
    if (lastActive === today) {
      // Already active today, no change
    } else if (lastActive === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()) {
      // Active yesterday, increment streak
      currentStreak += 1;
    } else {
      // Break in streak, reset to 1
      currentStreak = 1;
    }
    
    await User.findByIdAndUpdate(req.userId, {
      $inc: {
        [updateField]: 1,
        'stats.moneySaved': wasSaved ? (item.estimatedPrice || 0) : 0,
        'stats.points': wasSaved ? 5 : 0 // Award points for saving items
      },
      $set: {
        'stats.currentStreak': currentStreak,
        'stats.lastActiveDate': new Date(),
        'stats.longestStreak': Math.max(currentStreak, user.stats.longestStreak || 0)
      }
    });

    res.json({ message: 'Item marked as consumed', item });
  } catch (error) {
    res.status(500).json({ error: 'Error updating item status' });
  }
});

// DELETE /api/items/:id - Delete item
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Delete associated alerts
    await Alert.deleteMany({ itemId: item._id });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting item' });
  }
});

export default router;