/**
 * Admin service
 * Handles admin-related business logic
 */
const User = require('../models/user.model');
const Order = require('../models/order.model');
const OrderItem = require('../models/order-item.model');
const Product = require('../models/product.model');
const Review = require('../models/review.model');
const mongoose = require('mongoose');

class AdminService {
  /**
   * Get dashboard statistics for admin
   * @returns {Promise<Object>} - Dashboard statistics
   */
  async getDashboardStats() {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const buyerCount = await User.countDocuments({ role: 'buyer' });
    const sellerCount = await User.countDocuments({ role: 'seller' });

    // Get product statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const outOfStockProducts = await Product.countDocuments({ quantity: { $lte: 0 } });

    // Get order statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Get payment statistics
    const totalPayments = await Order.countDocuments({ payment_status: { $in: ['paid', 'refunded'] } });
    const successfulPayments = await Order.countDocuments({ payment_status: 'paid' });
    const failedPayments = await Order.countDocuments({ payment_status: 'failed' });

    // Get review statistics
    const totalReviews = await Review.countDocuments();
    const pendingReviews = await Review.countDocuments({ status: 'pending' });

    // Get revenue statistics
    const revenueAggregation = await Order.aggregate([
      { $match: { payment_status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;
    const paidOrders = await Order.countDocuments({ payment_status: 'paid' });

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ created_at: -1 })
      .limit(5)
      .populate('user_id', 'first_name last_name');

    // Get recent users
    const recentUsers = await User.find()
      .sort({ created_at: -1 })
      .limit(5)
      .select('first_name last_name email role created_at');

    return {
      users: {
        total: totalUsers,
        buyers: buyerCount,
        sellers: sellerCount
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        outOfStock: outOfStockProducts
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      },
      payments: {
        total: totalPayments,
        successful: successfulPayments,
        failed: failedPayments
      },
      reviews: {
        total: totalReviews,
        pending: pendingReviews
      },
      revenue: {
        total: totalRevenue,
        paidOrders
      },
      recent: {
        orders: recentOrders,
        users: recentUsers
      }
    };
  }

  /**
   * Get all users with pagination and filtering
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Users and pagination info
   */
  async getAllUsers(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Add role filter if provided
    if (query.role) {
      filter.role = query.role;
    }
    
    // Add search filter if provided
    if (query.search) {
      filter.$or = [
        { first_name: { $regex: query.search, $options: 'i' } },
        { last_name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User object
   */
  async getUserById(userId) {
    return await User.findById(userId).select('-password');
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated user object
   */
  async updateUser(userId, updateData) {
    const allowedUpdates = {
      first_name: updateData.firstName,
      last_name: updateData.lastName,
      email: updateData.email,
      role: updateData.role,
      is_active: updateData.isActive
    };
    
    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );
    
    const user = await User.findByIdAndUpdate(
      userId,
      allowedUpdates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return true;
  }

  /**
   * Get all orders with pagination and filtering
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
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Order object with items
   */
  async getOrderById(orderId) {
    const order = await Order.findById(orderId)
      .populate('user_id', 'first_name last_name email')
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
   * Get all products with pagination and filtering
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Products and pagination info
   */
  async getAllProducts(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Add status filter if provided
    if (query.status) {
      filter.status = query.status;
    }
    
    // Add seller filter if provided
    if (query.sellerId) {
      filter.seller_id = query.sellerId;
    }
    
    // Add category filter if provided
    if (query.categoryId) {
      filter.category_id = query.categoryId;
    }
    
    // Add search filter if provided
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(filter)
      .populate('seller_id', 'first_name last_name farm_name')
      .populate('category_id', 'name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(filter);
    
    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update product status
   * @param {string} productId - Product ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated product object
   */
  async updateProductStatus(productId, status) {
    // Validate status
    if (!['active', 'inactive', 'out_of_stock'].includes(status)) {
      throw new Error('Invalid status');
    }
    
    const product = await Product.findByIdAndUpdate(
      productId,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  }

  /**
   * Get all reviews with pagination and filtering
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Reviews and pagination info
   */
  async getAllReviews(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Add status filter if provided
    if (query.status) {
      filter.status = query.status;
    }
    
    // Add product filter if provided
    if (query.productId) {
      filter.product_id = query.productId;
    }
    
    // Add user filter if provided
    if (query.userId) {
      filter.user_id = query.userId;
    }
    
    const reviews = await Review.find(filter)
      .populate('user_id', 'first_name last_name')
      .populate('product_id', 'name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Review.countDocuments(filter);
    
    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update review status
   * @param {string} reviewId - Review ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated review object
   */
  async updateReviewStatus(reviewId, status) {
    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new Error('Invalid status');
    }
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!review) {
      throw new Error('Review not found');
    }
    
    return review;
  }
}

module.exports = new AdminService();