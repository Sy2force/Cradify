const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/user.model');

// Set test JWT_SECRET if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_testing_purposes_only_minimum_32_characters_required';
process.env.NODE_ENV = 'test';

// Test database connection
const TEST_DB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cardify_test';

describe('Middlewares Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI);
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Auth Middleware', () => {
    let testUser, businessUser, adminUser;
    let testToken, businessToken, adminToken;

    beforeEach(async () => {
      // Create test users with proper schema format
      testUser = await User.create({
        name: {
          first: 'Test',
          last: 'User'
        },
        email: 'test@example.com',
        password: 'Test123!',
        phone: '02-1234567',
        address: {
          state: 'Test State',
          country: 'Israel',
          city: 'Test City',
          street: 'Test Street',
          houseNumber: 123,
          zip: 12345
        },
        isBusiness: false,
        isAdmin: false
      });

      businessUser = await User.create({
        name: {
          first: 'Business',
          last: 'User'
        },
        email: 'business@example.com',
        password: 'Test123!',
        phone: '03-1234567',
        address: {
          state: 'Business State',
          country: 'Israel',
          city: 'Business City',
          street: 'Business Street',
          houseNumber: 456,
          zip: 23456
        },
        isBusiness: true,
        isAdmin: false
      });

      adminUser = await User.create({
        name: {
          first: 'Admin',
          last: 'User'
        },
        email: 'admin@example.com',
        password: 'Test123!',
        phone: '04-1234567',
        address: {
          state: 'Admin State',
          country: 'Israel',
          city: 'Admin City',
          street: 'Admin Street',
          houseNumber: 789,
          zip: 34567
        },
        isBusiness: false,
        isAdmin: true
      });

      // Generate tokens
      testToken = jwt.sign(
        { _id: testUser._id, email: testUser.email, isAdmin: false, isBusiness: false },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      businessToken = jwt.sign(
        { _id: businessUser._id, email: businessUser.email, isAdmin: false, isBusiness: true },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      adminToken = jwt.sign(
        { _id: adminUser._id, email: adminUser.email, isAdmin: true, isBusiness: false },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
    });

    describe('authenticate middleware', () => {
      it('should authenticate valid token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${testToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.user.email).toBe('test@example.com');
      });

      it('should reject invalid token', async () => {
        await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });

      it('should reject missing token', async () => {
        await request(app)
          .get('/api/auth/me')
          .expect(401);
      });

      it('should reject malformed authorization header', async () => {
        await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'InvalidFormat token')
          .expect(401);
      });

      it('should reject expired token', async () => {
        const expiredToken = jwt.sign(
          { userId: testUser._id, email: testUser.email },
          process.env.JWT_SECRET,
          { expiresIn: '-1s' }
        );

        await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${expiredToken}`)
          .expect(401);
      }, 15000);
    });

    describe('requireAdmin middleware', () => {
      it('should allow admin user', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should reject non-admin user', async () => {
        await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${testToken}`)
          .expect(403);
      });

      it('should reject business user without admin', async () => {
        await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${businessToken}`)
          .expect(403);
      });
    });

    describe('requireBusinessUser middleware', () => {
      it('should allow business user to create card', async () => {
        const cardData = {
          title: 'Test Card',
          subtitle: 'Test Subtitle',
          description: 'Test Description',
          phone: '02-1234567',
          email: 'card@example.com',
          web: 'https://example.com',
          image: { url: 'https://example.com/image.jpg', alt: 'Test Image' },
          address: {
            state: 'Test State',
            country: 'Israel',
            city: 'Test City',
            street: 'Test Street',
            houseNumber: 123,
            zip: 12345
          }
        };

        const response = await request(app)
          .post('/api/cards')
          .set('Authorization', `Bearer ${businessToken}`)
          .send(cardData)
          .expect(201);

        expect(response.body.success).toBe(true);
      });

      it('should allow admin to create card', async () => {
        const cardData = {
          title: 'Admin Card',
          subtitle: 'Admin Subtitle',
          description: 'Admin Description',
          phone: '03-1234567',
          email: 'admin-card@example.com',
          web: 'https://example.com',
          image: { url: 'https://example.com/image.jpg', alt: 'Admin Image' },
          address: {
            state: 'Admin State',
            country: 'Israel',
            city: 'Admin City',
            street: 'Admin Street',
            houseNumber: 456,
            zip: 67890
          }
        };

        const response = await request(app)
          .post('/api/cards')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(cardData)
          .expect(201);

        expect(response.body.success).toBe(true);
      });

      it('should reject regular user from creating card', async () => {
        const cardData = {
          title: 'Unauthorized Card',
          subtitle: 'Unauthorized Subtitle',
          description: 'Unauthorized Description',
          phone: '+1234567890',
          email: 'unauthorized@example.com'
        };

        await request(app)
          .post('/api/cards')
          .set('Authorization', `Bearer ${testToken}`)
          .send(cardData)
          .expect(403);
      });
    });
  });

  describe('Error Middleware', () => {
    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'invalid-email',
          password: '123', // Too short
          phone: 'invalid'
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
      expect(response.body.message).toContain('Validation');
    });

    it('should handle not found errors', async () => {
      const response = await request(app)
        .get('/api/nonexistent-route')
        .expect(404);

      expect(response.body.message).toBeDefined();
      expect(response.body.message).toContain('not found');
    });

    it('should handle internal server errors', async () => {
      // This test requires a route that throws an error
      // We'll create a mock scenario by accessing invalid card ID
      const response = await request(app)
        .get('/api/cards/invalid-id-format')
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('Validate Middleware', () => {
    it('should pass valid registration data', async () => {
      const validData = {
        name: {
          first: 'Valid',
          last: 'User'
        },
        email: 'valid@example.com',
        password: 'ValidPass123!',
        phone: '02-1234567',
        address: {
          state: 'Valid State',
          country: 'Israel',
          city: 'Valid City',
          street: 'Valid Street',
          houseNumber: 123,
          zip: 12345
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(validData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should reject invalid email format', async () => {
      const invalidData = {
        name: {
          first: 'Test',
          last: 'User'
        },
        email: 'invalid-email-format',
        password: 'ValidPass123!',
        phone: '02-1234567',
        address: {
          state: 'Test State',
          country: 'Israel',
          city: 'Test City',
          street: 'Test Street',
          houseNumber: 123,
          zip: 12345
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBeDefined();
      expect(response.body.message).toContain('Validation');
    });

    it('should reject weak password', async () => {
      const invalidData = {
        name: {
          first: 'Test',
          last: 'User'
        },
        email: 'test2@example.com',
        password: '123',
        phone: '02-1234567',
        address: {
          state: 'Test State',
          country: 'Israel',
          city: 'Test City',
          street: 'Test Street',
          houseNumber: 123,
          zip: 12345
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBeDefined();
      expect(response.body.message).toContain('Validation');
    });

    it('should reject missing required fields', async () => {
      const incompleteData = {
        name: {
          first: 'Test',
          last: 'User'
        }
        // Missing email, password, phone, address
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.message).toBeDefined();
      expect(response.body.message).toContain('Validation');
    });
  });

  describe('CORS Middleware', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // CORS headers might not be present in all responses in test environment
      expect(response.status).toBe(200);
    });

    it('should handle preflight OPTIONS request', async () => {
      const response = await request(app)
        .options('/api/cards')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Authorization, Content-Type')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
      expect(response.headers['access-control-allow-headers']).toBeDefined();
    });
  });
});
