const mongoose = require('mongoose');

/**
 * Review Schema
 * Stores product reviews from users
 */
const reviewSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  review_text: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
    maxlength: [1000, 'Review text cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
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
reviewSchema.index({ product_id: 1 });
reviewSchema.index({ user_id: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ created_at: 1 });

// Compound index to ensure a user can only review a product once
reviewSchema.index(
  { product_id: 1, user_id: 1 }, 
  { unique: true }
);

// Static method to calculate average rating for a product
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const result = await this.aggregate([
    { $match: { product_id: mongoose.Types.ObjectId(productId), status: 'approved' } },
    { $group: { _id: '$product_id', averageRating: { $avg: '$rating' } } }
  ]);
  
  return result.length > 0 ? result[0].averageRating : 0;
};

// Pre-save middleware to validate that the user has purchased the product
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Check if the user has purchased this product
      const OrderItem = mongoose.model('OrderItem');
      const Order = mongoose.model('Order');
      
      const orderItems = await OrderItem.find({ product_id: this.product_id });
      if (!orderItems.length) {
        return next(new Error('You can only review products you have purchased'));
      }
      
      const orderIds = orderItems.map(item => item.order_id);
      const orders = await Order.find({
        _id: { $in: orderIds },
        user_id: this.user_id,
        status: 'delivered'
      });
      
      if (!orders.length) {
        return next(new Error('You can only review products from delivered orders'));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Create model from schema
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;