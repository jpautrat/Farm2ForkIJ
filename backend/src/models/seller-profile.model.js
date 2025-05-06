const mongoose = require('mongoose');

/**
 * Seller Profile Schema
 * Stores additional information for users with seller role
 */
const sellerProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  farm_name: {
    type: String,
    required: [true, 'Farm name is required'],
    trim: true,
    maxlength: [100, 'Farm name cannot be more than 100 characters']
  },
  farm_description: {
    type: String,
    required: [true, 'Farm description is required'],
    trim: true,
    maxlength: [2000, 'Farm description cannot be more than 2000 characters']
  },
  farm_logo: {
    type: String,
    default: 'default-farm-logo.jpg'
  },
  farm_banner: {
    type: String,
    default: 'default-farm-banner.jpg'
  },
  farm_location: {
    address: {
      type: String,
      required: [true, 'Farm address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Farm city is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'Farm state is required'],
      trim: true
    },
    postal_code: {
      type: String,
      required: [true, 'Farm postal code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Farm country is required'],
      trim: true
    },
    coordinates: {
      lat: {
        type: Number
      },
      lng: {
        type: Number
      }
    }
  },
  farm_size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'small'
  },
  farming_practices: {
    type: [String],
    enum: ['organic', 'conventional', 'hydroponic', 'permaculture', 'biodynamic', 'other'],
    default: ['conventional']
  },
  is_verified: {
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

// Virtual for getting the distance between farm and a given location
sellerProfileSchema.virtual('distance').get(function() {
  // This will be implemented in the controller when needed
  return this._distance;
});

// Method to set distance for sorting by proximity
sellerProfileSchema.methods.setDistance = function(distance) {
  this._distance = distance;
  return this;
};

// Create model from schema
const SellerProfile = mongoose.model('SellerProfile', sellerProfileSchema);

module.exports = SellerProfile;