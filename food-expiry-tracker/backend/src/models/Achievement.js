import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'first_item',
      'items_saved_10',
      'items_saved_50',
      'items_saved_100',
      'streak_7',
      'streak_30',
      'zero_waste_week',
      'eco_warrior',
      'money_saver',
      'recipe_master',
      'early_bird',
      'perfect_tracker'
    ]
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  points: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

achievementSchema.index({ userId: 1, type: 1 }, { unique: true });

const Achievement = mongoose.model('Achievement', achievementSchema);

export default Achievement;

