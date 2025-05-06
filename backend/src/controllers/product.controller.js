/**
 * Product controller
 * Handles HTTP requests for product-related operations
 */
const productService = require('../services/product.service');
const { asyncHandler } = require('../middleware/error.middleware');
const { validationResult } = require('express-validator');

/**
 * Get all products (Public access)
 * @route GET /api/products
 */
exports.getAllProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  res.json(result);
});

/**
 * Get product by ID (Public access)
 * @route GET /api/products/:id
 */
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
});

/**
 * Create a new product (Seller only)
 * @route POST /api/products
 */
exports.createProduct = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Check if user is a seller
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Only sellers can create products' });
  }

  const product = await productService.createProduct(req.user._id, req.body);
  res.status(201).json(product);
});

/**
 * Update a product (Seller or Admin)
 * @route PUT /api/products/:id
 */
exports.updateProduct = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const productId = req.params.id;

  // Check if product exists
  const product = await productService.getProductById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Check if user is authorized to update the product
  if (req.user.role !== 'admin') {
    const isOwner = await productService.isProductOwnedBySeller(productId, req.user._id);
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }
  }

  const updatedProduct = await productService.updateProduct(productId, req.body);
  res.json(updatedProduct);
});

/**
 * Delete a product (Seller or Admin)
 * @route DELETE /api/products/:id
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  // Check if product exists
  const product = await productService.getProductById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Check if user is authorized to delete the product
  if (req.user.role !== 'admin') {
    const isOwner = await productService.isProductOwnedBySeller(productId, req.user._id);
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
  }

  await productService.deleteProduct(productId);
  res.json({ message: 'Product deleted successfully' });
});

/**
 * Get featured products (Public access)
 * @route GET /api/products/featured
 */
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 8;
  const products = await productService.getFeaturedProducts(limit);
  res.json(products);
});

/**
 * Get products by category (Public access)
 * @route GET /api/products/category/:id
 */
exports.getProductsByCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const result = await productService.getProductsByCategory(categoryId, req.query);
  res.json(result);
});

/**
 * Get products by seller (Public access)
 * @route GET /api/products/seller/:id
 */
exports.getProductsBySeller = asyncHandler(async (req, res) => {
  const sellerId = req.params.id;
  const result = await productService.getProductsBySeller(sellerId, req.query);
  res.json(result);
});

/**
 * Search products (Public access)
 * @route GET /api/products/search
 */
exports.searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Search term is required' });
  }

  const result = await productService.searchProducts(q, req.query);
  res.json(result);
});

/**
 * Upload product image (Seller only)
 * @route POST /api/products/upload
 */
exports.uploadProductImage = asyncHandler(async (req, res) => {
  // Import the S3 utility
  const { uploadToS3, getS3FileUrl, isS3Configured } = require('../utils/s3');

  // Set up the upload middleware
  const upload = uploadToS3.single('image');

  // Handle the upload
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      let imageUrl;

      if (isS3Configured() && req.file.location) {
        // If S3 is configured and the file was uploaded to S3, use the S3 URL
        imageUrl = req.file.location;
      } else {
        // If S3 is not configured or the file was uploaded locally, use the local URL
        imageUrl = getS3FileUrl(req.file.filename);
      }

      res.json({
        success: true,
        imageUrl,
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      res.status(500).json({ message: `Error uploading image: ${error.message}` });
    }
  });
});
