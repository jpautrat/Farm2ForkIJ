const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const reviewController = require('../controllers/review.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get all reviews for a product
 * @permission  Public
 */
router.get('/product/:productId', reviewController.getProductReviews);

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @permission  Private
 */
router.post(
  '/',
  [
    authMiddleware,
    [
      check('productId', 'Product ID is required').not().isEmpty(),
      check('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
      check('comment', 'Comment is required').not().isEmpty()
    ]
  ],
  reviewController.createReview
);

/**
 * @route   GET /api/reviews/:id
 * @desc    Get a review by ID
 * @permission  Public
 */
router.get('/:id', reviewController.getReviewById);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review
 * @permission  Private
 */
router.put(
  '/:id',
  [
    authMiddleware,
    [
      check('rating', 'Rating must be between 1 and 5').optional().isInt({ min: 1, max: 5 }),
      check('comment', 'Comment is required').optional().not().isEmpty()
    ]
  ],
  reviewController.updateReview
);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @permission  Private
 */
router.delete('/:id', authMiddleware, reviewController.deleteReview);

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get all reviews by a user
 * @permission  Private
 */
router.get('/user/:userId', authMiddleware, reviewController.getUserReviews);

/**
 * @route   GET /api/reviews/seller/:sellerId
 * @desc    Get all reviews for a seller's products
 * @permission  Public
 */
router.get('/seller/:sellerId', reviewController.getSellerProductReviews);

/**
 * @route   PUT /api/reviews/:id/helpful
 * @desc    Mark a review as helpful
 * @permission  Private
 */
router.put('/:id/helpful', authMiddleware, reviewController.markReviewHelpful);

/**
 * @route   PUT /api/reviews/:id/report
 * @desc    Report a review
 * @permission  Private
 */
router.put(
  '/:id/report',
  [
    authMiddleware,
    [
      check('reason', 'Reason is required').not().isEmpty()
    ]
  ],
  reviewController.reportReview
);

/**
 * @route   GET /api/reviews/admin/reported
 * @desc    Get all reported reviews
 * @permission  Admin
 */
router.get('/admin/reported', [authMiddleware, adminMiddleware], reviewController.getReportedReviews);

/**
 * @route   PUT /api/reviews/admin/:id/approve
 * @desc    Approve a reported review
 * @permission  Admin
 */
router.put('/admin/:id/approve', [authMiddleware, adminMiddleware], reviewController.approveReview);

/**
 * @route   PUT /api/reviews/admin/:id/reject
 * @desc    Reject a reported review
 * @permission  Admin
 */
router.put('/admin/:id/reject', [authMiddleware, adminMiddleware], reviewController.rejectReview);

module.exports = router;