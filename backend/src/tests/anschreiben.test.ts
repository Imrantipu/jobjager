import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import anschreibenRoutes from '../routes/anschreiben.routes';
import applicationRoutes from '../routes/application.routes';
import jobRoutes from '../routes/job.routes';
import authRoutes from '../routes/auth.routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authenticate } from '../middleware/auth.middleware';
import { AnschreibenService } from '../services/anschreiben.service';

const prisma = new PrismaClient();
const app = express();

// Setup middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/jobs', authenticate, jobRoutes);
app.use('/api/applications', authenticate, applicationRoutes);
app.use('/api/anschreiben', authenticate, anschreibenRoutes);

describe('Anschreiben API', () => {
  let authToken: string;
  let testJobId: string;
  let testApplicationId: string;
  let testAnschreibenId: string;

  const testUser = {
    email: `anschtest${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Ansch',
    lastName: 'Tester',
  };

  const testJob = {
    companyName: 'Tech Corp',
    positionTitle: 'Frontend Developer',
    jobDescription: 'Build amazing web applications',
    location: 'Berlin, Germany',
  };

  const testAnschreiben = {
    title: 'Cover Letter for Tech Corp',
    content: 'Sehr geehrte Damen und Herren,\n\nhiermit bewerbe ich mich...',
    isTemplate: false,
  };

  // Setup: Register, login, create job and application
  beforeAll(async () => {
    // Register user
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const cookies = loginRes.headers['set-cookie'];
    authToken = cookies[0].split(';')[0].split('=')[1];

    // Create a job
    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Cookie', [`token=${authToken}`])
      .send(testJob);
    testJobId = jobRes.body.data.job.id;

    // Create an application
    const appRes = await request(app)
      .post('/api/applications')
      .set('Cookie', [`token=${authToken}`])
      .send({ jobId: testJobId, status: 'TO_APPLY' });
    testApplicationId = appRes.body.data.application.id;
  });

  // Cleanup
  afterAll(async () => {
    try {
      await prisma.anschreiben.deleteMany({
        where: { user: { email: { contains: 'anschtest' } } },
      });
      await prisma.application.deleteMany({
        where: { user: { email: { contains: 'anschtest' } } },
      });
      await prisma.job.deleteMany({
        where: { user: { email: { contains: 'anschtest' } } },
      });
      await prisma.user.deleteMany({
        where: { email: { contains: 'anschtest' } },
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
    await prisma.$disconnect();
  });

  describe('POST /api/anschreiben', () => {
    it('should create a new Anschreiben successfully', async () => {
      const response = await request(app)
        .post('/api/anschreiben')
        .set('Cookie', [`token=${authToken}`])
        .send({
          ...testAnschreiben,
          applicationId: testApplicationId,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.anschreiben).toHaveProperty('id');
      expect(response.body.data.anschreiben.title).toBe(testAnschreiben.title);
      expect(response.body.data.anschreiben.content).toBe(testAnschreiben.content);

      testAnschreibenId = response.body.data.anschreiben.id;
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/anschreiben')
        .send(testAnschreiben)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/anschreiben')
        .set('Cookie', [`token=${authToken}`])
        .send({ title: 'Missing content' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should create Anschreiben without application link', async () => {
      const response = await request(app)
        .post('/api/anschreiben')
        .set('Cookie', [`token=${authToken}`])
        .send(testAnschreiben)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.anschreiben.applicationId).toBeNull();
    });

    it('should return 500 for unexpected errors', async () => {
      jest.spyOn(AnschreibenService, 'create').mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .post('/api/anschreiben')
        .set('Cookie', [`token=${authToken}`])
        .send(testAnschreiben)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/anschreiben', () => {
    it('should get all Anschreiben for authenticated user', async () => {
      const response = await request(app)
        .get('/api/anschreiben')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.anschreiben)).toBe(true);
      expect(response.body.data.anschreiben.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/anschreiben')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should filter by template status', async () => {
      const response = await request(app)
        .get('/api/anschreiben?isTemplate=false')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.anschreiben.every((a: any) => a.isTemplate === false)).toBe(true);
    });

    it('should return 500 for unexpected errors', async () => {
      jest.spyOn(AnschreibenService, 'getAllByUser').mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .get('/api/anschreiben')
        .set('Cookie', [`token=${authToken}`])
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/anschreiben/:id', () => {
    it('should get a specific Anschreiben by id', async () => {
      const response = await request(app)
        .get(`/api/anschreiben/${testAnschreibenId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.anschreiben.id).toBe(testAnschreibenId);
      expect(response.body.data.anschreiben.title).toBe(testAnschreiben.title);
    });

    it('should return 404 for non-existent Anschreiben', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/anschreiben/${fakeId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 500 for unexpected errors', async () => {
      jest.spyOn(AnschreibenService, 'getById').mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .get(`/api/anschreiben/${testAnschreibenId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/anschreiben/:id', () => {
    it('should update an Anschreiben successfully', async () => {
      const updatedData = {
        title: 'Updated Cover Letter',
        content: 'Updated content with new information',
      };

      const response = await request(app)
        .put(`/api/anschreiben/${testAnschreibenId}`)
        .set('Cookie', [`token=${authToken}`])
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.anschreiben.title).toBe(updatedData.title);
      expect(response.body.data.anschreiben.content).toBe(updatedData.content);
    });

    it('should return 404 for non-existent Anschreiben', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/anschreiben/${fakeId}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put(`/api/anschreiben/${testAnschreibenId}`)
        .send({ title: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/anschreiben/application/:applicationId', () => {
    it('should get Anschreiben for a specific application', async () => {
      const response = await request(app)
        .get(`/api/anschreiben/application/${testApplicationId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.anschreiben)).toBe(true);
      expect(response.body.data.anschreiben.length).toBeGreaterThan(0);
      expect(response.body.data.anschreiben[0].applicationId).toBe(testApplicationId);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/anschreiben/application/${testApplicationId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/anschreiben/:id/duplicate', () => {
    it.skip('should duplicate an Anschreiben successfully', async () => {
      // Create a fresh anschreiben for duplication
      const createRes = await request(app)
        .post('/api/anschreiben')
        .set('Cookie', [`token=${authToken}`])
        .send({
          title: 'Original for Duplication',
          content: 'Test content for duplication test that is longer than 10 characters',
          isTemplate: false,
        })
        .expect(201);

      const originalId = createRes.body.data.anschreiben.id;

      const response = await request(app)
        .post(`/api/anschreiben/${originalId}/duplicate`)
        .set('Cookie', [`token=${authToken}`])
        .send({ title: 'Duplicated Cover Letter' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.anschreiben).toHaveProperty('id');
      expect(response.body.data.anschreiben.id).not.toBe(originalId);
      expect(response.body.data.anschreiben.title).toBe('Duplicated Cover Letter');
    });

    it.skip('should return 404 for non-existent Anschreiben', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post(`/api/anschreiben/${fakeId}/duplicate`)
        .set('Cookie', [`token=${authToken}`])
        .send({ title: 'Duplicated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/anschreiben/statistics', () => {
    it('should return Anschreiben statistics', async () => {
      const response = await request(app)
        .get('/api/anschreiben/statistics')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.statistics).toHaveProperty('total');
      expect(typeof response.body.data.statistics.total).toBe('number');
      expect(response.body.data.statistics.total).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/anschreiben/statistics')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/anschreiben/:id', () => {
    it('should delete an Anschreiben successfully', async () => {
      const response = await request(app)
        .delete(`/api/anschreiben/${testAnschreibenId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 for already deleted Anschreiben', async () => {
      const response = await request(app)
        .delete(`/api/anschreiben/${testAnschreibenId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/anschreiben/${testAnschreibenId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
