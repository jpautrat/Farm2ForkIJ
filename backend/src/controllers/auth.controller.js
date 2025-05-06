const User = require('../models/user.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, role } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create new user
  const user = await User.create({
    first_name: firstName,
    last_name: lastName,
    email,
    password,
    role: role || 'buyer'
  });

  // Generate verification token
  const verificationToken = user.generateVerificationToken();
  await user.save();

  // Create verification URL
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;

  // Send verification email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Please verify your email',
      message: `Please click on the link to verify your email: ${verificationUrl}`
    });

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(201).json({
      _id: user._id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      token,
      message: 'Registration successful! Please check your email to verify your account.'
    });
  } catch (error) {
    // If email sending fails, still create the user but inform them
    console.error('Email sending failed:', error);

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(201).json({
      _id: user._id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      token,
      message: 'Registration successful! Email verification could not be sent. Please contact support.'
    });
  }
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Check if user is active
  if (user.status !== 'active') {
    return res.status(403).json({ message: 'Your account is not active. Please contact support.' });
  }

  // Update last login
  user.last_login = Date.now();
  await user.save();

  // Generate JWT token
  const token = user.generateAuthToken();

  res.json({
    _id: user._id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    token
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res) => {
  // JWT is stateless, so we don't need to do anything server-side
  // The client should remove the token from storage

  res.json({ message: 'Logged out successfully' });
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    _id: user._id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    emailVerified: user.email_verified,
    createdAt: user.created_at,
    status: user.status
  });
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save();

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

  // Send reset email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset',
      message: `You requested a password reset. Please click on the link to reset your password: ${resetUrl}`
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    // If email sending fails, reset the token
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;
    await user.save();

    return res.status(500).json({ message: 'Email could not be sent' });
  }
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Get token from params
  const { token } = req.params;
  const { password } = req.body;

  // Hash the token to compare with stored hash
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user by token and check if token is still valid
  const user = await User.findOne({
    reset_password_token: resetPasswordToken,
    reset_password_expires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  // Set new password
  user.password = password;
  user.reset_password_token = undefined;
  user.reset_password_expires = undefined;
  await user.save();

  // Generate new JWT token
  const newToken = user.generateAuthToken();

  res.json({
    _id: user._id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    token: newToken,
    message: 'Password reset successful'
  });
});

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Find user by verification token
  const user = await User.findOne({ verification_token: token });
  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  // Mark email as verified
  user.email_verified = true;
  user.verification_token = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully' });
});
