/**
 * Category controller
 * Handles HTTP requests for category-related operations
 */
const categoryService = require('../services/category.service');
const { asyncHandler } = require('../middleware/error.middleware');
const { validationResult } = require('express-validator');

/**
 * Get all categories (Public access)
 * @route GET /api/categories
 */
exports.getAllCategories = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true' && req.user && req.user.role === 'admin';
  const categories = await categoryService.getAllCategories(includeInactive);
  res.json(categories);
});

/**
 * Get category by ID (Public access)
 * @route GET /api/categories/:id
 */
exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  
  res.json(category);
});

/**
 * Create a new category (Admin only)
 * @route POST /api/categories
 */
exports.createCategory = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Check if user is an admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const category = await categoryService.createCategory(req.body);
  res.status(201).json(category);
});

/**
 * Update a category (Admin only)
 * @route PUT /api/categories/:id
 */
exports.updateCategory = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Check if user is an admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const categoryId = req.params.id;
  
  // Check if category exists
  const category = await categoryService.getCategoryById(categoryId);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  
  const updatedCategory = await categoryService.updateCategory(categoryId, req.body);
  res.json(updatedCategory);
});

/**
 * Delete a category (Admin only)
 * @route DELETE /api/categories/:id
 */
exports.deleteCategory = asyncHandler(async (req, res) => {
  // Check if user is an admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const categoryId = req.params.id;
  
  // Check if category exists
  const category = await categoryService.getCategoryById(categoryId);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  
  try {
    await categoryService.deleteCategory(categoryId);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Get category hierarchy (Public access)
 * @route GET /api/categories/hierarchy
 */
exports.getCategoryHierarchy = asyncHandler(async (req, res) => {
  const hierarchy = await categoryService.getCategoryHierarchy();
  res.json(hierarchy);
});

/**
 * Get child categories (Public access)
 * @route GET /api/categories/:id/children
 */
exports.getChildCategories = asyncHandler(async (req, res) => {
  const parentId = req.params.id;
  
  // Check if parent category exists
  const parentCategory = await categoryService.getCategoryById(parentId);
  if (!parentCategory) {
    return res.status(404).json({ message: 'Parent category not found' });
  }
  
  const children = await categoryService.getChildCategories(parentId);
  res.json(children);
});

/**
 * Get category breadcrumb (Public access)
 * @route GET /api/categories/:id/breadcrumb
 */
exports.getCategoryBreadcrumb = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  
  // Check if category exists
  const category = await categoryService.getCategoryById(categoryId);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  
  const breadcrumb = await categoryService.getCategoryBreadcrumb(categoryId);
  res.json(breadcrumb);
});