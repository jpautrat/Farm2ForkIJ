/**
 * Global error handling middleware
 * Handles errors and sends appropriate responses
 */
exports.errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    const errors = {};
    
    // Extract validation errors
    for (const field in err.errors) {
      errors[field] = err.errors[field].message;
    }
    
    return res.status(statusCode).json({
      message: 'Validation Error',
      errors
    });
  }
  
  if (err.name === 'CastError') {
    // Mongoose cast error (invalid ID)
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  
  if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for ${field}. This ${field} is already in use.`;
  }

  // Send error response
  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

/**
 * Async handler to avoid try/catch blocks in route handlers
 * @param {Function} fn - Async function to handle the route
 */
exports.asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found error handler
 * Handles 404 errors for routes that don't exist
 */
exports.notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};