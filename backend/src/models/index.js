/**
 * Models Index
 * Exports all models for easier importing
 */

const User = require('./user.model');
const Profile = require('./profile.model');
const Address = require('./address.model');
const SellerProfile = require('./seller-profile.model');
const Category = require('./category.model');
const Product = require('./product.model');
const ProductImage = require('./product-image.model');
const ProductAttribute = require('./product-attribute.model');
const ShoppingCart = require('./shopping-cart.model');
const CartItem = require('./cart-item.model');
const Wishlist = require('./wishlist.model');
const WishlistItem = require('./wishlist-item.model');
const Order = require('./order.model');
const OrderItem = require('./order-item.model');
const Payment = require('./payment.model');
const Shipment = require('./shipment.model');
const Review = require('./review.model');
const Notification = require('./notification.model');

module.exports = {
  User,
  Profile,
  Address,
  SellerProfile,
  Category,
  Product,
  ProductImage,
  ProductAttribute,
  ShoppingCart,
  CartItem,
  Wishlist,
  WishlistItem,
  Order,
  OrderItem,
  Payment,
  Shipment,
  Review,
  Notification
};