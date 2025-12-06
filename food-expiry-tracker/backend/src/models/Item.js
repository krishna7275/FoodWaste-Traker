import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Dairy',
      'Meat',
      'Vegetables',
      'Fruits',
      'Grains',
      'Beverages',
      'Snacks',
      'Condiments',
      'Frozen',
      'Bakery',
      'Other'
    ],
    default: 'Other'
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative'],
    default: 1
  },
  unit: {
    type: String,
    enum: ['pieces', 'kg', 'g', 'l', 'ml', 'packets'],
    default: 'pieces'
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
    index: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  barcode: {
    type: String,
    sparse: true
  },
  imageUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['fresh', 'expiring_soon', 'expired', 'consumed'],
    default: 'fresh'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  estimatedPrice: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
itemSchema.index({ userId: 1, expiryDate: 1 });
itemSchema.index({ userId: 1, status: 1 });

// Virtual for days until expiry
itemSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to update status based on expiry date
itemSchema.methods.updateStatus = function() {
  const daysUntilExpiry = this.daysUntilExpiry;
  
  if (this.status === 'consumed') {
    return this.status;
  }
  
  if (daysUntilExpiry < 0) {
    this.status = 'expired';
  } else if (daysUntilExpiry <= 3) {
    this.status = 'expiring_soon';
  } else {
    this.status = 'fresh';
  }
  
  return this.status;
};

// Pre-save hook to update status
itemSchema.pre('save', function(next) {
  if (this.status !== 'consumed') {
    this.updateStatus();
  }
  next();
});

// Enable virtuals in JSON
itemSchema.set('toJSON', { virtuals: true });
itemSchema.set('toObject', { virtuals: true });

const Item = mongoose.model('Item', itemSchema);

export default Item;