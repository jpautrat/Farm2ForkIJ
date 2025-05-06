const mongoose = require('mongoose');

/**
 * Notification Schema
 * Stores notifications for users
 */
const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'order_placed', 
      'order_shipped', 
      'order_delivered', 
      'payment_received', 
      'payment_failed',
      'review_approved',
      'product_back_in_stock',
      'price_drop',
      'new_message',
      'system_alert'
    ],
    required: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  is_read: {
    type: Boolean,
    default: false
  },
  related_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'related_type'
  },
  related_type: {
    type: String,
    enum: ['Order', 'Product', 'Payment', 'Review', 'User', null]
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Index for faster queries
notificationSchema.index({ user_id: 1 });
notificationSchema.index({ is_read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ created_at: 1 });

// Static method to create a notification
notificationSchema.statics.createNotification = async function(data) {
  return await this.create(data);
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { user_id: userId, is_read: false },
    { is_read: true }
  );
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ user_id: userId, is_read: false });
};

// Create model from schema
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;