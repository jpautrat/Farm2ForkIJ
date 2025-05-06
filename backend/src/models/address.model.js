const mongoose = require('mongoose');

/**
 * Address Schema
 * Stores shipping and billing addresses for users
 */
const addressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address_type: {
    type: String,
    enum: ['billing', 'shipping'],
    required: [true, 'Address type is required']
  },
  street_address: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  postal_code: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  is_default: {
    type: Boolean,
    default: false
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
addressSchema.index({ user_id: 1, address_type: 1 });

// Pre-save middleware to ensure only one default address per type per user
addressSchema.pre('save', async function(next) {
  if (this.is_default) {
    try {
      // Find other addresses of the same type for this user that are set as default
      await this.constructor.updateMany(
        { 
          user_id: this.user_id, 
          address_type: this.address_type, 
          _id: { $ne: this._id }, 
          is_default: true 
        },
        { is_default: false }
      );
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Create model from schema
const Address = mongoose.model('Address', addressSchema);

module.exports = Address;