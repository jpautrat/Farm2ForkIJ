const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const productController = require('../controllers/product.controller');
const { authMiddleware, sellerMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination
 * @permission  Public
 */
router.get('/', productController.getProducts);

/**
 * @route   GET /api/products/search
 * @desc    Search products
 * @permission  Public
 */
router.get('/search', productController.searchProducts);

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @permission  Public
 */
router.get('/featured', productController.getFeaturedProducts);

/**
 * @route   GET /api/products/category/:id
 * @desc    Get products by category
 * @permission  Public
 */
router.get('/category/:id', productController.getProductsByCategory);

/**
 * @route   GET /api/products/seller/:id
 * @desc    Get products by seller
 * @permission  Public
 */
router.get('/seller/:id', productController.getProductsBySeller);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @permission  Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a product
 * @permission  Seller
 */
router.post(
  '/',
  [
    authMiddleware,
    sellerMiddleware,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('price', 'Price is required and must be a number').isNumeric(),
      check('category', 'Category is required').not().isEmpty(),
      check('quantity', 'Quantity is required and must be a number').isNumeric(),
      check('unit', 'Unit is required').not().isEmpty()
    ]
  ],
  productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @permission  Seller/Admin
 */
router.put(
  '/:id',
  [
    authMiddleware,
    [
      check('name', 'Name is required').optional().not().isEmpty(),
      check('description', 'Description is required').optional().not().isEmpty(),
      check('price', 'Price must be a number').optional().isNumeric(),
      check('category', 'Category is required').optional().not().isEmpty(),
      check('quantity', 'Quantity must be a number').optional().isNumeric(),
      check('unit', 'Unit is required').optional().not().isEmpty(),
      check('status', 'Status is required').optional().isIn(['active', 'inactive', 'out_of_stock'])
    ]
  ],
  productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @permission  Seller/Admin
 */
router.delete('/:id', authMiddleware, productController.deleteProduct);

/**
 * @route   POST /api/products/:id/reviews
 * @desc    Create a product review
 * @permission  Private
 */
router.post(
  '/:id/reviews',
  [
    authMiddleware,
    [
      check('rating', 'Rating is required and must be between 1 and 5').isInt({ min: 1, max: 5 }),
      check('review', 'Review text is required').not().isEmpty()
    ]
  ],
  productController.createProductReview
);

/**
 * @route   GET /api/products/:id/reviews
 * @desc    Get product reviews
 * @permission  Public
 */
router.get('/:id/reviews', productController.getProductReviews);

/**
 * @route   POST /api/products/upload
 * @desc    Upload product image
 * @permission  Seller
 */
router.post('/upload', [authMiddleware, sellerMiddleware], productController.uploadProductImage);

module.exports = router;