/**
 * Payment controller
 * Handles HTTP requests for payment-related operations
 */
const paymentService = require('../services/payment.service');
const orderService = require('../services/order.service');
const { asyncHandler } = require('../middleware/error.middleware');
const { validationResult } = require('express-validator');

/**
 * Create payment intent (Private access)
 * @route POST /api/payments/create-intent
 */
exports.createPaymentIntent = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { orderId } = req.body;

  try {
    // Check if order exists and belongs to user
    const order = await orderService.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to create payment for this order
    if (req.user.role !== 'admin' && order.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create payment for this order' });
    }

    const paymentIntent = await paymentService.createPaymentIntent(orderId);
    res.json(paymentIntent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Confirm payment (Private access)
 * @route POST /api/payments/confirm
 */
exports.confirmPayment = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { paymentId } = req.body;

  try {
    // Get payment
    const payment = await paymentService.getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Get order
    const order = await orderService.getOrderById(payment.order_id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to confirm payment for this order
    if (req.user.role !== 'admin' && order.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to confirm payment for this order' });
    }

    const result = await paymentService.confirmPayment(paymentId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Process payment webhook (Public access - secured by webhook signature)
 * @route POST /api/payments/webhook
 */
exports.processWebhook = asyncHandler(async (req, res) => {
  try {
    // Get the signature from the Stripe-Signature header
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ message: 'Stripe signature is missing' });
    }

    // Get the raw request body for signature verification
    // Note: Express raw body must be available (use body-parser with { type: 'application/json', verify: (req, res, buf) => { req.rawBody = buf } })
    const payload = req.rawBody || req.body;

    // Process the webhook event with signature verification
    const result = await paymentService.processPaymentWebhook(payload, signature);

    res.json(result);
  } catch (error) {
    console.error('Webhook processing error:', error);

    // Return a 200 response to prevent Stripe from retrying
    // This is recommended by Stripe for webhook errors
    res.status(200).json({ 
      received: true,
      error: error.message 
    });
  }
});

/**
 * Get payment by ID (Private access)
 * @route GET /api/payments/:id
 */
exports.getPaymentById = asyncHandler(async (req, res) => {
  const paymentId = req.params.id;

  try {
    // Get payment
    const payment = await paymentService.getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Get order
    const order = await orderService.getOrderById(payment.order_id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view payment
    if (req.user.role !== 'admin' && order.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }

    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Get payment by order ID (Private access)
 * @route GET /api/payments/order/:orderId
 */
exports.getPaymentByOrderId = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;

  try {
    // Check if order exists and belongs to user
    const order = await orderService.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view payment for this order
    if (req.user.role !== 'admin' && order.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view payment for this order' });
    }

    const payment = await paymentService.getPaymentByOrderId(orderId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found for this order' });
    }

    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Refund payment (Admin access)
 * @route POST /api/payments/refund
 */
exports.refundPayment = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { orderId, amount } = req.body;

  try {
    const result = await paymentService.refundPayment(orderId, amount);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
