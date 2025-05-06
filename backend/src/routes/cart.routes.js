const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const cartController = require('../controllers/cart.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @permission  Private
 */
router.get('/', authMiddleware, cartController.getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @permission  Private
 */
router.post(
  '/items',
  [
    authMiddleware,
    [
      check('productId', 'Product ID is required').not().isEmpty(),
      check('quantity', 'Quantity is required and must be a number').isNumeric()
    ]
  ],
  cartController.addCartItem
);

/**
 * @route   PUT /api/cart/items/:id
 * @desc    Update cart item quantity
 * @permission  Private
 */
router.put(
  '/items/:id',
  [
    authMiddleware,
    [
      check('quantity', 'Quantity is required and must be a number').isNumeric()
    ]
  ],
  cartController.updateCartItem
);

/**
 * @route   DELETE /api/cart/items/:id
 * @desc    Remove item from cart
 * @permission  Private
 */
router.delete('/items/:id', authMiddleware, cartController.removeCartItem);

/**
 * @route   DELETE /api/cart/clear
 * @desc    Clear cart
 * @permission  Private
 */
router.delete('/clear', authMiddleware, cartController.clearCart);

/**
 * @route   POST /api/cart/apply-coupon
 * @desc    Apply coupon to cart
 * @permission  Private
 */
router.post(
  '/apply-coupon',
  [
    authMiddleware,
    [
      check('code', 'Coupon code is required').not().isEmpty()
    ]
  ],
  cartController.applyCoupon
);

/**
 * @route   DELETE /api/cart/remove-coupon
 * @desc    Remove coupon from cart
 * @permission  Private
 */
router.delete('/remove-coupon', authMiddleware, cartController.removeCoupon);

/**
 * @route   POST /api/cart/shipping-rates
 * @desc    Get shipping rates for cart
 * @permission  Private
 */
router.post(
  '/shipping-rates',
  [
    authMiddleware,
    [
      check('addressId', 'Shipping address ID is required').not().isEmpty()
    ]
  ],
  cartController.getShippingRates
);

/**
 * @route   POST /api/cart/select-shipping
 * @desc    Select shipping method
 * @permission  Private
 */
router.post(
  '/select-shipping',
  [
    authMiddleware,
    [
      check('rateId', 'Shipping rate ID is required').not().isEmpty()
    ]
  ],
  cartController.selectShippingRate
);

module.exports = router;