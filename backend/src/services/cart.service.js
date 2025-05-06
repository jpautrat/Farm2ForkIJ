/**
 * Cart service
 * Handles shopping cart-related business logic
 */
const ShoppingCart = require('../models/shopping-cart.model');
const CartItem = require('../models/cart-item.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');

class CartService {
  /**
   * Get user's cart
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Cart with items and totals
   */
  async getUserCart(userId) {
    // Find or create cart
    let cart = await ShoppingCart.findOne({ user_id: userId });
    
    if (!cart) {
      cart = await this.createCart(userId);
    }
    
    // Get cart items with product details
    const cartItems = await CartItem.find({ cart_id: cart._id })
      .populate({
        path: 'product_id',
        select: 'name price sale_price image status quantity seller_id',
        populate: {
          path: 'seller_id',
          select: 'first_name last_name farm_name'
        }
      });
    
    // Calculate totals
    const { subtotal, total, itemCount } = this.calculateCartTotals(cartItems);
    
    return {
      _id: cart._id,
      userId: cart.user_id,
      items: cartItems,
      subtotal,
      total,
      itemCount,
      createdAt: cart.created_at,
      updatedAt: cart.updated_at
    };
  }

  /**
   * Create a new cart
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Created cart object
   */
  async createCart(userId) {
    const cart = new ShoppingCart({
      user_id: userId
    });
    
    return await cart.save();
  }

  /**
   * Add item to cart
   * @param {string} userId - User ID
   * @param {Object} itemData - Item data (productId, quantity)
   * @returns {Promise<Object>} - Updated cart with items and totals
   */
  async addItemToCart(userId, itemData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Find or create cart
      let cart = await ShoppingCart.findOne({ user_id: userId }).session(session);
      
      if (!cart) {
        cart = await this.createCart(userId);
      }
      
      // Check if product exists and is available
      const product = await Product.findById(itemData.productId).session(session);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      if (product.status !== 'active') {
        throw new Error('Product is not available');
      }
      
      if (product.quantity < itemData.quantity) {
        throw new Error('Not enough product in stock');
      }
      
      // Check if item already exists in cart
      let cartItem = await CartItem.findOne({
        cart_id: cart._id,
        product_id: itemData.productId
      }).session(session);
      
      if (cartItem) {
        // Update quantity
        cartItem.quantity += itemData.quantity;
        await cartItem.save({ session });
      } else {
        // Create new cart item
        cartItem = new CartItem({
          cart_id: cart._id,
          product_id: itemData.productId,
          quantity: itemData.quantity
        });
        
        await cartItem.save({ session });
      }
      
      // Update cart timestamp
      cart.updated_at = Date.now();
      await cart.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      
      // Return updated cart
      return await this.getUserCart(userId);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Update cart item
   * @param {string} userId - User ID
   * @param {string} itemId - Cart item ID
   * @param {Object} updateData - Update data (quantity)
   * @returns {Promise<Object>} - Updated cart with items and totals
   */
  async updateCartItem(userId, itemId, updateData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Find cart
      const cart = await ShoppingCart.findOne({ user_id: userId }).session(session);
      
      if (!cart) {
        throw new Error('Cart not found');
      }
      
      // Find cart item
      const cartItem = await CartItem.findOne({
        _id: itemId,
        cart_id: cart._id
      }).session(session);
      
      if (!cartItem) {
        throw new Error('Cart item not found');
      }
      
      // Check if product is available and has enough stock
      const product = await Product.findById(cartItem.product_id).session(session);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      if (product.status !== 'active') {
        throw new Error('Product is not available');
      }
      
      if (product.quantity < updateData.quantity) {
        throw new Error('Not enough product in stock');
      }
      
      // Update quantity
      cartItem.quantity = updateData.quantity;
      await cartItem.save({ session });
      
      // Update cart timestamp
      cart.updated_at = Date.now();
      await cart.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      
      // Return updated cart
      return await this.getUserCart(userId);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Remove item from cart
   * @param {string} userId - User ID
   * @param {string} itemId - Cart item ID
   * @returns {Promise<Object>} - Updated cart with items and totals
   */
  async removeCartItem(userId, itemId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Find cart
      const cart = await ShoppingCart.findOne({ user_id: userId }).session(session);
      
      if (!cart) {
        throw new Error('Cart not found');
      }
      
      // Find and delete cart item
      const cartItem = await CartItem.findOneAndDelete({
        _id: itemId,
        cart_id: cart._id
      }).session(session);
      
      if (!cartItem) {
        throw new Error('Cart item not found');
      }
      
      // Update cart timestamp
      cart.updated_at = Date.now();
      await cart.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      
      // Return updated cart
      return await this.getUserCart(userId);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Clear cart
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Empty cart
   */
  async clearCart(userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Find cart
      const cart = await ShoppingCart.findOne({ user_id: userId }).session(session);
      
      if (!cart) {
        throw new Error('Cart not found');
      }
      
      // Delete all cart items
      await CartItem.deleteMany({ cart_id: cart._id }).session(session);
      
      // Update cart timestamp
      cart.updated_at = Date.now();
      await cart.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      
      // Return empty cart
      return await this.getUserCart(userId);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Calculate cart totals
   * @param {Array} cartItems - Cart items with product details
   * @returns {Object} - Subtotal, total, and item count
   */
  calculateCartTotals(cartItems) {
    let subtotal = 0;
    let itemCount = 0;
    
    cartItems.forEach(item => {
      const product = item.product_id;
      const price = product.sale_price || product.price;
      subtotal += price * item.quantity;
      itemCount += item.quantity;
    });
    
    // For now, total is same as subtotal
    // In a real app, you would add tax, shipping, etc.
    const total = subtotal;
    
    return {
      subtotal,
      total,
      itemCount
    };
  }

  /**
   * Validate cart items (check if products are available and have enough stock)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Validation result with valid items and invalid items
   */
  async validateCartItems(userId) {
    // Get cart with items
    const cart = await this.getUserCart(userId);
    
    const validItems = [];
    const invalidItems = [];
    
    // Check each item
    for (const item of cart.items) {
      const product = await Product.findById(item.product_id._id);
      
      if (!product || product.status !== 'active' || product.quantity < item.quantity) {
        invalidItems.push({
          item,
          reason: !product ? 'Product not found' : 
                  product.status !== 'active' ? 'Product is not available' : 
                  'Not enough product in stock'
        });
      } else {
        validItems.push(item);
      }
    }
    
    return {
      valid: invalidItems.length === 0,
      validItems,
      invalidItems
    };
  }
}

module.exports = new CartService();