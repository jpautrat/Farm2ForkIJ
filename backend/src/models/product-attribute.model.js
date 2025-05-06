const mongoose = require('mongoose');

/**
 * Product Attribute Schema
 * Stores additional attributes for products
 */
const productAttributeSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  attribute_name: {
    type: String,
    required: [true, 'Attribute name is required'],
    trim: true
  },
  attribute_value: {
    type: String,
    required: [true, 'Attribute value is required'],
    trim: true
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
productAttributeSchema.index({ product_id: 1 });
productAttributeSchema.index({ product_id: 1, attribute_name: 1 });

// Compound unique index to prevent duplicate attributes for the same product
productAttributeSchema.index(
  { product_id: 1, attribute_name: 1 }, 
  { unique: true }
);

// Create model from schema
const ProductAttribute = mongoose.model('ProductAttribute', productAttributeSchema);

module.exports = ProductAttribute;