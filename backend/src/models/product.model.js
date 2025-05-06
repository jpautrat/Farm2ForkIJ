const mongoose = require('mongoose');

/**
 * Product Schema
 * Represents products sold by sellers
 */
const productSchema = new mongoose.Schema({
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Product description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  sale_price: {
    type: Number,
    min: [0, 'Sale price cannot be negative'],
    validate: {
      validator: function(value) {
        // Sale price must be less than regular price if set
        return value === undefined || value === null || value < this.price;
      },
      message: 'Sale price must be less than regular price'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Product quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Product unit is required'],
    enum: ['lb', 'kg', 'oz', 'g', 'each', 'bunch', 'dozen'],
    default: 'each'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
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

// Indexes for faster queries
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category_id: 1 });
productSchema.index({ seller_id: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ price: 1 });

// Virtual for product images
productSchema.virtual('images', {
  ref: 'ProductImage',
  localField: '_id',
  foreignField: 'product_id'
});

// Virtual for product attributes
productSchema.virtual('attributes', {
  ref: 'ProductAttribute',
  localField: '_id',
  foreignField: 'product_id'
});

// Virtual for product reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product_id'
});

// Virtual for average rating
productSchema.virtual('average_rating').get(function() {
  if (!this._average_rating) return 0;
  return this._average_rating;
});

// Method to set average rating
productSchema.methods.setAverageRating = function(rating) {
  this._average_rating = rating;
  return this;
};

// Pre-save middleware to update status based on quantity
productSchema.pre('save', function(next) {
  if (this.quantity <= 0) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock' && this.quantity > 0) {
    this.status = 'active';
  }
  next();
});

// Create model from schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product;