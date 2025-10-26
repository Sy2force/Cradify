const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Card = require('../src/models/card.model');

// Set test environment
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_testing_purposes_only_minimum_32_characters_required';
process.env.NODE_ENV = 'test';

const TEST_DB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cardify_test';

describe('Cards API Tests', () => {
  let authToken;
  let businessToken;
  let adminToken;
  let userId;
  let businessUserId;
  let adminUserId;
  let cardId;

  const testUser = {
    name: { first: 'John', last: 'Doe' },
    email: 'user@example.com',
    password: 'Password123!',
    phone: '05-1234567',
    address: { country: 'Israel', city: 'Tel Aviv', street: 'Rothschild', houseNumber: 1, zip: 12345 },
    isBusiness: false
  };

  const businessUser = {
    name: { first: 'Business', last: 'Owner' },
    email: 'business@example.com',
    password: 'Password123!',
    phone: '05-1234568',
    address: { country: 'Israel', city: 'Tel Aviv', street: 'Dizengoff', houseNumber: 2, zip: 12345 },
    isBusiness: true
  };

  const adminUser = {
    name: { first: 'Admin', last: 'User' },
    email: 'admin@example.com',
    password: 'Password123!',
    phone: '05-1234569',
    address: { country: 'Israel', city: 'Tel Aviv', street: 'Ben Yehuda', houseNumber: 3, zip: 12345 },
    isBusiness: false,
    isAdmin: true
  };

  const testCard = {
    title: 'Test Business Card',
    subtitle: 'Professional Services',
    description: 'We provide excellent professional services',
    phone: '05-9876543',
    email: 'contact@testbusiness.com',
    web: 'https://testbusiness.com',
    address: {
      country: 'Israel',
      city: 'Tel Aviv',
      street: 'Allenby',
      houseNumber: 10,
      zip: 12345
    }
  };

  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(TEST_DB_URI);
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Card.deleteMany({});

    // Create test users and get tokens
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    authToken = userResponse.body.token;
    userId = userResponse.body.user._id;

    const businessResponse = await request(app)
      .post('/api/auth/register')
      .send(businessUser);
    businessToken = businessResponse.body.token;
    businessUserId = businessResponse.body.user._id;

    // Create admin user manually
    const admin = new User(adminUser);
    await admin.save();
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLogin.body.token;
    adminUserId = adminLogin.body.user._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Card.deleteMany({});
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });

  describe('POST /api/cards', () => {
    it('should create a card for business user', async () => {
      const response = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${businessToken}`)
        .send(testCard)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.card).toHaveProperty('title', testCard.title);
      expect(response.body.card).toHaveProperty('bizNumber');
      cardId = response.body.card._id;
    });

    it('should not create card for regular user', async () => {
      const response = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCard)
        .expect(403);

      expect(response.body.message).toContain('Business access required');
    });

    it('should not create card without authentication', async () => {
      await request(app)
        .post('/api/cards')
        .send(testCard)
        .expect(401);
    });
  });

  describe('GET /api/cards', () => {
    beforeEach(async () => {
      // Create a test card
      await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${businessToken}`)
        .send(testCard);
    });

    it('should get all cards', async () => {
      const response = await request(app)
        .get('/api/cards')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.cards).toHaveLength(1);
      expect(response.body.cards[0]).toHaveProperty('title', testCard.title);
    });

    it('should search cards by title', async () => {
      const response = await request(app)
        .get('/api/cards?search=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.cards).toHaveLength(1);
    });
  });

  describe('GET /api/cards/:id', () => {
    beforeEach(async () => {
      const cardResponse = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${businessToken}`)
        .send(testCard);
      cardId = cardResponse.body.card._id;
    });

    it('should get card by ID', async () => {
      const response = await request(app)
        .get(`/api/cards/${cardId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.card).toHaveProperty('_id', cardId);
    });

    it('should return 404 for non-existent card', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/cards/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/cards/:id', () => {
    beforeEach(async () => {
      const cardResponse = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${businessToken}`)
        .send(testCard);
      cardId = cardResponse.body.card._id;
    });

    it('should update own card', async () => {
      const updateData = { title: 'Updated Card Title' };
      
      const response = await request(app)
        .put(`/api/cards/${cardId}`)
        .set('Authorization', `Bearer ${businessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.card.title).toBe('Updated Card Title');
    });

    it('should not update other user card', async () => {
      const updateData = { title: 'Hacked Title' };
      
      await request(app)
        .put(`/api/cards/${cardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should allow admin to update any card', async () => {
      const updateData = { title: 'Admin Updated' };
      
      const response = await request(app)
        .put(`/api/cards/${cardId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.card.title).toBe('Admin Updated');
    });
  });

  describe('DELETE /api/cards/:id', () => {
    beforeEach(async () => {
      const cardResponse = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${businessToken}`)
        .send(testCard);
      cardId = cardResponse.body.card._id;
    });

    it('should delete own card', async () => {
      const response = await request(app)
        .delete(`/api/cards/${cardId}`)
        .set('Authorization', `Bearer ${businessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should not delete other user card', async () => {
      await request(app)
        .delete(`/api/cards/${cardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe('PATCH /api/cards/:id/like', () => {
    beforeEach(async () => {
      const cardResponse = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${businessToken}`)
        .send(testCard);
      cardId = cardResponse.body.card._id;
    });

    it('should like a card', async () => {
      const response = await request(app)
        .patch(`/api/cards/${cardId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.card.likes.some(like => like._id === userId)).toBe(true);
    });

    it('should unlike a card when already liked', async () => {
      // Like the card first
      await request(app)
        .patch(`/api/cards/${cardId}/like`)
        .set('Authorization', `Bearer ${authToken}`);

      // Unlike the card
      const response = await request(app)
        .patch(`/api/cards/${cardId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.card.likes.some(like => like._id === userId)).toBe(false);
    });

    it('should require authentication to like', async () => {
      await request(app)
        .patch(`/api/cards/${cardId}/like`)
        .expect(401);
    });
  });

  describe('GET /api/cards/my-cards', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${businessToken}`)
        .send(testCard);
    });

    it('should get user own cards', async () => {
      const response = await request(app)
        .get('/api/cards/my-cards')
        .set('Authorization', `Bearer ${businessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.cards).toHaveLength(1);
    });

    it('should return empty array for user with no cards', async () => {
      const response = await request(app)
        .get('/api/cards/my-cards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.cards).toHaveLength(0);
    });
  });
});
