const userService = require('../services/user.service');
const addressService = require('../services/address.service');
const { asyncHandler } = require('../middleware/error.middleware');
const { validationResult } = require('express-validator');

// Get current user profile
exports.getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    _id: user._id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phoneNumber: user.phone_number,
    role: user.role,
    createdAt: user.created_at,
    emailVerified: user.email_verified
  });
});

// Update user profile
exports.updateUserProfile = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const updatedUser = await userService.updateUserProfile(req.user._id, req.body);

  if (!updatedUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    _id: updatedUser._id,
    firstName: updatedUser.first_name,
    lastName: updatedUser.last_name,
    email: updatedUser.email,
    phoneNumber: updatedUser.phone_number,
    role: updatedUser.role,
    message: 'Profile updated successfully'
  });
});

// Change user password
exports.changePassword = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    await userService.changePassword(req.user._id, currentPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all users (admin only)
exports.getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  res.json(result);
});

// Get user by ID (admin only)
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    _id: user._id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phoneNumber: user.phone_number,
    role: user.role,
    status: user.status,
    createdAt: user.created_at,
    emailVerified: user.email_verified
  });
});

// Change user status (admin only)
exports.changeUserStatus = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status } = req.body;

  try {
    const updatedUser = await userService.changeUserStatus(req.params.id, status);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: updatedUser._id,
      status: updatedUser.status,
      message: 'User status updated successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user addresses
exports.getUserAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getUserAddresses(req.user._id);
  res.json(addresses);
});

// Add a new address
exports.addUserAddress = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const address = await addressService.createAddress(req.user._id, req.body);
  res.status(201).json(address);
});

// Update an address
exports.updateUserAddress = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Check if address belongs to user
  const isOwner = await addressService.isAddressOwnedByUser(req.params.id, req.user._id);
  if (!isOwner) {
    return res.status(403).json({ message: 'Not authorized to update this address' });
  }

  const updatedAddress = await addressService.updateAddress(req.params.id, req.body);

  if (!updatedAddress) {
    return res.status(404).json({ message: 'Address not found' });
  }

  res.json(updatedAddress);
});

// Delete an address
exports.deleteUserAddress = asyncHandler(async (req, res) => {
  // Check if address belongs to user
  const isOwner = await addressService.isAddressOwnedByUser(req.params.id, req.user._id);
  if (!isOwner) {
    return res.status(403).json({ message: 'Not authorized to delete this address' });
  }

  const success = await addressService.deleteAddress(req.params.id);

  if (!success) {
    return res.status(404).json({ message: 'Address not found' });
  }

  res.json({ message: 'Address deleted successfully' });
});

// Set an address as default
exports.setDefaultAddress = asyncHandler(async (req, res) => {
  // Check if address belongs to user
  const isOwner = await addressService.isAddressOwnedByUser(req.params.id, req.user._id);
  if (!isOwner) {
    return res.status(403).json({ message: 'Not authorized to update this address' });
  }

  const updatedAddress = await addressService.setDefaultAddress(req.params.id);

  if (!updatedAddress) {
    return res.status(404).json({ message: 'Address not found' });
  }

  res.json({
    _id: updatedAddress._id,
    isDefault: updatedAddress.is_default,
    message: 'Address set as default successfully'
  });
});
