const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../src/models/user.model');
const sendEmail = require('../../src/utils/email');

// Mock the email service
jest.mock('../../src/utils/email');

// Import test setup
require('../setup');

describe('Auth Controller', () => {
  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
  });

  afterAll(async () => {
    // Clear the database and close the connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the users collection before each test
    await User.deleteMany({});
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return token', async () => {
      // Mock the email sending function to resolve
      sendEmail.mockResolvedValue(true);

      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe(userData.email);
      expect(response.body.firstName).toBe(userData.firstName);
      expect(response.body.lastName).toBe(userData.lastName);
      expect(response.body.role).toBe('buyer'); // Default role

      // Verify email was sent
      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        email: userData.email,
        subject: 'Please verify your email'
      }));
    });

    it('should return 400 if user already exists', async () => {
      // Create a user first
      await User.create({
        first_name: 'Existing',
        last_name: 'User',
        email: 'existing@example.com',
        password: 'password123'
      });

      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'existing@example.com', // Same email as existing user
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });

    it('should register user even if email sending fails', async () => {
      // Mock the email sending function to reject
      sendEmail.mockRejectedValue(new Error('Email sending failed'));

      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('message', 'Registration successful! Email verification could not be sent. Please contact support.');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user and return token', async () => {
      // Create a user first
      const user = new User({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe(loginData.email);
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should return 401 for invalid password', async () => {
      // Create a user first
      const user = new User({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email', async () => {
      // Mock the email sending function to resolve
      sendEmail.mockResolvedValue(true);

      // Create a user first
      const user = new User({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Password reset email sent');

      // Verify email was sent
      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com',
        subject: 'Password Reset'
      }));

      // Verify user has reset token
      const updatedUser = await User.findOne({ email: 'test@example.com' });
      expect(updatedUser.reset_password_token).toBeDefined();
      expect(updatedUser.reset_password_expires).toBeDefined();
    });

    it('should return 404 if user not found', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  // Additional tests for other endpoints would follow the same pattern
});