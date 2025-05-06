const mongoose = require('mongoose');

/**
 * Order Item Schema
 * Represents items in a user's order
 */
const orderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Index for faster queries
orderItemSchema.index({ order_id: 1 });
orderItemSchema.index({ product_id: 1 });

// Pre-save middleware to calculate total if not provided
orderItemSchema.pre('save', function(next) {
  if (!this.total) {
    this.total = this.price * this.quantity;
  }
  next();
});

// Create model from schema
const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;