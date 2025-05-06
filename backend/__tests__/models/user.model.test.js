const mongoose = require('mongoose');
const User = require('../../src/models/user.model');
const jwt = require('jsonwebtoken');

// Import test setup
require('../setup');

describe('User Model', () => {
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
  });

  it('should create a new user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
      role: 'buyer'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    // Verify the saved user
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.first_name).toBe(userData.first_name);
    expect(savedUser.last_name).toBe(userData.last_name);
    expect(savedUser.role).toBe(userData.role);
    expect(savedUser.email_verified).toBe(false);
    expect(savedUser.status).toBe('active');
  });

  it('should hash the password before saving', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User'
    };

    const user = new User(userData);
    await user.save();

    // Fetch the user with password
    const savedUser = await User.findOne({ email: userData.email }).select('+password');
    
    // Password should be hashed, not plaintext
    expect(savedUser.password).not.toBe(userData.password);
    expect(savedUser.password).toBeDefined();
    expect(savedUser.password.length).toBeGreaterThan(0);
  });

  it('should correctly compare passwords', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User'
    };

    const user = new User(userData);
    await user.save();

    // Fetch the user with password
    const savedUser = await User.findOne({ email: userData.email }).select('+password');
    
    // Test correct password
    const isMatch = await savedUser.comparePassword('password123');
    expect(isMatch).toBe(true);
    
    // Test incorrect password
    const isNotMatch = await savedUser.comparePassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });

  it('should generate a valid JWT token', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
      role: 'buyer'
    };

    const user = new User(userData);
    await user.save();

    const token = user.generateAuthToken();
    expect(token).toBeDefined();
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toEqual(user._id.toString());
    expect(decoded.role).toBe(user.role);
  });

  it('should generate a password reset token', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User'
    };

    const user = new User(userData);
    await user.save();

    const resetToken = user.generatePasswordResetToken();
    expect(resetToken).toBeDefined();
    expect(user.reset_password_token).toBeDefined();
    expect(user.reset_password_expires).toBeDefined();
    
    // Verify expiration is in the future
    expect(user.reset_password_expires).toBeInstanceOf(Date);
    expect(user.reset_password_expires.getTime()).toBeGreaterThan(Date.now());
  });

  it('should generate an email verification token', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User'
    };

    const user = new User(userData);
    await user.save();

    const verificationToken = user.generateVerificationToken();
    expect(verificationToken).toBeDefined();
    expect(user.verification_token).toBeDefined();
    expect(user.verification_token).toBe(verificationToken);
  });

  it('should have a virtual for full name', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User'
    };

    const user = new User(userData);
    expect(user.full_name).toBe('Test User');
  });

  it('should require email, password, first_name, and last_name', async () => {
    const user = new User({});
    
    let validationError;
    try {
      await user.validate();
    } catch (error) {
      validationError = error;
    }
    
    expect(validationError).toBeDefined();
    expect(validationError.errors.email).toBeDefined();
    expect(validationError.errors.password).toBeDefined();
    expect(validationError.errors.first_name).toBeDefined();
    expect(validationError.errors.last_name).toBeDefined();
  });

  it('should validate email format', async () => {
    const userData = {
      email: 'invalid-email',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User'
    };

    const user = new User(userData);
    
    let validationError;
    try {
      await user.validate();
    } catch (error) {
      validationError = error;
    }
    
    expect(validationError).toBeDefined();
    expect(validationError.errors.email).toBeDefined();
  });
});