/**
 * Cart controller
 * Handles HTTP requests for cart-related operations
 */
const cartService = require('../services/cart.service');
const { asyncHandler } = require('../middleware/error.middleware');
const { validationResult } = require('express-validator');

/**
 * Get user's cart (Private access)
 * @route GET /api/cart
 */
exports.getUserCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getUserCart(req.user._id);
  res.json(cart);
});

/**
 * Add item to cart (Private access)
 * @route POST /api/cart/items
 */
exports.addItemToCart = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { productId, quantity } = req.body;
  
  try {
    const cart = await cartService.addItemToCart(req.user._id, {
      productId,
      quantity: parseInt(quantity, 10) || 1
    });
    
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Update cart item (Private access)
 * @route PUT /api/cart/items/:id
 */
exports.updateCartItem = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const itemId = req.params.id;
  const { quantity } = req.body;
  
  try {
    const cart = await cartService.updateCartItem(req.user._id, itemId, {
      quantity: parseInt(quantity, 10)
    });
    
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Remove item from cart (Private access)
 * @route DELETE /api/cart/items/:id
 */
exports.removeCartItem = asyncHandler(async (req, res) => {
  const itemId = req.params.id;
  
  try {
    const cart = await cartService.removeCartItem(req.user._id, itemId);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Clear cart (Private access)
 * @route DELETE /api/cart/clear
 */
exports.clearCart = asyncHandler(async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user._id);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Validate cart items (Private access)
 * @route GET /api/cart/validate
 */
exports.validateCartItems = asyncHandler(async (req, res) => {
  try {
    const validationResult = await cartService.validateCartItems(req.user._id);
    res.json(validationResult);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});