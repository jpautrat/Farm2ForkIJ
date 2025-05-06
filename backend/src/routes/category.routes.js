const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const categoryController = require('../controllers/category.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @permission  Public
 */
router.get('/', categoryController.getCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @permission  Public
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @route   POST /api/categories
 * @desc    Create a category
 * @permission  Admin
 */
router.post(
  '/',
  [
    authMiddleware,
    adminMiddleware,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty()
    ]
  ],
  categoryController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category
 * @permission  Admin
 */
router.put(
  '/:id',
  [
    authMiddleware,
    adminMiddleware,
    [
      check('name', 'Name is required').optional().not().isEmpty(),
      check('description', 'Description is required').optional().not().isEmpty(),
      check('status', 'Status must be either active or inactive').optional().isIn(['active', 'inactive'])
    ]
  ],
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 * @permission  Admin
 */
router.delete('/:id', [authMiddleware, adminMiddleware], categoryController.deleteCategory);

/**
 * @route   POST /api/categories/upload
 * @desc    Upload category image
 * @permission  Admin
 */
router.post('/upload', [authMiddleware, adminMiddleware], categoryController.uploadCategoryImage);

module.exports = router;