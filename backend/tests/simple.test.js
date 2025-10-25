const request = require('supertest');
const app = require('../src/app');

describe('Simple API Tests', () => {
  it('should return health status', async () => {
    const res = await request(app)
      .get('/api/health');
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  it('should return 404 for non-existent routes', async () => {
    const res = await request(app)
      .get('/api/nonexistent');
    
    expect(res.status).toBe(404);
  });
});
