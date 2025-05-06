const mongoose = require('mongoose');

/**
 * Category Schema
 * Represents product categories with hierarchical structure
 */
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Category name cannot be more than 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Category description cannot be more than 500 characters']
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  image: {
    type: String,
    default: 'default-category.jpg'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
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
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent_id'
});

// Static method to get full category tree
categorySchema.statics.getFullTree = async function() {
  // Get all root categories (those without parent)
  const rootCategories = await this.find({ parent_id: null })
    .sort('name')
    .populate({
      path: 'subcategories',
      populate: {
        path: 'subcategories'
      }
    });
  
  return rootCategories;
};

// Static method to get category with its ancestors
categorySchema.statics.getWithAncestors = async function(categoryId) {
  const category = await this.findById(categoryId);
  if (!category) return null;
  
  const ancestors = [];
  let currentCategory = category;
  
  // If category has parent, find all ancestors
  while (currentCategory.parent_id) {
    const parent = await this.findById(currentCategory.parent_id);
    if (!parent) break;
    ancestors.unshift(parent);
    currentCategory = parent;
  }
  
  return {
    category,
    ancestors
  };
};

// Create model from schema
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;