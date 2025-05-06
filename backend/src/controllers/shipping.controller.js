/**
 * Shipping controller
 * Handles HTTP requests for shipping-related operations
 */
const shippingService = require('../services/shipping.service');
const orderService = require('../services/order.service');
const { asyncHandler } = require('../middleware/error.middleware');
const { validationResult } = require('express-validator');

/**
 * Calculate shipping rates (Private access)
 * @route POST /api/shipping/rates
 */
exports.calculateRates = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { originAddressId, destinationAddressId, parcel } = req.body;
  
  try {
    const rates = await shippingService.calculateRates(originAddressId, destinationAddressId, parcel);
    res.json(rates);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Create shipment for order (Seller or Admin access)
 * @route POST /api/shipping/create
 */
exports.createShipment = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { orderId, shippingDetails } = req.body;
  
  try {
    // Check if order exists
    const order = await orderService.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to create shipment for this order
    // Only admin can create shipment for any order
    // Sellers can only create shipments for orders that contain their products
    if (req.user.role !== 'admin') {
      // Implementation for seller authorization would go here
      // For simplicity, we'll just check if user is admin for now
      return res.status(403).json({ message: 'Not authorized to create shipment for this order' });
    }
    
    const shipment = await shippingService.createShipment(orderId, shippingDetails);
    res.status(201).json(shipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Track shipment (Public access)
 * @route GET /api/shipping/track/:trackingNumber
 */
exports.trackShipment = asyncHandler(async (req, res) => {
  const { trackingNumber } = req.params;
  
  try {
    const trackingInfo = await shippingService.trackShipment(trackingNumber);
    res.json(trackingInfo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Get shipment by ID (Private access)
 * @route GET /api/shipping/:id
 */
exports.getShipmentById = asyncHandler(async (req, res) => {
  const shipmentId = req.params.id;
  
  try {
    // Get shipment
    const shipment = await shippingService.getShipmentById(shipmentId);
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Get order
    const order = await orderService.getOrderById(shipment.order_id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to view shipment
    if (req.user.role !== 'admin' && order.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this shipment' });
    }
    
    res.json(shipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Get shipment by order ID (Private access)
 * @route GET /api/shipping/order/:orderId
 */
exports.getShipmentByOrderId = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  
  try {
    // Check if order exists and belongs to user
    const order = await orderService.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to view shipment for this order
    if (req.user.role !== 'admin' && order.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view shipment for this order' });
    }
    
    const shipment = await shippingService.getShipmentByOrderId(orderId);
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found for this order' });
    }
    
    res.json(shipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Update shipment status (Admin or Seller access)
 * @route PUT /api/shipping/:id/status
 */
exports.updateShipmentStatus = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const shipmentId = req.params.id;
  const { status } = req.body;
  
  try {
    // Get shipment
    const shipment = await shippingService.getShipmentById(shipmentId);
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Check if user is authorized to update shipment
    // Only admin can update any shipment
    // Sellers can only update shipments for orders that contain their products
    if (req.user.role !== 'admin') {
      // Implementation for seller authorization would go here
      // For simplicity, we'll just check if user is admin for now
      return res.status(403).json({ message: 'Not authorized to update this shipment' });
    }
    
    const updatedShipment = await shippingService.updateShipmentStatus(shipmentId, status);
    res.json(updatedShipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Get all shipments (Admin access)
 * @route GET /api/shipping/admin
 */
exports.getAllShipments = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  try {
    const result = await shippingService.getAllShipments(req.query);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});