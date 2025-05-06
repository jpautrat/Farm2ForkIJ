/**
 * Product service
 * Handles product-related business logic
 */
const Product = require('../models/product.model');
const ProductImage = require('../models/product-image.model');
const ProductAttribute = require('../models/product-attribute.model');
const mongoose = require('mongoose');

class ProductService {
  /**
   * Get all products with pagination and filtering
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Products and pagination info
   */
  async getAllProducts(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Add filters if provided
    if (query.category) {
      filter.category_id = query.category;
    }
    
    if (query.seller) {
      filter.seller_id = query.seller;
    }
    
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
      if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
    }
    
    if (query.status) {
      filter.status = query.status;
    } else {
      // By default, only show active products
      filter.status = 'active';
    }
    
    if (query.featured) {
      filter.featured = query.featured === 'true';
    }
    
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }
    
    // Sort options
    let sort = {};
    if (query.sort) {
      switch (query.sort) {
        case 'price_asc':
          sort = { price: 1 };
          break;
        case 'price_desc':
          sort = { price: -1 };
          break;
        case 'newest':
          sort = { created_at: -1 };
          break;
        case 'name_asc':
          sort = { name: 1 };
          break;
        case 'name_desc':
          sort = { name: -1 };
          break;
        default:
          sort = { created_at: -1 };
      }
    } else {
      // Default sort by newest
      sort = { created_at: -1 };
    }
    
    const products = await Product.find(filter)
      .populate('category_id', 'name')
      .populate('seller_id', 'first_name last_name farm_name')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(filter);
    
    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} - Product object with images and attributes
   */
  async getProductById(productId) {
    const product = await Product.findById(productId)
      .populate('category_id', 'name')
      .populate('seller_id', 'first_name last_name farm_name');
    
    if (!product) {
      return null;
    }
    
    // Get product images
    const images = await ProductImage.find({ product_id: productId })
      .sort({ is_primary: -1, display_order: 1 });
    
    // Get product attributes
    const attributes = await ProductAttribute.find({ product_id: productId });
    
    return {
      ...product.toObject(),
      images,
      attributes
    };
  }

  /**
   * Create a new product
   * @param {string} sellerId - Seller ID
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} - Created product object
   */
  async createProduct(sellerId, productData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Create product
      const product = new Product({
        seller_id: sellerId,
        category_id: productData.categoryId,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        sale_price: productData.salePrice,
        quantity: productData.quantity,
        unit: productData.unit,
        status: productData.status || 'active',
        featured: productData.featured || false
      });
      
      await product.save({ session });
      
      // Create product images
      if (productData.images && productData.images.length > 0) {
        const imagePromises = productData.images.map((image, index) => {
          const productImage = new ProductImage({
            product_id: product._id,
            image_url: image.url,
            is_primary: index === 0, // First image is primary
            display_order: index
          });
          return productImage.save({ session });
        });
        
        await Promise.all(imagePromises);
      }
      
      // Create product attributes
      if (productData.attributes && productData.attributes.length > 0) {
        const attributePromises = productData.attributes.map(attr => {
          const productAttribute = new ProductAttribute({
            product_id: product._id,
            attribute_name: attr.name,
            attribute_value: attr.value
          });
          return productAttribute.save({ session });
        });
        
        await Promise.all(attributePromises);
      }
      
      await session.commitTransaction();
      session.endSession();
      
      return await this.getProductById(product._id);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Update a product
   * @param {string} productId - Product ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated product object
   */
  async updateProduct(productId, updateData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Update product
      const allowedUpdates = {
        category_id: updateData.categoryId,
        name: updateData.name,
        description: updateData.description,
        price: updateData.price,
        sale_price: updateData.salePrice,
        quantity: updateData.quantity,
        unit: updateData.unit,
        status: updateData.status,
        featured: updateData.featured
      };
      
      // Remove undefined values
      Object.keys(allowedUpdates).forEach(key => 
        allowedUpdates[key] === undefined && delete allowedUpdates[key]
      );
      
      const product = await Product.findByIdAndUpdate(
        productId,
        allowedUpdates,
        { new: true, runValidators: true, session }
      );
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Update product images if provided
      if (updateData.images) {
        // Delete existing images
        await ProductImage.deleteMany({ product_id: productId }, { session });
        
        // Create new images
        const imagePromises = updateData.images.map((image, index) => {
          const productImage = new ProductImage({
            product_id: product._id,
            image_url: image.url,
            is_primary: index === 0, // First image is primary
            display_order: index
          });
          return productImage.save({ session });
        });
        
        await Promise.all(imagePromises);
      }
      
      // Update product attributes if provided
      if (updateData.attributes) {
        // Delete existing attributes
        await ProductAttribute.deleteMany({ product_id: productId }, { session });
        
        // Create new attributes
        const attributePromises = updateData.attributes.map(attr => {
          const productAttribute = new ProductAttribute({
            product_id: product._id,
            attribute_name: attr.name,
            attribute_value: attr.value
          });
          return productAttribute.save({ session });
        });
        
        await Promise.all(attributePromises);
      }
      
      await session.commitTransaction();
      session.endSession();
      
      return await this.getProductById(product._id);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Delete a product
   * @param {string} productId - Product ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteProduct(productId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Delete product
      const product = await Product.findByIdAndDelete(productId, { session });
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Delete product images
      await ProductImage.deleteMany({ product_id: productId }, { session });
      
      // Delete product attributes
      await ProductAttribute.deleteMany({ product_id: productId }, { session });
      
      await session.commitTransaction();
      session.endSession();
      
      return true;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get featured products
   * @param {number} limit - Number of products to return
   * @returns {Promise<Array>} - Array of featured products
   */
  async getFeaturedProducts(limit = 8) {
    const products = await Product.find({ featured: true, status: 'active' })
      .populate('category_id', 'name')
      .populate('seller_id', 'first_name last_name farm_name')
      .sort({ created_at: -1 })
      .limit(limit);
    
    return products;
  }

  /**
   * Get products by category
   * @param {string} categoryId - Category ID
   * @param {Object} query - Query parameters (pagination)
   * @returns {Promise<Object>} - Products and pagination info
   */
  async getProductsByCategory(categoryId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const products = await Product.find({ category_id: categoryId, status: 'active' })
      .populate('category_id', 'name')
      .populate('seller_id', 'first_name last_name farm_name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments({ category_id: categoryId, status: 'active' });
    
    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get products by seller
   * @param {string} sellerId - Seller ID
   * @param {Object} query - Query parameters (pagination)
   * @returns {Promise<Object>} - Products and pagination info
   */
  async getProductsBySeller(sellerId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const products = await Product.find({ seller_id: sellerId })
      .populate('category_id', 'name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments({ seller_id: sellerId });
    
    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Search products
   * @param {string} searchTerm - Search term
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Products and pagination info
   */
  async searchProducts(searchTerm, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ],
      status: 'active'
    };
    
    // Add category filter if provided
    if (query.category) {
      filter.category_id = query.category;
    }
    
    // Add price range filter if provided
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
      if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
    }
    
    const products = await Product.find(filter)
      .populate('category_id', 'name')
      .populate('seller_id', 'first_name last_name farm_name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(filter);
    
    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Check if product belongs to seller
   * @param {string} productId - Product ID
   * @param {string} sellerId - Seller ID
   * @returns {Promise<boolean>} - True if product belongs to seller
   */
  async isProductOwnedBySeller(productId, sellerId) {
    const product = await Product.findOne({ _id: productId, seller_id: sellerId });
    return !!product;
  }
}

module.exports = new ProductService();