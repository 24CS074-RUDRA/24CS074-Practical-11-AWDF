const request = require('supertest');
const app = require('./app');

describe('Task Management API', () => {
  test('GET /api/tasks rejects requests without authentication', async () => {
    const response = await request(app).get('/api/tasks');

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toMatch(/no token/i);
  });

  test('POST /api/auth/register rejects invalid registration data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Student' });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Validation failed');
    expect(response.body.details.map((detail) => detail.field)).toEqual(
      expect.arrayContaining(['email', 'password'])
    );
  });
});
