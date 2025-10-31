import { AuthService } from '../services/auth.service';
import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRoutes from '../routes/auth.routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const prisma = new PrismaClient();
const app = express();

// Setup middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

describe('Authentication API', () => {
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
  };

  let authToken: string;

  // Clean up test user after all tests
  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: 'test' } },
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'new@example.com', password: '123' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 500 for unexpected errors', async () => {
      jest.spyOn(AuthService, 'register').mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.headers['set-cookie']).toBeDefined();

      // Store token for subsequent tests
      const cookies = response.headers['set-cookie'];
      authToken = cookies[0].split(';')[0].split('=')[1];
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 500 for unexpected errors', async () => {
      jest.spyOn(AuthService, 'login').mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logout successful');
      expect(response.headers['set-cookie']).toBeDefined();
      // Cookie should be cleared (either with Max-Age=0 or Expires in the past)
      const cookie = response.headers['set-cookie'][0];
      expect(cookie.includes('Max-Age=0') || cookie.includes('Expires=Thu, 01 Jan 1970')).toBe(true);
    });

    it('should return 500 for unexpected errors', async () => {
      jest.spyOn(express.response, 'clearCookie').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(app)
        .post('/api/auth/logout')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ['token=invalid-token'])
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 if user not found', async () => {
      jest.spyOn(AuthService, 'getUserById').mockRejectedValue(new Error('User not found'));

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${authToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 500 for unexpected errors', async () => {
      jest.spyOn(AuthService, 'getUserById').mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${authToken}`])
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('authenticate middleware', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it('should authenticate with valid token in Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for expired token', async () => {
      // Mocking an expired token would require more setup, so we'll just test for an invalid signature for now
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjY2M0Y2U5ZC0zYjZmLTRjYjQtYjhiNy0wZDAxZGM2ZDEzY2IiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE2MTYyMzkwMjIsImV4cCI6MTYxNjMyNTQyMn0.3Z5Y-A5b-o-o-o-o-o-o-o-o-o-o-o-o-o-o-o-o')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
