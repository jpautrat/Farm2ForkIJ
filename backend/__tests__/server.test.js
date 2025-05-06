const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

// Import test setup
require('./setup');

describe('Server', () => {
  // Close database connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Health Check', () => {
    it('should return 200 OK with status information', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Route not found');
    });
  });
});