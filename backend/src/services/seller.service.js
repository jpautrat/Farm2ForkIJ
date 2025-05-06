/**
 * Seller service
 * Handles seller-related business logic
 */
const { 
  User, 
  SellerProfile, 
  Product, 
  Order, 
  OrderItem, 
  Shipment, 
  Review 
} = require('../models');
const mongoose = require('mongoose');

class SellerService {
  /**
   * Get seller dashboard statistics
   * @param {string} sellerId - Seller ID
   * @returns {Promise<Object>} - Dashboard statistics
   */
  async getDashboardStats(sellerId) {
    // Get total products count
    const productsCount = await Product.countDocuments({ seller_id: sellerId });
    
    // Get products out of stock count
    const outOfStockCount = await Product.countDocuments({ 
      seller_id: sellerId,
      status: 'out_of_stock'
    });
    
    // Get orders statistics
    const orderItems = await OrderItem.find()
      .populate({
        path: 'product_id',
        match: { seller_id: mongoose.Types.ObjectId(sellerId) },
        select: '_id'
      })
      .populate({
        path: 'order_id',
        select: 'status payment_status total_amount created_at'
      });
    
    // Filter out items where product_id is null (not belonging to this seller)
    const sellerOrderItems = orderItems.filter(item => item.product_id);
    
    // Get unique orders
    const orderIds = [...new Set(sellerOrderItems.map(item => item.order_id._id.toString()))];
    
    // Calculate order statistics
    const pendingOrders = sellerOrderItems.filter(item => 
      item.order_id.status === 'pending' || item.order_id.status === 'processing'
    ).length;
    
    const shippedOrders = sellerOrderItems.filter(item => 
      item.order_id.status === 'shipped'
    ).length;
    
    const deliveredOrders = sellerOrderItems.filter(item => 
      item.order_id.status === 'delivered'
    ).length;
    
    // Calculate total revenue
    const totalRevenue = sellerOrderItems.reduce((sum, item) => {
      if (item.order_id.payment_status === 'paid') {
        return sum + item.total;
      }
      return sum;
    }, 0);
    
    // Get recent orders (last 5)
    const recentOrderItems = sellerOrderItems
      .sort((a, b) => new Date(b.order_id.created_at) - new Date(a.order_id.created_at))
      .slice(0, 5);
    
    // Get reviews count and average rating
    const reviews = await Review.find()
      .populate({
        path: 'product_id',
        match: { seller_id: mongoose.Types.ObjectId(sellerId) },
        select: '_id'
      });
    
    const sellerReviews = reviews.filter(review => review.product_id);
    const reviewsCount = sellerReviews.length;
    const averageRating = reviewsCount > 0 
      ? sellerReviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount 
      : 0;
    
    return {
      products: {
        total: productsCount,
        outOfStock: outOfStockCount
      },
      orders: {
        total: orderIds.length,
        pending: pendingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        recent: recentOrderItems
      },
      revenue: {
        total: totalRevenue
      },
      reviews: {
        count: reviewsCount,
        averageRating: averageRating
      }
    };
  }

  /**
   * Get seller products
   * @param {string} sellerId - Seller ID
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Products and pagination info
   */
  async getSellerProducts(sellerId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const filter = { seller_id: sellerId };
    
    // Add filters if provided
    if (query.status) {
      filter.status = query.status;
    }
    
    if (query.category) {
      filter.category_id = query.category;
    }
    
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(filter)
      .populate('category_id', 'name')
      .populate('images')
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
   * Get seller orders
   * @param {string} sellerId - Seller ID
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Orders and pagination info
   */
  async getSellerOrders(sellerId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // First, find all products by this seller
    const sellerProducts = await Product.find({ seller_id: sellerId }, '_id');
    const productIds = sellerProducts.map(product => product._id);
    
    // Find order items containing these products
    const orderItems = await OrderItem.find({ product_id: { $in: productIds } }, 'order_id');
    const orderIds = [...new Set(orderItems.map(item => item.order_id))];
    
    // Build filter for orders
    const filter = { _id: { $in: orderIds } };
    
    if (query.status) {
      filter.status = query.status;
    }
    
    if (query.payment_status) {
      filter.payment_status = query.payment_status;
    }
    
    // Date range filter
    if (query.start_date && query.end_date) {
      filter.created_at = {
        $gte: new Date(query.start_date),
        $lte: new Date(query.end_date)
      };
    } else if (query.start_date) {
      filter.created_at = { $gte: new Date(query.start_date) };
    } else if (query.end_date) {
      filter.created_at = { $lte: new Date(query.end_date) };
    }
    
    // Find orders with pagination
    const orders = await Order.find(filter)
      .populate('user_id', 'first_name last_name email')
      .populate('shipping_address_id')
      .populate('billing_address_id')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    // For each order, get only the items that belong to this seller
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const items = await OrderItem.find({
        order_id: order._id,
        product_id: { $in: productIds }
      }).populate('product_id', 'name price images');
      
      return {
        ...order.toObject(),
        items
      };
    }));
    
    const total = await Order.countDocuments(filter);
    
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
   * Get seller order by ID
   * @param {string} sellerId - Seller ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Order details
   */
  async getSellerOrderById(sellerId, orderId) {
    // First, find all products by this seller
    const sellerProducts = await Product.find({ seller_id: sellerId }, '_id');
    const productIds = sellerProducts.map(product => product._id);
    
    // Find order items for this order that contain seller's products
    const orderItems = await OrderItem.find({
      order_id: orderId,
      product_id: { $in: productIds }
    });
    
    // If no items found, seller doesn't have access to this order
    if (orderItems.length === 0) {
      return null;
    }
    
    // Get the order with populated fields
    const order = await Order.findById(orderId)
      .populate('user_id', 'first_name last_name email')
      .populate('shipping_address_id')
      .populate('billing_address_id')
      .populate('payment')
      .populate('shipment');
    
    if (!order) {
      return null;
    }
    
    // Get only the items that belong to this seller
    const items = await OrderItem.find({
      order_id: orderId,
      product_id: { $in: productIds }
    }).populate('product_id', 'name price images');
    
    return {
      ...order.toObject(),
      items
    };
  }

  /**
   * Update order status (Seller only)
   * @param {string} sellerId - Seller ID
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated order
   */
  async updateOrderStatus(sellerId, orderId, status) {
    // Validate status
    if (!['processing', 'shipped', 'delivered'].includes(status)) {
      throw new Error('Invalid status. Must be processing, shipped, or delivered');
    }
    
    // Check if seller has items in this order
    const sellerProducts = await Product.find({ seller_id: sellerId }, '_id');
    const productIds = sellerProducts.map(product => product._id);
    
    const orderItems = await OrderItem.find({
      order_id: orderId,
      product_id: { $in: productIds }
    });
    
    if (orderItems.length === 0) {
      throw new Error('Order not found or not authorized');
    }
    
    // Update order status
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );
    
    return order;
  }

  /**
   * Get seller reviews
   * @param {string} sellerId - Seller ID
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Reviews and pagination info
   */
  async getSellerReviews(sellerId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // First, find all products by this seller
    const sellerProducts = await Product.find({ seller_id: sellerId }, '_id');
    const productIds = sellerProducts.map(product => product._id);
    
    // Build filter for reviews
    const filter = { product_id: { $in: productIds } };
    
    if (query.status) {
      filter.status = query.status;
    }
    
    if (query.rating) {
      filter.rating = parseInt(query.rating, 10);
    }
    
    // Find reviews with pagination
    const reviews = await Review.find(filter)
      .populate('product_id', 'name images')
      .populate('user_id', 'first_name last_name')
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
   * Get seller shipments
   * @param {string} sellerId - Seller ID
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Shipments and pagination info
   */
  async getSellerShipments(sellerId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // First, find all products by this seller
    const sellerProducts = await Product.find({ seller_id: sellerId }, '_id');
    const productIds = sellerProducts.map(product => product._id);
    
    // Find order items containing these products
    const orderItems = await OrderItem.find({ product_id: { $in: productIds } }, 'order_id');
    const orderIds = [...new Set(orderItems.map(item => item.order_id))];
    
    // Build filter for shipments
    const filter = { order_id: { $in: orderIds } };
    
    if (query.status) {
      filter.status = query.status;
    }
    
    // Find shipments with pagination
    const shipments = await Shipment.find(filter)
      .populate({
        path: 'order_id',
        populate: {
          path: 'user_id',
          select: 'first_name last_name email'
        }
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Shipment.countDocuments(filter);
    
    return {
      shipments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Create shipment for order (Seller only)
   * @param {string} sellerId - Seller ID
   * @param {string} orderId - Order ID
   * @param {Object} shipmentData - Shipment data
   * @returns {Promise<Object>} - Created shipment
   */
  async createShipment(sellerId, orderId, shipmentData) {
    // Check if seller has items in this order
    const sellerProducts = await Product.find({ seller_id: sellerId }, '_id');
    const productIds = sellerProducts.map(product => product._id);
    
    const orderItems = await OrderItem.find({
      order_id: orderId,
      product_id: { $in: productIds }
    });
    
    if (orderItems.length === 0) {
      throw new Error('Order not found or not authorized');
    }
    
    // Check if shipment already exists
    const existingShipment = await Shipment.findOne({ order_id: orderId });
    if (existingShipment) {
      throw new Error('Shipment already exists for this order');
    }
    
    // Create shipment
    const shipment = new Shipment({
      order_id: orderId,
      tracking_number: shipmentData.tracking_number,
      carrier: shipmentData.carrier,
      status: 'shipped',
      estimated_delivery: shipmentData.estimated_delivery
    });
    
    await shipment.save();
    
    // Update order status to shipped
    await Order.findByIdAndUpdate(
      orderId,
      { status: 'shipped' },
      { runValidators: true }
    );
    
    return shipment;
  }

  /**
   * Get seller profile
   * @param {string} sellerId - Seller ID
   * @returns {Promise<Object>} - Seller profile
   */
  async getSellerProfile(sellerId) {
    const sellerProfile = await SellerProfile.findOne({ user_id: sellerId });
    
    if (!sellerProfile) {
      return null;
    }
    
    const user = await User.findById(sellerId, 'first_name last_name email phone_number');
    
    return {
      ...sellerProfile.toObject(),
      user
    };
  }

  /**
   * Update seller profile
   * @param {string} sellerId - Seller ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} - Updated seller profile
   */
  async updateSellerProfile(sellerId, profileData) {
    // Find seller profile
    let sellerProfile = await SellerProfile.findOne({ user_id: sellerId });
    
    if (!sellerProfile) {
      throw new Error('Seller profile not found');
    }
    
    // Update allowed fields
    const allowedUpdates = {
      farm_name: profileData.farmName,
      farm_description: profileData.farmDescription,
      farm_size: profileData.farmSize,
      farming_practices: profileData.farmingPractices
    };
    
    // Update farm location if provided
    if (profileData.farmLocation) {
      allowedUpdates.farm_location = {
        address: profileData.farmLocation.address,
        city: profileData.farmLocation.city,
        state: profileData.farmLocation.state,
        postal_code: profileData.farmLocation.postalCode,
        country: profileData.farmLocation.country,
        coordinates: profileData.farmLocation.coordinates
      };
    }
    
    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );
    
    // Update profile
    sellerProfile = await SellerProfile.findOneAndUpdate(
      { user_id: sellerId },
      allowedUpdates,
      { new: true, runValidators: true }
    );
    
    // Update user info if provided
    if (profileData.firstName || profileData.lastName || profileData.phoneNumber) {
      const userUpdates = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone_number: profileData.phoneNumber
      };
      
      // Remove undefined values
      Object.keys(userUpdates).forEach(key => 
        userUpdates[key] === undefined && delete userUpdates[key]
      );
      
      await User.findByIdAndUpdate(
        sellerId,
        userUpdates,
        { runValidators: true }
      );
    }
    
    // Get updated profile with user info
    const updatedProfile = await this.getSellerProfile(sellerId);
    
    return updatedProfile;
  }

  /**
   * Get top selling products
   * @param {string} sellerId - Seller ID
   * @param {number} limit - Number of products to return
   * @returns {Promise<Array>} - Top selling products
   */
  async getTopSellingProducts(sellerId, limit = 5) {
    // Find all products by this seller
    const sellerProducts = await Product.find({ seller_id: sellerId }, '_id');
    const productIds = sellerProducts.map(product => product._id);
    
    // Aggregate order items to find top selling products
    const topProducts = await OrderItem.aggregate([
      { $match: { product_id: { $in: productIds } } },
      { $group: { 
        _id: '$product_id', 
        totalSold: { $sum: '$quantity' },
        totalRevenue: { $sum: '$total' }
      }},
      { $sort: { totalSold: -1 } },
      { $limit: limit }
    ]);
    
    // Get product details
    const products = await Promise.all(topProducts.map(async (item) => {
      const product = await Product.findById(item._id)
        .populate('images')
        .populate('category_id', 'name');
      
      return {
        ...product.toObject(),
        totalSold: item.totalSold,
        totalRevenue: item.totalRevenue
      };
    }));
    
    return products;
  }

  /**
   * Get sales statistics
   * @param {string} sellerId - Seller ID
   * @param {string} period - Period (day, week, month, year)
   * @returns {Promise<Object>} - Sales statistics
   */
  async getSalesStats(sellerId, period = 'month') {
    // Find all products by this seller
    const sellerProducts = await Product.find({ seller_id: sellerId }, '_id');
    const productIds = sellerProducts.map(product => product._id);
    
    // Determine date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    // Find order items in the date range
    const orderItems = await OrderItem.find({
      product_id: { $in: productIds }
    }).populate({
      path: 'order_id',
      match: { 
        created_at: { $gte: startDate },
        payment_status: 'paid'
      },
      select: 'created_at'
    });
    
    // Filter out items where order_id is null (not in date range or not paid)
    const validOrderItems = orderItems.filter(item => item.order_id);
    
    // Group by date for the chart data
    const salesByDate = {};
    
    validOrderItems.forEach(item => {
      const date = new Date(item.order_id.created_at);
      let dateKey;
      
      switch (period) {
        case 'day':
          dateKey = `${date.getHours()}:00`;
          break;
        case 'week':
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          dateKey = days[date.getDay()];
          break;
        case 'month':
          dateKey = date.getDate().toString();
          break;
        case 'year':
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          dateKey = months[date.getMonth()];
          break;
        default:
          dateKey = date.getDate().toString();
      }
      
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = {
          sales: 0,
          orders: new Set()
        };
      }
      
      salesByDate[dateKey].sales += item.total;
      salesByDate[dateKey].orders.add(item.order_id._id.toString());
    });
    
    // Convert to array for chart data
    const chartData = Object.keys(salesByDate).map(date => ({
      date,
      sales: salesByDate[date].sales,
      orders: salesByDate[date].orders.size
    }));
    
    // Sort chart data by date
    chartData.sort((a, b) => {
      if (period === 'week') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days.indexOf(a.date) - days.indexOf(b.date);
      }
      return a.date.localeCompare(b.date);
    });
    
    // Calculate totals
    const totalSales = validOrderItems.reduce((sum, item) => sum + item.total, 0);
    const totalOrders = new Set(validOrderItems.map(item => item.order_id._id.toString())).size;
    const totalItems = validOrderItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      period,
      totalSales,
      totalOrders,
      totalItems,
      chartData
    };
  }
}

module.exports = new SellerService();