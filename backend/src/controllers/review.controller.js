/**
 * Review controller
 * Handles HTTP requests for review-related operations
 */
const reviewService = require('../services/review.service');
const { asyncHandler } = require('../middleware/error.middleware');
const { validationResult } = require('express-validator');

/**
 * Get reviews for a product (Public access)
 * @route GET /api/reviews/product/:productId
 */
exports.getProductReviews = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  
  // Check if user is admin for filtering by status
  const isAdmin = req.user && req.user.role === 'admin';
  
  const result = await reviewService.getProductReviews(productId, {
    ...req.query,
    isAdmin
  });
  
  res.json(result);
});

/**
 * Get review by ID (Private access)
 * @route GET /api/reviews/:id
 */
exports.getReviewById = asyncHandler(async (req, res) => {
  const reviewId = req.params.id;
  
  const review = await reviewService.getReviewById(reviewId);
  
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }
  
  // Check if user is authorized to view the review
  // Admin can view any review
  // Regular users can only view approved reviews or their own reviews
  if (
    req.user.role !== 'admin' && 
    review.status !== 'approved' && 
    review.user_id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Not authorized to view this review' });
  }
  
  res.json(review);
});

/**
 * Create a new review (Private access)
 * @route POST /api/reviews
 */
exports.createReview = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { productId, rating, reviewText } = req.body;
  
  try {
    const review = await reviewService.createReview(req.user._id, {
      productId,
      rating,
      reviewText,
      isAdmin: req.user.role === 'admin'
    });
    
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Update a review (Private access)
 * @route PUT /api/reviews/:id
 */
exports.updateReview = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const reviewId = req.params.id;
  const { rating, reviewText, status } = req.body;
  
  try {
    const review = await reviewService.updateReview(
      reviewId,
      req.user._id,
      { rating, reviewText, status },
      req.user.role === 'admin'
    );
    
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Delete a review (Private access)
 * @route DELETE /api/reviews/:id
 */
exports.deleteReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.id;
  
  try {
    await reviewService.deleteReview(
      reviewId,
      req.user._id,
      req.user.role === 'admin'
    );
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Update review status (Admin access)
 * @route PUT /api/reviews/:id/status
 */
exports.updateReviewStatus = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const reviewId = req.params.id;
  const { status } = req.body;
  
  try {
    const review = await reviewService.updateReviewStatus(reviewId, status);
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Get all reviews (Admin access)
 * @route GET /api/reviews/admin
 */
exports.getAllReviews = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const result = await reviewService.getAllReviews(req.query);
  res.json(result);
});

/**
 * Get user's reviews (Private access)
 * @route GET /api/reviews/user
 */
exports.getUserReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getUserReviews(req.user._id, req.query);
  res.json(result);
});