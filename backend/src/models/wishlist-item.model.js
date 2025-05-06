const mongoose = require('mongoose');

/**
 * Wishlist Item Schema
 * Represents items in a user's wishlist
 */
const wishlistItemSchema = new mongoose.Schema({
  wishlist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wishlist',
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
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
wishlistItemSchema.index({ wishlist_id: 1 });
wishlistItemSchema.index({ product_id: 1 });

// Compound unique index to prevent duplicate products in the same wishlist
wishlistItemSchema.index(
  { wishlist_id: 1, product_id: 1 }, 
  { unique: true }
);

// Create model from schema
const WishlistItem = mongoose.model('WishlistItem', wishlistItemSchema);

module.exports = WishlistItem;