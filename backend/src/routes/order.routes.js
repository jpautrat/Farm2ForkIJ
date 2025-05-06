const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { authMiddleware, sellerMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @permission  Private
 */
router.post(
  '/',
  [
    authMiddleware,
    [
      check('shippingAddress', 'Shipping address is required').not().isEmpty(),
      check('paymentMethod', 'Payment method is required').not().isEmpty(),
      check('itemsPrice', 'Items price is required').isNumeric(),
      check('taxPrice', 'Tax price is required').isNumeric(),
      check('shippingPrice', 'Shipping price is required').isNumeric(),
      check('totalPrice', 'Total price is required').isNumeric()
    ]
  ],
  orderController.createOrder
);

/**
 * @route   GET /api/orders
 * @desc    Get logged in user's orders
 * @permission  Private
 */
router.get('/', authMiddleware, orderController.getUserOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @permission  Private
 */
router.get('/:id', authMiddleware, orderController.getOrderById);

/**
 * @route   PUT /api/orders/:id/pay
 * @desc    Update order to paid
 * @permission  Private
 */
router.put(
  '/:id/pay',
  [
    authMiddleware,
    [
      check('paymentResult', 'Payment result is required').not().isEmpty()
    ]
  ],
  orderController.updateOrderToPaid
);

/**
 * @route   PUT /api/orders/:id/deliver
 * @desc    Update order to delivered
 * @permission  Seller/Admin
 */
router.put(
  '/:id/deliver',
  [authMiddleware, sellerMiddleware],
  orderController.updateOrderToDelivered
);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel an order
 * @permission  Private
 */
router.put('/:id/cancel', authMiddleware, orderController.cancelOrder);

/**
 * @route   GET /api/orders/seller/all
 * @desc    Get all orders for a seller
 * @permission  Seller
 */
router.get('/seller/all', [authMiddleware, sellerMiddleware], orderController.getSellerOrders);

/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (admin)
 * @permission  Admin
 */
router.get('/admin/all', [authMiddleware, adminMiddleware], orderController.getAllOrders);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @permission  Seller/Admin
 */
router.put(
  '/:id/status',
  [
    authMiddleware,
    sellerMiddleware,
    [
      check('status', 'Status is required').isIn([
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
      ])
    ]
  ],
  orderController.updateOrderStatus
);

/**
 * @route   POST /api/orders/:id/refund
 * @desc    Process refund for an order
 * @permission  Admin
 */
router.post(
  '/:id/refund',
  [
    authMiddleware,
    adminMiddleware,
    [
      check('amount', 'Refund amount is required').isNumeric(),
      check('reason', 'Refund reason is required').not().isEmpty()
    ]
  ],
  orderController.processRefund
);

module.exports = router;