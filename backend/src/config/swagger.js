/**
 * Swagger configuration for API documentation
 */
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Farm2Fork API',
    version: '1.0.0',
    description: 'API documentation for the Farm2Fork direct-to-door food marketplace',
    contact: {
      name: 'Farm2Fork Team',
      email: 'support@farm2fork.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: '/api',
      description: 'Development server'
    }
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication endpoints'
    },
    {
      name: 'Users',
      description: 'User management endpoints'
    },
    {
      name: 'Products',
      description: 'Product management endpoints'
    },
    {
      name: 'Categories',
      description: 'Category management endpoints'
    },
    {
      name: 'Cart',
      description: 'Shopping cart endpoints'
    },
    {
      name: 'Orders',
      description: 'Order management endpoints'
    },
    {
      name: 'Payments',
      description: 'Payment processing endpoints'
    },
    {
      name: 'Shipping',
      description: 'Shipping management endpoints'
    },
    {
      name: 'Reviews',
      description: 'Product review endpoints'
    },
    {
      name: 'Admin',
      description: 'Admin-only endpoints'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        required: ['email', 'first_name', 'last_name'],
        properties: {
          _id: {
            type: 'string',
            description: 'User ID'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email'
          },
          first_name: {
            type: 'string',
            description: 'User first name'
          },
          last_name: {
            type: 'string',
            description: 'User last name'
          },
          role: {
            type: 'string',
            enum: ['buyer', 'seller', 'admin'],
            description: 'User role'
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'suspended'],
            description: 'User status'
          },
          email_verified: {
            type: 'boolean',
            description: 'Whether the email is verified'
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'User creation date'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'User last update date'
          }
        }
      },
      Product: {
        type: 'object',
        required: ['name', 'description', 'price', 'seller'],
        properties: {
          _id: {
            type: 'string',
            description: 'Product ID'
          },
          name: {
            type: 'string',
            description: 'Product name'
          },
          description: {
            type: 'string',
            description: 'Product description'
          },
          price: {
            type: 'number',
            format: 'float',
            description: 'Product price'
          },
          category: {
            type: 'string',
            description: 'Category ID'
          },
          seller: {
            type: 'string',
            description: 'Seller ID'
          },
          images: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Product images'
          },
          stock: {
            type: 'number',
            description: 'Product stock'
          },
          rating: {
            type: 'number',
            format: 'float',
            description: 'Product average rating'
          },
          num_reviews: {
            type: 'number',
            description: 'Number of product reviews'
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Product creation date'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Product last update date'
          }
        }
      },
      // Additional schemas would be defined here
    }
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Create a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'password'],
                properties: {
                  firstName: {
                    type: 'string',
                    example: 'John'
                  },
                  lastName: {
                    type: 'string',
                    example: 'Doe'
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'john.doe@example.com'
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    example: 'password123'
                  },
                  role: {
                    type: 'string',
                    enum: ['buyer', 'seller'],
                    example: 'buyer'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    _id: {
                      type: 'string',
                      example: '60d21b4667d0d8992e610c85'
                    },
                    firstName: {
                      type: 'string',
                      example: 'John'
                    },
                    lastName: {
                      type: 'string',
                      example: 'Doe'
                    },
                    email: {
                      type: 'string',
                      example: 'john.doe@example.com'
                    },
                    role: {
                      type: 'string',
                      example: 'buyer'
                    },
                    token: {
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    },
                    message: {
                      type: 'string',
                      example: 'Registration successful! Please check your email to verify your account.'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'User already exists'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        description: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'john.doe@example.com'
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    example: 'password123'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    _id: {
                      type: 'string',
                      example: '60d21b4667d0d8992e610c85'
                    },
                    firstName: {
                      type: 'string',
                      example: 'John'
                    },
                    lastName: {
                      type: 'string',
                      example: 'Doe'
                    },
                    email: {
                      type: 'string',
                      example: 'john.doe@example.com'
                    },
                    role: {
                      type: 'string',
                      example: 'buyer'
                    },
                    token: {
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Invalid email or password'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    // Additional endpoints would be defined here
  }
};

module.exports = swaggerDocument;