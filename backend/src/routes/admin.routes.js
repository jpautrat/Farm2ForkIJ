const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// Apply admin middleware to all routes in this router
router.use(authMiddleware, adminMiddleware);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @permission  Admin
 */
router.get('/dashboard', adminController.getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @permission  Admin
 */
router.get('/users', adminController.getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @permission  Admin
 */
router.get('/users/:id', adminController.getUserById);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @permission  Admin
 */
router.put(
  '/users/:id',
  [
    check('status', 'Status is required').optional(),
    check('role', 'Role is required').optional()
  ],
  adminController.updateUser
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @permission  Admin
 */
router.delete('/users/:id', adminController.deleteUser);

/**
 * @route   GET /api/admin/sellers
 * @desc    Get all sellers
 * @permission  Admin
 */
router.get('/sellers', adminController.getAllSellers);

/**
 * @route   PUT /api/admin/sellers/:id/approve
 * @desc    Approve a seller
 * @permission  Admin
 */
router.put('/sellers/:id/approve', adminController.approveSeller);

/**
 * @route   PUT /api/admin/sellers/:id/reject
 * @desc    Reject a seller
 * @permission  Admin
 */
router.put(
  '/sellers/:id/reject',
  [
    check('reason', 'Rejection reason is required').not().isEmpty()
  ],
  adminController.rejectSeller
);

/**
 * @route   GET /api/admin/products
 * @desc    Get all products
 * @permission  Admin
 */
router.get('/products', adminController.getAllProducts);

/**
 * @route   GET /api/admin/products/:id
 * @desc    Get product by ID
 * @permission  Admin
 */
router.get('/products/:id', adminController.getProductById);

/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update product
 * @permission  Admin
 */
router.put('/products/:id', adminController.updateProduct);

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Delete product
 * @permission  Admin
 */
router.delete('/products/:id', adminController.deleteProduct);

/**
 * @route   PUT /api/admin/products/:id/approve
 * @desc    Approve a product
 * @permission  Admin
 */
router.put('/products/:id/approve', adminController.approveProduct);

/**
 * @route   PUT /api/admin/products/:id/reject
 * @desc    Reject a product
 * @permission  Admin
 */
router.put(
  '/products/:id/reject',
  [
    check('reason', 'Rejection reason is required').not().isEmpty()
  ],
  adminController.rejectProduct
);

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders
 * @permission  Admin
 */
router.get('/orders', adminController.getAllOrders);

/**
 * @route   GET /api/admin/orders/:id
 * @desc    Get order by ID
 * @permission  Admin
 */
router.get('/orders/:id', adminController.getOrderById);

/**
 * @route   PUT /api/admin/orders/:id
 * @desc    Update order
 * @permission  Admin
 */
router.put('/orders/:id', adminController.updateOrder);

/**
 * @route   GET /api/admin/categories
 * @desc    Get all categories
 * @permission  Admin
 */
router.get('/categories', adminController.getAllCategories);

/**
 * @route   POST /api/admin/categories
 * @desc    Create a new category
 * @permission  Admin
 */
router.post(
  '/categories',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty()
  ],
  adminController.createCategory
);

/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Update category
 * @permission  Admin
 */
router.put(
  '/categories/:id',
  [
    check('name', 'Name is required').optional(),
    check('description', 'Description is required').optional()
  ],
  adminController.updateCategory
);

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Delete category
 * @permission  Admin
 */
router.delete('/categories/:id', adminController.deleteCategory);

/**
 * @route   GET /api/admin/reports
 * @desc    Get sales reports
 * @permission  Admin
 */
router.get('/reports/sales', adminController.getSalesReports);

/**
 * @route   GET /api/admin/reports/users
 * @desc    Get user reports
 * @permission  Admin
 */
router.get('/reports/users', adminController.getUserReports);

/**
 * @route   GET /api/admin/reports/products
 * @desc    Get product reports
 * @permission  Admin
 */
router.get('/reports/products', adminController.getProductReports);

/**
 * @route   GET /api/admin/settings
 * @desc    Get system settings
 * @permission  Admin
 */
router.get('/settings', adminController.getSystemSettings);

/**
 * @route   PUT /api/admin/settings
 * @desc    Update system settings
 * @permission  Admin
 */
router.put('/settings', adminController.updateSystemSettings);

module.exports = router;