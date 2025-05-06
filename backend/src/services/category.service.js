/**
 * Category service
 * Handles category-related business logic
 */
const Category = require('../models/category.model');
const Product = require('../models/product.model');

class CategoryService {
  /**
   * Get all categories
   * @param {boolean} includeInactive - Whether to include inactive categories
   * @returns {Promise<Array>} - Array of categories
   */
  async getAllCategories(includeInactive = false) {
    const filter = includeInactive ? {} : { status: 'active' };
    
    const categories = await Category.find(filter)
      .sort({ name: 1 });
    
    return categories;
  }

  /**
   * Get category by ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} - Category object
   */
  async getCategoryById(categoryId) {
    return await Category.findById(categoryId);
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} - Created category object
   */
  async createCategory(categoryData) {
    const category = new Category({
      name: categoryData.name,
      description: categoryData.description,
      parent_id: categoryData.parentId || null,
      image: categoryData.image,
      status: categoryData.status || 'active'
    });
    
    return await category.save();
  }

  /**
   * Update a category
   * @param {string} categoryId - Category ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated category object
   */
  async updateCategory(categoryId, updateData) {
    // Only allow certain fields to be updated
    const allowedUpdates = {
      name: updateData.name,
      description: updateData.description,
      parent_id: updateData.parentId,
      image: updateData.image,
      status: updateData.status
    };
    
    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );
    
    return await Category.findByIdAndUpdate(
      categoryId,
      allowedUpdates,
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete a category
   * @param {string} categoryId - Category ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteCategory(categoryId) {
    // Check if category has products
    const productsCount = await Product.countDocuments({ category_id: categoryId });
    if (productsCount > 0) {
      throw new Error('Cannot delete category with associated products');
    }
    
    // Check if category has child categories
    const childrenCount = await Category.countDocuments({ parent_id: categoryId });
    if (childrenCount > 0) {
      throw new Error('Cannot delete category with child categories');
    }
    
    const result = await Category.findByIdAndDelete(categoryId);
    return !!result;
  }

  /**
   * Get category hierarchy
   * @returns {Promise<Array>} - Array of categories with children
   */
  async getCategoryHierarchy() {
    // Get all categories
    const allCategories = await Category.find({ status: 'active' });
    
    // Create a map of categories by ID
    const categoriesMap = {};
    allCategories.forEach(category => {
      categoriesMap[category._id] = {
        ...category.toObject(),
        children: []
      };
    });
    
    // Build the hierarchy
    const rootCategories = [];
    allCategories.forEach(category => {
      if (category.parent_id && categoriesMap[category.parent_id]) {
        // Add to parent's children
        categoriesMap[category.parent_id].children.push(categoriesMap[category._id]);
      } else {
        // Add to root categories
        rootCategories.push(categoriesMap[category._id]);
      }
    });
    
    return rootCategories;
  }

  /**
   * Get child categories
   * @param {string} parentId - Parent category ID
   * @returns {Promise<Array>} - Array of child categories
   */
  async getChildCategories(parentId) {
    return await Category.find({ parent_id: parentId, status: 'active' });
  }

  /**
   * Get parent category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} - Parent category object
   */
  async getParentCategory(categoryId) {
    const category = await Category.findById(categoryId);
    if (!category || !category.parent_id) {
      return null;
    }
    
    return await Category.findById(category.parent_id);
  }

  /**
   * Get category breadcrumb
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} - Array of categories in breadcrumb
   */
  async getCategoryBreadcrumb(categoryId) {
    const breadcrumb = [];
    let currentCategory = await Category.findById(categoryId);
    
    while (currentCategory) {
      breadcrumb.unshift(currentCategory);
      
      if (currentCategory.parent_id) {
        currentCategory = await Category.findById(currentCategory.parent_id);
      } else {
        currentCategory = null;
      }
    }
    
    return breadcrumb;
  }
}

module.exports = new CategoryService();