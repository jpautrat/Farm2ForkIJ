/**
 * Seller controller
 * Handles HTTP requests for seller-related operations
 */
const sellerService = require('../services/seller.service');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * Get seller dashboard statistics
 * @route GET /api/seller/dashboard
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  // Check if user is seller
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }

  const stats = await sellerService.getDashboardStats(req.user._id);
  res.json(stats);
});

/**
 * Get seller products
 * @route GET /api/seller/products
 */
exports.getSellerProducts = asyncHandler(async (req, res) => {
  // Check if user is seller
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }

  const result = await sellerService.getSellerProducts(req.user._id, req.query);
  res.json(result);
});

/**
 * Get seller orders
 * @route GET /api/seller/orders
 */
exports.getSellerOrders = asyncHandler(async (req, res) => {
  // Check if user is seller
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }

  const result = await sellerService.getSellerOrders(req.user._id, req.query);
  res.json(result);
});

/**
 * Get seller order by ID
 * @route GET /api/seller/orders/:id
 */
exports.getSellerOrderById = asyncHandler(async (req, res) => {
  // Check if user is seller
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }

  const order = await sellerService.getSellerOrderById(req.user._id, req.params.id);
  
  if (!order) {
    return res.status(404).json({ message: 'Order not found or not authorized' });
  }
  
  res.json(order);
});

/**
 * Update order status (Seller only)
 * @route PUT /api/seller/orders/:id/status
 */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  // Check if user is seller
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }

  const orderId = req.params.id;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }
  
  const order = await sellerService.updateOrderStatus(req.user._id, orderId, status);
  res.json(order);
});

/**
 * Get seller reviews
 * @route GET /api/seller/reviews
 */
exports.getSellerReviews = asyncHandler(async (req, res) => {
  // Check if user is seller
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }

  const result = await sellerService.getSellerReviews(req.user._id, req.query);
  res.json(result);
});

/**
 * Get seller shipments
 * @route GET /api/seller/shipments
 */
exports.getSellerShipments = asyncHandler(async (req, res) => {
  // Check if user is seller
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }

  const result = await sellerService.getSellerShipments(req.user._id, req.query);
  res.json(result);
});

/**
 * Create shipment for order (Seller only)
 * @route POST /api/seller/orders/:id/shipment
 */
exports.createShipment = asyncHandler(async (req, res) => {
  // Check if user is seller
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }

  const orderId = req.params.id;
  const shipment = await sellerService.createShipment(req.user._id, orderId, req.body);
  res.status(201).json(shipment);
});

/**
 * Get seller profile
 * @route GET /api/seller/profile
 */
exports.getSellerProfile = asyncHandler(async (req, res) => {
  // Check if user is seller
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }

  const profile = await sellerService.getSellerProfile(req.user._id);
  
  if (!profile) {
    return res.status(404).json({ message: 'Seller profile not found' });
  }
  
  res.json(profile);
});

/**
 * Update seller profile
 * @route PUT /api/seller/profile
 */
exports.updateSellerProfile = asyncHandler(async (req, res) => {
  // Check if user is seller
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }

  const profile = await sellerService.updateSellerProfile(req.user._id, req.body);
  res.json(profile);
});

/**
 * Get top selling products
 * @route GET /api/seller/products/top
 */
exports.getTopSellingProducts = asyncHandler(async (req, res) => {
  // Check if user is seller
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }

  const limit = parseInt(req.query.limit, 10) || 5;
  const products = await sellerService.getTopSellingProducts(req.user._id, limit);
  res.json(products);
});

/**
 * Get sales statistics
 * @route GET /api/seller/stats/sales
 */
exports.getSalesStats = asyncHandler(async (req, res) => {
  // Check if user is seller
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }

  const period = req.query.period || 'month'; // day, week, month, year
  const stats = await sellerService.getSalesStats(req.user._id, period);
  res.json(stats);
});