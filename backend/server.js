/**
 * Farm2Fork Backend Server
 * 
 * This is the main entry point for the Farm2Fork backend application.
 * It sets up the Express server, connects to the database, and initializes all middleware and routes.
 */

// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');

// Import configuration
const config = require('./src/config');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const productRoutes = require('./src/routes/product.routes');
const categoryRoutes = require('./src/routes/category.routes');
const cartRoutes = require('./src/routes/cart.routes');
const orderRoutes = require('./src/routes/order.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const shippingRoutes = require('./src/routes/shipping.routes');
const reviewRoutes = require('./src/routes/review.routes');
const adminRoutes = require('./src/routes/admin.routes');

// Import middleware
const { errorHandler } = require('./src/middleware/error.middleware');
const { authMiddleware } = require('./src/middleware/auth.middleware');

// Create Express app
const app = express();
const httpServer = createServer(app);

// Set up rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Apply middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(compression()); // Compress responses
app.use(limiter); // Apply rate limiting

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
const apiPrefix = process.env.API_BASE_URL || '/api';
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, authMiddleware, userRoutes);
app.use(`${apiPrefix}/products`, productRoutes);
app.use(`${apiPrefix}/categories`, categoryRoutes);
app.use(`${apiPrefix}/cart`, authMiddleware, cartRoutes);
app.use(`${apiPrefix}/orders`, authMiddleware, orderRoutes);
app.use(`${apiPrefix}/payments`, authMiddleware, paymentRoutes);
app.use(`${apiPrefix}/shipping`, authMiddleware, shippingRoutes);
app.use(`${apiPrefix}/reviews`, reviewRoutes);
app.use(`${apiPrefix}/admin`, authMiddleware, adminRoutes);

// API documentation
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('./src/config/swagger');
  app.use(`${apiPrefix}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Error handling middleware
app.use(errorHandler);

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  user: process.env.MONGODB_USER,
  pass: process.env.MONGODB_PASSWORD
})
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start the server
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`API Documentation: http://localhost:${PORT}${apiPrefix}/docs`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});

module.exports = app; // Export for testing