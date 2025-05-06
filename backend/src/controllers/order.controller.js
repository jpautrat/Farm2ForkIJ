/**
 * Order controller
 * Handles HTTP requests for order-related operations
 */
const orderService = require('../services/order.service');
const { asyncHandler } = require('../middleware/error.middleware');
const { validationResult } = require('express-validator');

/**
 * Get user's orders (Private access)
 * @route GET /api/orders
 */
exports.getUserOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getUserOrders(req.user._id, req.query);
  res.json(result);
});

/**
 * Get order by ID (Private access)
 * @route GET /api/orders/:id
 */
exports.getOrderById = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  
  // Check if order exists
  const order = await orderService.getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  // Check if user is authorized to view the order
  if (req.user.role !== 'admin' && order.user_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to view this order' });
  }
  
  res.json(order);
});

/**
 * Create a new order (Private access)
 * @route POST /api/orders
 */
exports.createOrder = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const order = await orderService.createOrder(req.user._id, req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Update order status (Admin or Seller access)
 * @route PUT /api/orders/:id/status
 */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const orderId = req.params.id;
  const { status } = req.body;
  
  // Check if order exists
  const order = await orderService.getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  // Check if user is authorized to update the order
  // Only admin can update any order
  // Sellers can only update orders that contain their products
  if (req.user.role !== 'admin') {
    // Implementation for seller authorization would go here
    // For simplicity, we'll just check if user is admin for now
    return res.status(403).json({ message: 'Not authorized to update this order' });
  }
  
  try {
    const updatedOrder = await orderService.updateOrderStatus(orderId, status);
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Update payment status (Admin access)
 * @route PUT /api/orders/:id/payment
 */
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const orderId = req.params.id;
  const { paymentStatus } = req.body;
  
  // Check if order exists
  const order = await orderService.getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  try {
    const updatedOrder = await orderService.updatePaymentStatus(orderId, paymentStatus);
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Cancel order (Private access)
 * @route PUT /api/orders/:id/cancel
 */
exports.cancelOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  
  try {
    // Check if order belongs to user
    const isOwner = await orderService.isOrderOwnedByUser(orderId, req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }
    
    const updatedOrder = await orderService.cancelOrder(orderId, req.user._id);
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Get seller's orders (Seller access)
 * @route GET /api/orders/seller
 */
exports.getSellerOrders = asyncHandler(async (req, res) => {
  // Check if user is a seller
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }
  
  const result = await orderService.getSellerOrders(req.user._id, req.query);
  res.json(result);
});

/**
 * Get all orders (Admin access)
 * @route GET /api/orders/admin
 */
exports.getAllOrders = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const result = await orderService.getAllOrders(req.query);
  res.json(result);
});