const mongoose = require('mongoose');

/**
 * Product Image Schema
 * Stores images for products
 */
const productImageSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  image_url: {
    type: String,
    required: [true, 'Image URL is required']
  },
  is_primary: {
    type: Boolean,
    default: false
  },
  display_order: {
    type: Number,
    default: 0
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
productImageSchema.index({ product_id: 1 });
productImageSchema.index({ product_id: 1, is_primary: 1 });

// Pre-save middleware to ensure only one primary image per product
productImageSchema.pre('save', async function(next) {
  if (this.is_primary) {
    try {
      // Find other images for this product that are set as primary
      await this.constructor.updateMany(
        { 
          product_id: this.product_id, 
          _id: { $ne: this._id }, 
          is_primary: true 
        },
        { is_primary: false }
      );
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Create model from schema
const ProductImage = mongoose.model('ProductImage', productImageSchema);

module.exports = ProductImage;