const mongoose = require('mongoose');

/**
 * Profile Schema
 * Stores additional user profile information
 */
const profileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profile_picture: {
    type: String,
    default: 'default-profile.jpg'
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  website: {
    type: String,
    trim: true,
    match: [
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
      'Please provide a valid URL'
    ]
  },
  social_media_links: {
    facebook: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    }
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

// Create model from schema
const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;