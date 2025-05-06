/**
 * Review service
 * Handles review-related business logic
 */
const Review = require('../models/review.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const OrderItem = require('../models/order-item.model');
const mongoose = require('mongoose');

class ReviewService {
  /**
   * Get all reviews for a product
   * @param {string} productId - Product ID
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Reviews and pagination info
   */
  async getProductReviews(productId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const filter = { product_id: productId };
    
    // Add status filter if provided and user is admin
    if (query.status && query.isAdmin) {
      filter.status = query.status;
    } else {
      // Non-admin users can only see approved reviews
      filter.status = 'approved';
    }
    
    // Add rating filter if provided
    if (query.rating) {
      filter.rating = parseInt(query.rating, 10);
    }
    
    const reviews = await Review.find(filter)
      .populate('user_id', 'first_name last_name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Review.countDocuments(filter);
    
    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get review by ID
   * @param {string} reviewId - Review ID
   * @returns {Promise<Object>} - Review object
   */
  async getReviewById(reviewId) {
    return await Review.findById(reviewId)
      .populate('user_id', 'first_name last_name')
      .populate('product_id', 'name');
  }

  /**
   * Create a new review
   * @param {string} userId - User ID
   * @param {Object} reviewData - Review data (productId, rating, reviewText)
   * @returns {Promise<Object>} - Created review object
   */
  async createReview(userId, reviewData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Check if product exists
      const product = await Product.findById(reviewData.productId).session(session);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Check if user has purchased the product
      const hasPurchased = await this.hasUserPurchasedProduct(userId, reviewData.productId);
      
      if (!hasPurchased && !reviewData.isAdmin) {
        throw new Error('You can only review products you have purchased');
      }
      
      // Check if user has already reviewed this product
      const existingReview = await Review.findOne({
        user_id: userId,
        product_id: reviewData.productId
      }).session(session);
      
      if (existingReview) {
        throw new Error('You have already reviewed this product');
      }
      
      // Create review
      const review = new Review({
        product_id: reviewData.productId,
        user_id: userId,
        rating: reviewData.rating,
        review_text: reviewData.reviewText,
        status: reviewData.isAdmin ? 'approved' : 'pending' // Auto-approve admin reviews
      });
      
      await review.save({ session });
      
      // Update product rating
      await this.updateProductRating(reviewData.productId, session);
      
      await session.commitTransaction();
      session.endSession();
      
      return await this.getReviewById(review._id);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Update a review
   * @param {string} reviewId - Review ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update (rating, reviewText)
   * @param {boolean} isAdmin - Whether the user is an admin
   * @returns {Promise<Object>} - Updated review object
   */
  async updateReview(reviewId, userId, updateData, isAdmin = false) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Find review
      const review = await Review.findById(reviewId).session(session);
      
      if (!review) {
        throw new Error('Review not found');
      }
      
      // Check if user is authorized to update the review
      if (!isAdmin && review.user_id.toString() !== userId) {
        throw new Error('Not authorized to update this review');
      }
      
      // Update review fields
      if (updateData.rating !== undefined) {
        review.rating = updateData.rating;
      }
      
      if (updateData.reviewText !== undefined) {
        review.review_text = updateData.reviewText;
      }
      
      // Admin can update status
      if (isAdmin && updateData.status !== undefined) {
        review.status = updateData.status;
      } else if (!isAdmin) {
        // Reset status to pending if user updates their review
        review.status = 'pending';
      }
      
      await review.save({ session });
      
      // Update product rating
      await this.updateProductRating(review.product_id, session);
      
      await session.commitTransaction();
      session.endSession();
      
      return await this.getReviewById(review._id);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Delete a review
   * @param {string} reviewId - Review ID
   * @param {string} userId - User ID
   * @param {boolean} isAdmin - Whether the user is an admin
   * @returns {Promise<boolean>} - Success status
   */
  async deleteReview(reviewId, userId, isAdmin = false) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Find review
      const review = await Review.findById(reviewId).session(session);
      
      if (!review) {
        throw new Error('Review not found');
      }
      
      // Check if user is authorized to delete the review
      if (!isAdmin && review.user_id.toString() !== userId) {
        throw new Error('Not authorized to delete this review');
      }
      
      // Get product ID before deleting review
      const productId = review.product_id;
      
      // Delete review
      await Review.findByIdAndDelete(reviewId, { session });
      
      // Update product rating
      await this.updateProductRating(productId, session);
      
      await session.commitTransaction();
      session.endSession();
      
      return true;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Update review status (admin only)
   * @param {string} reviewId - Review ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated review object
   */
  async updateReviewStatus(reviewId, status) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Validate status
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        throw new Error('Invalid status');
      }
      
      // Find review
      const review = await Review.findById(reviewId).session(session);
      
      if (!review) {
        throw new Error('Review not found');
      }
      
      // Update status
      review.status = status;
      await review.save({ session });
      
      // Update product rating if status changed to/from approved
      await this.updateProductRating(review.product_id, session);
      
      await session.commitTransaction();
      session.endSession();
      
      return await this.getReviewById(review._id);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get all reviews (admin only)
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Reviews and pagination info
   */
  async getAllReviews(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Add status filter if provided
    if (query.status) {
      filter.status = query.status;
    }
    
    // Add product filter if provided
    if (query.productId) {
      filter.product_id = query.productId;
    }
    
    // Add user filter if provided
    if (query.userId) {
      filter.user_id = query.userId;
    }
    
    // Add rating filter if provided
    if (query.rating) {
      filter.rating = parseInt(query.rating, 10);
    }
    
    const reviews = await Review.find(filter)
      .populate('user_id', 'first_name last_name')
      .populate('product_id', 'name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Review.countDocuments(filter);
    
    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get user's reviews
   * @param {string} userId - User ID
   * @param {Object} query - Query parameters (pagination)
   * @returns {Promise<Object>} - Reviews and pagination info
   */
  async getUserReviews(userId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find({ user_id: userId })
      .populate('product_id', 'name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Review.countDocuments({ user_id: userId });
    
    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Check if user has purchased product
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise<boolean>} - True if user has purchased product
   */
  async hasUserPurchasedProduct(userId, productId) {
    // Find completed orders for this user
    const orders = await Order.find({
      user_id: userId,
      status: { $in: ['delivered', 'completed'] }
    });
    
    // Check if any order contains this product
    for (const order of orders) {
      const orderItem = await OrderItem.findOne({
        order_id: order._id,
        product_id: productId
      });
      
      if (orderItem) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Update product rating
   * @param {string} productId - Product ID
   * @param {Object} session - Mongoose session
   * @returns {Promise<void>}
   */
  async updateProductRating(productId, session) {
    // Calculate average rating from approved reviews
    const result = await Review.aggregate([
      { $match: { product_id: mongoose.Types.ObjectId(productId), status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]).session(session);
    
    // Update product with new rating
    const avgRating = result.length > 0 ? result[0].avgRating : 0;
    const reviewCount = result.length > 0 ? result[0].count : 0;
    
    await Product.findByIdAndUpdate(
      productId,
      { 
        rating: avgRating,
        review_count: reviewCount
      },
      { session }
    );
  }
}

module.exports = new ReviewService();