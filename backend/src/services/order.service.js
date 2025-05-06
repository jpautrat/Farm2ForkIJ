/**
 * Order service
 * Handles order-related business logic
 */
const Order = require('../models/order.model');
const OrderItem = require('../models/order-item.model');
const Product = require('../models/product.model');
const ShoppingCart = require('../models/shopping-cart.model');
const CartItem = require('../models/cart-item.model');
const cartService = require('./cart.service');
const mongoose = require('mongoose');

class OrderService {
  /**
   * Get all orders for a user
   * @param {string} userId - User ID
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Orders and pagination info
   */
  async getUserOrders(userId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const filter = { user_id: userId };
    
    // Add status filter if provided
    if (query.status) {
      filter.status = query.status;
    }
    
    const orders = await Order.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments(filter);
    
    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Order object with items
   */
  async getOrderById(orderId) {
    const order = await Order.findById(orderId)
      .populate('shipping_address_id')
      .populate('billing_address_id');
    
    if (!order) {
      return null;
    }
    
    // Get order items with product details
    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate({
        path: 'product_id',
        select: 'name price sale_price image seller_id',
        populate: {
          path: 'seller_id',
          select: 'first_name last_name farm_name'
        }
      });
    
    return {
      ...order.toObject(),
      items: orderItems
    };
  }

  /**
   * Create a new order from cart
   * @param {string} userId - User ID
   * @param {Object} orderData - Order data (shipping address, billing address, payment method)
   * @returns {Promise<Object>} - Created order object
   */
  async createOrder(userId, orderData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Validate cart items
      const validationResult = await cartService.validateCartItems(userId);
      
      if (!validationResult.valid) {
        throw new Error('Cart contains invalid items');
      }
      
      // Get cart
      const cart = await cartService.getUserCart(userId);
      
      if (cart.items.length === 0) {
        throw new Error('Cart is empty');
      }
      
      // Create order
      const order = new Order({
        user_id: userId,
        order_number: this.generateOrderNumber(),
        status: 'pending',
        total_amount: cart.total,
        shipping_amount: orderData.shippingAmount || 0,
        tax_amount: orderData.taxAmount || 0,
        discount_amount: orderData.discountAmount || 0,
        payment_status: 'pending',
        shipping_address_id: orderData.shippingAddressId,
        billing_address_id: orderData.billingAddressId || orderData.shippingAddressId
      });
      
      await order.save({ session });
      
      // Create order items
      const orderItemPromises = cart.items.map(item => {
        const product = item.product_id;
        const price = product.sale_price || product.price;
        
        const orderItem = new OrderItem({
          order_id: order._id,
          product_id: product._id,
          quantity: item.quantity,
          price: price,
          total: price * item.quantity
        });
        
        return orderItem.save({ session });
      });
      
      await Promise.all(orderItemPromises);
      
      // Update product quantities
      const productUpdatePromises = cart.items.map(item => {
        return Product.findByIdAndUpdate(
          item.product_id._id,
          { $inc: { quantity: -item.quantity } },
          { session }
        );
      });
      
      await Promise.all(productUpdatePromises);
      
      // Clear cart
      await CartItem.deleteMany({ cart_id: cart._id }, { session });
      
      await session.commitTransaction();
      session.endSession();
      
      // Return order with items
      return await this.getOrderById(order._id);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated order object
   */
  async updateOrderStatus(orderId, status) {
    // Validate status
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      throw new Error('Invalid status');
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    return await this.getOrderById(order._id);
  }

  /**
   * Update payment status
   * @param {string} orderId - Order ID
   * @param {string} paymentStatus - New payment status
   * @returns {Promise<Object>} - Updated order object
   */
  async updatePaymentStatus(orderId, paymentStatus) {
    // Validate payment status
    if (!['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
      throw new Error('Invalid payment status');
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { payment_status: paymentStatus },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    return await this.getOrderById(order._id);
  }

  /**
   * Cancel order
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated order object
   */
  async cancelOrder(orderId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Get order
      const order = await Order.findOne({
        _id: orderId,
        user_id: userId
      }).session(session);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Check if order can be cancelled
      if (!['pending', 'processing'].includes(order.status)) {
        throw new Error('Order cannot be cancelled');
      }
      
      // Update order status
      order.status = 'cancelled';
      await order.save({ session });
      
      // Get order items
      const orderItems = await OrderItem.find({ order_id: order._id }).session(session);
      
      // Restore product quantities
      const productUpdatePromises = orderItems.map(item => {
        return Product.findByIdAndUpdate(
          item.product_id,
          { $inc: { quantity: item.quantity } },
          { session }
        );
      });
      
      await Promise.all(productUpdatePromises);
      
      await session.commitTransaction();
      session.endSession();
      
      return await this.getOrderById(order._id);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get orders for seller
   * @param {string} sellerId - Seller ID
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Orders and pagination info
   */
  async getSellerOrders(sellerId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Find order items that contain products from this seller
    const sellerProducts = await Product.find({ seller_id: sellerId }, '_id');
    const sellerProductIds = sellerProducts.map(product => product._id);
    
    // Find order items with these products
    const orderItems = await OrderItem.find({
      product_id: { $in: sellerProductIds }
    }).distinct('order_id');
    
    // Find orders
    const filter = { _id: { $in: orderItems } };
    
    // Add status filter if provided
    if (query.status) {
      filter.status = query.status;
    }
    
    const orders = await Order.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments(filter);
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const items = await OrderItem.find({
        order_id: order._id,
        product_id: { $in: sellerProductIds }
      }).populate('product_id');
      
      return {
        ...order.toObject(),
        items
      };
    }));
    
    return {
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get all orders (admin only)
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Orders and pagination info
   */
  async getAllOrders(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Add status filter if provided
    if (query.status) {
      filter.status = query.status;
    }
    
    // Add user filter if provided
    if (query.userId) {
      filter.user_id = query.userId;
    }
    
    // Add date range filter if provided
    if (query.startDate || query.endDate) {
      filter.created_at = {};
      if (query.startDate) {
        filter.created_at.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.created_at.$lte = new Date(query.endDate);
      }
    }
    
    const orders = await Order.find(filter)
      .populate('user_id', 'first_name last_name email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments(filter);
    
    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Generate order number
   * @returns {string} - Order number
   */
  generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Check if order belongs to user
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if order belongs to user
   */
  async isOrderOwnedByUser(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, user_id: userId });
    return !!order;
  }
}

module.exports = new OrderService();