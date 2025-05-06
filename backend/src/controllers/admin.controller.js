/**
 * Admin controller
 * Handles HTTP requests for admin-related operations
 */
const adminService = require('../services/admin.service');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * Get admin dashboard statistics
 * @route GET /api/admin/dashboard
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const stats = await adminService.getDashboardStats();
  res.json(stats);
});

/**
 * Get all users (Admin only)
 * @route GET /api/admin/users
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const result = await adminService.getAllUsers(req.query);
  res.json(result);
});

/**
 * Get user by ID (Admin only)
 * @route GET /api/admin/users/:id
 */
exports.getUserById = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const user = await adminService.getUserById(req.params.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json(user);
});

/**
 * Update user (Admin only)
 * @route PUT /api/admin/users/:id
 */
exports.updateUser = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const userId = req.params.id;
  
  // Check if user exists
  const user = await adminService.getUserById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const updatedUser = await adminService.updateUser(userId, req.body);
  res.json(updatedUser);
});

/**
 * Delete user (Admin only)
 * @route DELETE /api/admin/users/:id
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const userId = req.params.id;
  
  // Check if user exists
  const user = await adminService.getUserById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  await adminService.deleteUser(userId);
  res.json({ message: 'User deleted successfully' });
});

/**
 * Get all orders (Admin only)
 * @route GET /api/admin/orders
 */
exports.getAllOrders = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const result = await adminService.getAllOrders(req.query);
  res.json(result);
});

/**
 * Get order by ID (Admin only)
 * @route GET /api/admin/orders/:id
 */
exports.getOrderById = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const order = await adminService.getOrderById(req.params.id);
  
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  res.json(order);
});

/**
 * Update order status (Admin only)
 * @route PUT /api/admin/orders/:id/status
 */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const orderId = req.params.id;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }
  
  const order = await adminService.updateOrderStatus(orderId, status);
  res.json(order);
});

/**
 * Get all products (Admin only)
 * @route GET /api/admin/products
 */
exports.getAllProducts = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const result = await adminService.getAllProducts(req.query);
  res.json(result);
});

/**
 * Update product status (Admin only)
 * @route PUT /api/admin/products/:id/status
 */
exports.updateProductStatus = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const productId = req.params.id;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }
  
  const product = await adminService.updateProductStatus(productId, status);
  res.json(product);
});

/**
 * Get all reviews (Admin only)
 * @route GET /api/admin/reviews
 */
exports.getAllReviews = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const result = await adminService.getAllReviews(req.query);
  res.json(result);
});

/**
 * Update review status (Admin only)
 * @route PUT /api/admin/reviews/:id/status
 */
exports.updateReviewStatus = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const reviewId = req.params.id;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }
  
  const review = await adminService.updateReviewStatus(reviewId, status);
  res.json(review);
});