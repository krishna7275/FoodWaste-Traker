import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  type: {
    type: String,
    enum: ['expiring_soon', 'expired', 'reminder'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  daysUntilExpiry: {
    type: Number
  },
  triggerDate: {
    type: Date,
    default: Date.now
  },
  sent: {
    type: Boolean,
    default: false
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  whatsappSent: {
    type: Boolean,
    default: false
  },
  read: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for efficient queries
alertSchema.index({ userId: 1, read: 1, createdAt: -1 });
alertSchema.index({ itemId: 1 });

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;