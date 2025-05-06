const User = require('../models/user.model');

/**
 * User service
 * Handles user-related business logic
 */
class UserService {
  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User object
   */
  async getUserById(userId) {
    return await User.findById(userId);
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} - User object
   */
  async getUserByEmail(email) {
    return await User.findOne({ email });
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated user object
   */
  async updateUserProfile(userId, updateData) {
    // Only allow certain fields to be updated
    const allowedUpdates = {
      first_name: updateData.firstName,
      last_name: updateData.lastName,
      phone_number: updateData.phoneNumber
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    return await User.findByIdAndUpdate(
      userId,
      allowedUpdates,
      { new: true, runValidators: true }
    );
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - Success status
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();
    
    return true;
  }

  /**
   * Get all users (admin only)
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Users and pagination info
   */
  async getAllUsers(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Add filters if provided
    if (query.role) {
      filter.role = query.role;
    }
    
    if (query.status) {
      filter.status = query.status;
    }
    
    if (query.search) {
      filter.$or = [
        { first_name: { $regex: query.search, $options: 'i' } },
        { last_name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Change user status (admin only)
   * @param {string} userId - User ID
   * @param {string} status - New status (active, inactive, suspended)
   * @returns {Promise<Object>} - Updated user object
   */
  async changeUserStatus(userId, status) {
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      throw new Error('Invalid status');
    }
    
    return await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true }
    );
  }
}

module.exports = new UserService();