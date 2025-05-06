const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * User Schema
 * Represents users in the system with different roles (buyer, seller, admin)
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't return password in queries by default
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  phone_number: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  reset_password_token: String,
  reset_password_expires: Date,
  verification_token: String
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Pre-save middleware to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.reset_password_token = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.reset_password_expires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Method to generate email verification token
userSchema.methods.generateVerificationToken = function() {
  const verificationToken = crypto.randomBytes(20).toString('hex');

  this.verification_token = verificationToken;

  return verificationToken;
};

// Virtual for user's full name
userSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

// Create model from schema
const User = mongoose.model('User', userSchema);

module.exports = User;
