const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
exports.authMiddleware = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    // Extract token from header
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find user by id
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found or token is invalid' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Your account is not active. Please contact support.' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role(s)
 * @param {string|string[]} roles - Required role(s)
 */
exports.authorize = (roles) => {
  return (req, res, next) => {
    // Convert roles to array if it's a single string
    if (typeof roles === 'string') {
      roles = [roles];
    }

    // Check if user exists and has one of the required roles
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }

    next();
  };
};

/**
 * Admin middleware
 * Checks if user is an admin
 */
exports.adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Admin access required' 
    });
  }

  next();
};
