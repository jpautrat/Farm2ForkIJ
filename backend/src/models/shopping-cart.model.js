const mongoose = require('mongoose');

/**
 * Shopping Cart Schema
 * Represents a user's shopping cart
 */
const shoppingCartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
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

// Virtual for cart items
shoppingCartSchema.virtual('items', {
  ref: 'CartItem',
  localField: '_id',
  foreignField: 'cart_id'
});

// Method to calculate cart total
shoppingCartSchema.methods.calculateTotal = async function() {
  await this.populate({
    path: 'items',
    populate: {
      path: 'product_id',
      select: 'price sale_price'
    }
  });

  let total = 0;
  
  if (this.items && this.items.length > 0) {
    total = this.items.reduce((sum, item) => {
      const price = item.product_id.sale_price || item.product_id.price;
      return sum + (price * item.quantity);
    }, 0);
  }
  
  return total;
};

// Create model from schema
const ShoppingCart = mongoose.model('ShoppingCart', shoppingCartSchema);

module.exports = ShoppingCart;