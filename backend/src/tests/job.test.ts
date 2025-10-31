import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import jobRoutes from '../routes/job.routes';
import authRoutes from '../routes/auth.routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authenticate } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
const app = express();

// Setup middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/jobs', authenticate, jobRoutes);

describe('Job API', () => {
  let authToken: string;
  let testJobId: string;

  const testUser = {
    email: `jobtest${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Job',
    lastName: 'Tester',
  };

  const testJob = {
    companyName: 'Tech Corp',
    positionTitle: 'Frontend Developer',
    jobDescription: 'Build amazing web applications with React and TypeScript',
    location: 'Berlin, Germany',
    salaryRange: '€50,000 - €70,000',
    techStack: ['React', 'TypeScript', 'Node.js'],
    sourceUrl: 'https://example.com/job',
    sourcePlatform: 'LinkedIn',
    isSaved: true,
  };

  // Setup: Register and login user
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
  });

  // Cleanup
  afterAll(async () => {
    try {
      await prisma.job.deleteMany({
        where: { user: { email: { contains: 'jobtest' } } },
      });
      await prisma.user.deleteMany({
        where: { email: { contains: 'jobtest' } },
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
    await prisma.$disconnect();
  });

  describe('POST /api/jobs', () => {
    it('should create a new job successfully', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set('Cookie', [`token=${authToken}`])
        .send(testJob)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.job).toHaveProperty('id');
      expect(response.body.data.job.companyName).toBe(testJob.companyName);
      expect(response.body.data.job.positionTitle).toBe(testJob.positionTitle);
      expect(response.body.data.job.techStack).toEqual(testJob.techStack);

      testJobId = response.body.data.job.id;
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .send(testJob)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set('Cookie', [`token=${authToken}`])
        .send({ companyName: 'Test Corp' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should create job with minimal required fields', async () => {
      const minimalJob = {
        companyName: 'Minimal Corp',
        positionTitle: 'Developer',
      };

      const response = await request(app)
        .post('/api/jobs')
        .set('Cookie', [`token=${authToken}`])
        .send(minimalJob)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.job.companyName).toBe(minimalJob.companyName);
    });
  });

  describe('GET /api/jobs', () => {
    it('should get all jobs for authenticated user', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.jobs)).toBe(true);
      expect(response.body.data.jobs.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/jobs?page=1&limit=5')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.jobs.length).toBeLessThanOrEqual(5);
    });

    it('should filter by company name', async () => {
      const response = await request(app)
        .get(`/api/jobs?companyName=${encodeURIComponent('Tech Corp')}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.jobs.length).toBeGreaterThan(0);
      expect(response.body.data.jobs.every((job: any) => job.companyName === 'Tech Corp')).toBe(true);
    });

    it('should filter by saved status', async () => {
      const response = await request(app)
        .get('/api/jobs?isSaved=true')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.jobs.every((job: any) => job.isSaved === true)).toBe(true);
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('should get a specific job by id', async () => {
      const response = await request(app)
        .get(`/api/jobs/${testJobId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.job.id).toBe(testJobId);
      expect(response.body.data.job.companyName).toBe(testJob.companyName);
    });

    it('should return 404 for non-existent job', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/jobs/${fakeId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/jobs/${testJobId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/jobs/:id', () => {
    it('should update a job successfully', async () => {
      const updatedData = {
        companyName: 'Tech Corp Updated',
        positionTitle: 'Senior Frontend Developer',
        salaryRange: '€60,000 - €80,000',
      };

      const response = await request(app)
        .put(`/api/jobs/${testJobId}`)
        .set('Cookie', [`token=${authToken}`])
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.job.companyName).toBe(updatedData.companyName);
      expect(response.body.data.job.positionTitle).toBe(updatedData.positionTitle);
    });

    it('should return 404 for non-existent job', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/jobs/${fakeId}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ companyName: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put(`/api/jobs/${testJobId}`)
        .send({ companyName: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });


  describe('GET /api/jobs/search', () => {
    it('should search jobs by query', async () => {
      const response = await request(app)
        .get('/api/jobs/search?q=Frontend')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.jobs)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/jobs/search?q=NonexistentTechnology123')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.jobs.length).toBe(0);
    });

    it('should return 400 for missing query', async () => {
      const response = await request(app)
        .get('/api/jobs/search')
        .set('Cookie', [`token=${authToken}`])
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/jobs/statistics', () => {
    it('should return job statistics', async () => {
      const response = await request(app)
        .get('/api/jobs/statistics')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.statistics).toHaveProperty('total');
      expect(response.body.data.statistics).toHaveProperty('saved');
      expect(typeof response.body.data.statistics.total).toBe('number');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/jobs/statistics')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/jobs/:id', () => {
    it('should delete a job successfully', async () => {
      const response = await request(app)
        .delete(`/api/jobs/${testJobId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 for already deleted job', async () => {
      const response = await request(app)
        .delete(`/api/jobs/${testJobId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/jobs/${testJobId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
