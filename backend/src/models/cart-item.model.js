const mongoose = require('mongoose');

/**
 * Cart Item Schema
 * Represents items in a user's shopping cart
 */
const cartItemSchema = new mongoose.Schema({
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShoppingCart',
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
    min: [1, 'Quantity must be at least 1'],
    default: 1
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
cartItemSchema.index({ cart_id: 1 });
cartItemSchema.index({ product_id: 1 });

// Compound unique index to prevent duplicate products in the same cart
cartItemSchema.index(
  { cart_id: 1, product_id: 1 }, 
  { unique: true }
);

// Pre-save middleware to check product availability
cartItemSchema.pre('save', async function(next) {
  try {
    // Check if product exists and has enough quantity
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product_id);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    if (product.status !== 'active') {
      throw new Error('Product is not available for purchase');
    }
    
    if (product.quantity < this.quantity) {
      throw new Error(`Only ${product.quantity} items available`);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for subtotal
cartItemSchema.virtual('subtotal').get(function() {
  if (!this._subtotal) return 0;
  return this._subtotal;
});

// Method to calculate subtotal
cartItemSchema.methods.calculateSubtotal = function(product) {
  const price = product.sale_price || product.price;
  this._subtotal = price * this.quantity;
  return this._subtotal;
};

// Create model from schema
const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;