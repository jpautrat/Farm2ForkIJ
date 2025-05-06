const mongoose = require('mongoose');

/**
 * Order Schema
 * Represents a user's order
 */
const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order_number: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  total_amount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  shipping_amount: {
    type: Number,
    required: true,
    min: [0, 'Shipping amount cannot be negative'],
    default: 0
  },
  tax_amount: {
    type: Number,
    required: true,
    min: [0, 'Tax amount cannot be negative'],
    default: 0
  },
  discount_amount: {
    type: Number,
    required: true,
    min: [0, 'Discount amount cannot be negative'],
    default: 0
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  shipping_address_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  billing_address_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
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
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
orderSchema.index({ user_id: 1 });
orderSchema.index({ order_number: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ payment_status: 1 });
orderSchema.index({ created_at: 1 });

// Virtual for order items
orderSchema.virtual('items', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'order_id'
});

// Virtual for payment
orderSchema.virtual('payment', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'order_id',
  justOne: true
});

// Virtual for shipment
orderSchema.virtual('shipment', {
  ref: 'Shipment',
  localField: '_id',
  foreignField: 'order_id',
  justOne: true
});

// Static method to generate order number
orderSchema.statics.generateOrderNumber = async function() {
  const date = new Date();
  const prefix = 'ORD';
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Get the count of orders created today
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const count = await this.countDocuments({
    created_at: { $gte: startOfDay, $lte: endOfDay }
  });
  
  // Format: ORD-YYMMDD-XXXX (XXXX is a sequential number)
  const sequential = (count + 1).toString().padStart(4, '0');
  
  return `${prefix}-${year}${month}${day}-${sequential}`;
};

// Create model from schema
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;