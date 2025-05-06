const mongoose = require('mongoose');

/**
 * Wishlist Schema
 * Represents a user's wishlist of products
 */
const wishlistSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Wishlist name is required'],
    trim: true,
    maxlength: [50, 'Wishlist name cannot be more than 50 characters'],
    default: 'My Wishlist'
  },
  is_public: {
    type: Boolean,
    default: false
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
wishlistSchema.index({ user_id: 1 });
wishlistSchema.index({ is_public: 1 });

// Virtual for wishlist items
wishlistSchema.virtual('items', {
  ref: 'WishlistItem',
  localField: '_id',
  foreignField: 'wishlist_id'
});

// Create model from schema
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;