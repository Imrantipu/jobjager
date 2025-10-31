import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import applicationRoutes from '../routes/application.routes';
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
app.use('/api/applications', authenticate, applicationRoutes);

describe('Application API', () => {
  let authToken: string;
  let testJobId: string;
  let testApplicationId: string;

  const testUser = {
    email: `apptest${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'App',
    lastName: 'Tester',
  };

  const testJob = {
    companyName: 'Tech Corp',
    positionTitle: 'Frontend Developer',
    jobDescription: 'Build amazing web applications',
    location: 'Berlin, Germany',
  };

  const testApplication = {
    status: 'TO_APPLY',
    notes: 'Great opportunity at Tech Corp',
    contactPerson: 'Jane Smith',
  };

  // Setup: Register, login user, and create a job
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
    if (!cookies) {
      console.error('Login failed in beforeAll:', loginRes.body);
    }
    authToken = cookies[0].split(';')[0].split('=')[1];

    // Create a job for testing applications
    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Cookie', [`token=${authToken}`])
      .send(testJob);

    testJobId = jobRes.body.data.job.id;
  });

  // Cleanup
  afterAll(async () => {
    try {
      await prisma.anschreiben.deleteMany({
        where: { application: { user: { email: { contains: 'apptest' } } } },
      });
      await prisma.application.deleteMany({
        where: { user: { email: { contains: 'apptest' } } },
      });
      await prisma.job.deleteMany({
        where: { user: { email: { contains: 'apptest' } } },
      });
      await prisma.user.deleteMany({
        where: { email: { contains: 'apptest' } },
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
    await prisma.$disconnect();
  });

  describe('POST /api/applications', () => {
    it('should create a new application successfully', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Cookie', [`token=${authToken}`])
        .send({
          ...testApplication,
          jobId: testJobId,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.application).toHaveProperty('id');
      expect(response.body.data.application.jobId).toBe(testJobId);
      expect(response.body.data.application.status).toBe(testApplication.status);
      expect(response.body.data.application.notes).toBe(testApplication.notes);

      testApplicationId = response.body.data.application.id;
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/applications')
        .send({
          ...testApplication,
          jobId: testJobId,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Cookie', [`token=${authToken}`])
        .send({ notes: 'Missing jobId' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid jobId', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Cookie', [`token=${authToken}`])
        .send({ ...testApplication, jobId: 'invalid-uuid' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid cvId', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Cookie', [`token=${authToken}`])
        .send({ ...testApplication, jobId: testJobId, cvId: 'invalid-uuid' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid appliedDate', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Cookie', [`token=${authToken}`])
        .send({ ...testApplication, jobId: testJobId, appliedDate: 'invalid-date' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for notes exceeding max length', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Cookie', [`token=${authToken}`])
        .send({ ...testApplication, jobId: testJobId, notes: 'a'.repeat(5001) })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for contactPerson exceeding max length', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Cookie', [`token=${authToken}`])
        .send({ ...testApplication, jobId: testJobId, contactPerson: 'a'.repeat(201) })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should create application with minimal required fields', async () => {
      const minimalApplication = {
        jobId: testJobId,
      };

      const response = await request(app)
        .post('/api/applications')
        .set('Cookie', [`token=${authToken}`])
        .send(minimalApplication)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.application.jobId).toBe(testJobId);
    });
  });

  describe('GET /api/applications', () => {
    it('should get all applications for authenticated user', async () => {
      const response = await request(app)
        .get('/api/applications')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.applications)).toBe(true);
      expect(response.body.data.applications.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/applications')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/applications?page=1&limit=5')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.applications.length).toBeLessThanOrEqual(5);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/applications?status=TO_APPLY')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.applications.length).toBeGreaterThan(0);
      expect(response.body.data.applications.every((app: any) => app.status === 'TO_APPLY')).toBe(true);
    });
  });

  describe('GET /api/applications/:id', () => {
    it('should get a specific application by id', async () => {
      const response = await request(app)
        .get(`/api/applications/${testApplicationId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.application.id).toBe(testApplicationId);
      expect(response.body.data.application.jobId).toBe(testJobId);
    });

    it('should return 404 for non-existent application', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/applications/${fakeId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/applications/${testApplicationId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/applications/:id', () => {
    it('should update an application successfully', async () => {
      const updatedData = {
        status: 'APPLIED',
        notes: 'Updated notes - application submitted',
        contactPerson: 'John Doe',
      };

      const response = await request(app)
        .put(`/api/applications/${testApplicationId}`)
        .set('Cookie', [`token=${authToken}`])
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.application.status).toBe(updatedData.status);
      expect(response.body.data.application.notes).toBe(updatedData.notes);
      expect(response.body.data.application.contactPerson).toBe(updatedData.contactPerson);
    });

    it('should return 404 for non-existent application', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/applications/${fakeId}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ status: 'APPLIED' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put(`/api/applications/${testApplicationId}`)
        .send({ status: 'APPLIED' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for empty request body', async () => {
      const response = await request(app)
        .put(`/api/applications/${testApplicationId}`)
        .set('Cookie', [`token=${authToken}`])
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid cvId', async () => {
      const response = await request(app)
        .put(`/api/applications/${testApplicationId}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ cvId: 'invalid-uuid' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid appliedDate', async () => {
      const response = await request(app)
        .put(`/api/applications/${testApplicationId}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ appliedDate: 'invalid-date' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for notes exceeding max length', async () => {
      const response = await request(app)
        .put(`/api/applications/${testApplicationId}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ notes: 'a'.repeat(5001) })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for contactPerson exceeding max length', async () => {
      const response = await request(app)
        .put(`/api/applications/${testApplicationId}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ contactPerson: 'a'.repeat(201) })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/applications/:id/status', () => {
    it('should update application status only', async () => {
      const response = await request(app)
        .patch(`/api/applications/${testApplicationId}/status`)
        .set('Cookie', [`token=${authToken}`])
        .send({ status: 'INTERVIEW' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.application.status).toBe('INTERVIEW');
    });

    it('should return 404 for non-existent application', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .patch(`/api/applications/${fakeId}/status`)
        .set('Cookie', [`token=${authToken}`])
        .send({ status: 'APPLIED' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .patch(`/api/applications/${testApplicationId}/status`)
        .set('Cookie', [`token=${authToken}`])
        .send({ status: 'INVALID_STATUS' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/applications/statistics', () => {
    it('should return application statistics', async () => {
      const response = await request(app)
        .get('/api/applications/statistics')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.statistics).toHaveProperty('total');
      expect(response.body.data.statistics).toHaveProperty('byStatus');
      expect(response.body.data.statistics.byStatus).toHaveProperty('toApply');
      expect(response.body.data.statistics.byStatus).toHaveProperty('applied');
      expect(response.body.data.statistics.byStatus).toHaveProperty('interview');
      expect(response.body.data.statistics.byStatus).toHaveProperty('offer');
      expect(response.body.data.statistics.byStatus).toHaveProperty('rejected');
      expect(typeof response.body.data.statistics.total).toBe('number');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/applications/statistics')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/applications/kanban', () => {
    it('should return applications grouped by status', async () => {
      const response = await request(app)
        .get('/api/applications/kanban')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('TO_APPLY');
      expect(response.body.data).toHaveProperty('APPLIED');
      expect(response.body.data).toHaveProperty('INTERVIEW');
      expect(response.body.data).toHaveProperty('OFFER');
      expect(response.body.data).toHaveProperty('REJECTED');
      expect(Array.isArray(response.body.data.TO_APPLY)).toBe(true);
      expect(Array.isArray(response.body.data.APPLIED)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/applications/kanban')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/applications/:id', () => {
    it('should delete an application successfully', async () => {
      const response = await request(app)
        .delete(`/api/applications/${testApplicationId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 for already deleted application', async () => {
      const response = await request(app)
        .delete(`/api/applications/${testApplicationId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/applications/${testApplicationId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
