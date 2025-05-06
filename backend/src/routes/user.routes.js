const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @permission  Private
 */
router.get('/me', authMiddleware, userController.getCurrentUserProfile);

/**
 * @route   PUT /api/users/me
 * @desc    Update user profile
 * @permission  Private
 */
router.put(
  '/me',
  [
    authMiddleware,
    [
      check('firstName', 'First name is required').optional(),
      check('lastName', 'Last name is required').optional(),
      check('phoneNumber', 'Phone number is required').optional()
    ]
  ],
  userController.updateUserProfile
);

/**
 * @route   PUT /api/users/me/password
 * @desc    Change user password
 * @permission  Private
 */
router.put(
  '/me/password',
  [
    authMiddleware,
    [
      check('currentPassword', 'Current password is required').not().isEmpty(),
      check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
    ]
  ],
  userController.changePassword
);

/**
 * @route   GET /api/users/addresses
 * @desc    Get user addresses
 * @permission  Private
 */
router.get('/addresses', authMiddleware, userController.getUserAddresses);

/**
 * @route   POST /api/users/addresses
 * @desc    Add a new address
 * @permission  Private
 */
router.post(
  '/addresses',
  [
    authMiddleware,
    [
      check('addressType', 'Address type is required').isIn(['billing', 'shipping']),
      check('streetAddress', 'Street address is required').not().isEmpty(),
      check('city', 'City is required').not().isEmpty(),
      check('state', 'State is required').not().isEmpty(),
      check('postalCode', 'Postal code is required').not().isEmpty(),
      check('country', 'Country is required').not().isEmpty()
    ]
  ],
  userController.addUserAddress
);

/**
 * @route   PUT /api/users/addresses/:id
 * @desc    Update an address
 * @permission  Private
 */
router.put(
  '/addresses/:id',
  [
    authMiddleware,
    [
      check('addressType', 'Address type is required').optional().isIn(['billing', 'shipping']),
      check('streetAddress', 'Street address is required').optional().not().isEmpty(),
      check('city', 'City is required').optional().not().isEmpty(),
      check('state', 'State is required').optional().not().isEmpty(),
      check('postalCode', 'Postal code is required').optional().not().isEmpty(),
      check('country', 'Country is required').optional().not().isEmpty()
    ]
  ],
  userController.updateUserAddress
);

/**
 * @route   DELETE /api/users/addresses/:id
 * @desc    Delete an address
 * @permission  Private
 */
router.delete('/addresses/:id', authMiddleware, userController.deleteUserAddress);

/**
 * @route   PUT /api/users/addresses/:id/default
 * @desc    Set an address as default
 * @permission  Private
 */
router.put('/addresses/:id/default', authMiddleware, userController.setDefaultAddress);

// Admin routes

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @permission  Admin
 */
router.get('/', [authMiddleware, adminMiddleware], userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @permission  Admin
 */
router.get('/:id', [authMiddleware, adminMiddleware], userController.getUserById);

/**
 * @route   PUT /api/users/:id/status
 * @desc    Change user status
 * @permission  Admin
 */
router.put(
  '/:id/status',
  [
    authMiddleware,
    adminMiddleware,
    [
      check('status', 'Status is required').isIn(['active', 'inactive', 'suspended'])
    ]
  ],
  userController.changeUserStatus
);

module.exports = router;
