const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/payments/create-payment-intent
 * @desc    Create a payment intent with Stripe
 * @permission  Private
 */
router.post(
  '/create-payment-intent',
  [
    authMiddleware,
    [
      check('orderId', 'Order ID is required').not().isEmpty(),
      check('amount', 'Amount is required').isNumeric()
    ]
  ],
  paymentController.createPaymentIntent
);

/**
 * @route   POST /api/payments/confirm-payment
 * @desc    Confirm a payment
 * @permission  Private
 */
router.post(
  '/confirm-payment',
  [
    authMiddleware,
    [
      check('paymentIntentId', 'Payment intent ID is required').not().isEmpty(),
      check('orderId', 'Order ID is required').not().isEmpty()
    ]
  ],
  paymentController.confirmPayment
);

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhook events
 * @permission  Public
 */
router.post('/webhook', paymentController.handleWebhook);

/**
 * @route   GET /api/payments/methods
 * @desc    Get user's saved payment methods
 * @permission  Private
 */
router.get('/methods', authMiddleware, paymentController.getPaymentMethods);

/**
 * @route   POST /api/payments/methods
 * @desc    Save a payment method
 * @permission  Private
 */
router.post(
  '/methods',
  [
    authMiddleware,
    [
      check('paymentMethodId', 'Payment method ID is required').not().isEmpty(),
      check('isDefault', 'isDefault must be a boolean').optional().isBoolean()
    ]
  ],
  paymentController.savePaymentMethod
);

/**
 * @route   DELETE /api/payments/methods/:id
 * @desc    Delete a payment method
 * @permission  Private
 */
router.delete('/methods/:id', authMiddleware, paymentController.deletePaymentMethod);

/**
 * @route   PUT /api/payments/methods/:id/default
 * @desc    Set a payment method as default
 * @permission  Private
 */
router.put('/methods/:id/default', authMiddleware, paymentController.setDefaultPaymentMethod);

/**
 * @route   GET /api/payments/transactions
 * @desc    Get payment transactions for a user
 * @permission  Private
 */
router.get('/transactions', authMiddleware, paymentController.getUserTransactions);

/**
 * @route   GET /api/payments/transactions/:id
 * @desc    Get payment transaction details
 * @permission  Private
 */
router.get('/transactions/:id', authMiddleware, paymentController.getTransactionById);

/**
 * @route   GET /api/payments/admin/transactions
 * @desc    Get all payment transactions (admin)
 * @permission  Admin
 */
router.get('/admin/transactions', [authMiddleware, adminMiddleware], paymentController.getAllTransactions);

module.exports = router;