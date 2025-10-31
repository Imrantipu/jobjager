import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import cvRoutes from '../routes/cv.routes';
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
app.use('/api/cvs', authenticate, cvRoutes);

describe('CV API', () => {
  let authToken: string;
  let testCVId: string;

  const testUser = {
    email: `cvtest${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'CV',
    lastName: 'Tester',
  };

  const testCV = {
    title: 'Full Stack Developer CV',
    personalInfo: {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+49 123 456789',
      city: 'Berlin',
      country: 'Germany',
      summary: 'Experienced full-stack developer',
    },
    experience: [
      {
        id: 'exp1',
        company: 'Tech Corp',
        position: 'Senior Developer',
        location: 'Berlin, Germany',
        startDate: '2020-01-01',
        endDate: '',
        current: true,
        description: 'Developing web applications',
        achievements: ['Built scalable APIs', 'Led team of 5 developers'],
      },
    ],
    education: [
      {
        id: 'edu1',
        institution: 'TU Berlin',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2015-09-01',
        endDate: '2019-07-01',
        current: false,
        grade: '1.5',
      },
    ],
    skills: [
      { id: 'skill1', category: 'Frontend', name: 'React', level: 'Advanced' },
      { id: 'skill2', category: 'Frontend', name: 'TypeScript', level: 'Advanced' },
      { id: 'skill3', category: 'Backend', name: 'Node.js', level: 'Expert' },
    ],
    languages: [
      { id: 'lang1', name: 'English', level: 'C2' },
      { id: 'lang2', name: 'German', level: 'B2' },
    ],
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
      await prisma.application.deleteMany({
        where: { user: { email: { contains: 'cvtest' } } },
      });
      await prisma.cV.deleteMany({
        where: { user: { email: { contains: 'cvtest' } } },
      });
      await prisma.user.deleteMany({
        where: { email: { contains: 'cvtest' } },
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
    await prisma.$disconnect();
  });

  describe('POST /api/cvs', () => {
    it('should create a new CV successfully', async () => {
      const response = await request(app)
        .post('/api/cvs')
        .set('Cookie', [`token=${authToken}`])
        .send(testCV)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cv).toHaveProperty('id');
      expect(response.body.data.cv.title).toBe(testCV.title);
      expect(response.body.data.cv.personalInfo).toEqual(testCV.personalInfo);

      testCVId = response.body.data.cv.id;
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/cvs')
        .send(testCV)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/cvs')
        .set('Cookie', [`token=${authToken}`])
        .send({ title: 'CV without required data' })

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing required fields in personalInfo', async () => {
      const response = await request(app)
        .post('/api/cvs')
        .set('Cookie', [`token=${authToken}`])
        .send({ title: 'CV with invalid personal info', personalInfo: { fullName: 'test' } })
                    .expect(400);
        
                  expect(response.body.success).toBe(false);
                });
        
                it('should return 400 for invalid experience data', async () => {
                  const response = await request(app)
                    .post('/api/cvs')
                    .set('Cookie', [`token=${authToken}`])
                    .send({ ...testCV, experience: [{ id: '1', company: 'test' }] })
                    .expect(400);
        
                  expect(response.body.success).toBe(false);
                });
        
                it('should return 400 for invalid education data', async () => {
                  const response = await request(app)
                    .post('/api/cvs')
                    .set('Cookie', [`token=${authToken}`])
                    .send({ ...testCV, education: [{ id: '1', institution: 'test' }] })
                    .expect(400);
        
                  expect(response.body.success).toBe(false);
                });
        
                it('should return 400 for invalid skills data', async () => {
                  const response = await request(app)
                    .post('/api/cvs')
                    .set('Cookie', [`token=${authToken}`])
                    .send({ ...testCV, skills: [{ id: '1', name: 'test' }] })
                    .expect(400);
        
                  expect(response.body.success).toBe(false);
                });
        
                it('should return 400 for invalid languages data', async () => {
                  const response = await request(app)
                    .post('/api/cvs')
                    .set('Cookie', [`token=${authToken}`])
                    .send({ ...testCV, languages: [{ id: '1', name: 'test' }] })
                    .expect(400);
        
                  expect(response.body.success).toBe(false);
                });
              });
  describe('GET /api/cvs', () => {
    it('should get all CVs for authenticated user', async () => {
      const response = await request(app)
        .get('/api/cvs')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.cvs)).toBe(true);
      expect(response.body.data.cvs.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/cvs')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/cvs/:id', () => {
    it('should get a specific CV by id', async () => {
      const response = await request(app)
        .get(`/api/cvs/${testCVId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cv.id).toBe(testCVId);
      expect(response.body.data.cv.title).toBe(testCV.title);
    });

    it('should return 404 for non-existent CV', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/cvs/${fakeId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/cvs/${testCVId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/cvs/:id', () => {
    it('should update a CV successfully', async () => {
      const updatedData = {
        title: 'Updated Full Stack Developer CV',
        personalInfo: {
          ...testCV.personalInfo,
          summary: 'Updated summary',
        },
        experience: testCV.experience,
        education: testCV.education,
        skills: testCV.skills,
        languages: testCV.languages,
      };

      const response = await request(app)
        .put(`/api/cvs/${testCVId}`)
        .set('Cookie', [`token=${authToken}`])
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cv.title).toBe(updatedData.title);
      expect(response.body.data.cv.personalInfo.summary).toBe(updatedData.personalInfo.summary);
    });

    it('should return 404 for non-existent CV', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/cvs/${fakeId}`)
        .set('Cookie', [`token=${authToken}`])
        .send(testCV)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put(`/api/cvs/${testCVId}`)
        .send(testCV)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/cvs/:id/default', () => {
    it('should set a CV as default', async () => {
      const response = await request(app)
        .patch(`/api/cvs/${testCVId}/default`)
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cv.isDefault).toBe(true);
    });

    it('should return 404 for non-existent CV', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .patch(`/api/cvs/${fakeId}/default`)
        .set('Cookie', [`token=${authToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/cvs/default', () => {
    it('should get the default CV', async () => {
      const response = await request(app)
        .get('/api/cvs/default')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cv.isDefault).toBe(true);
      expect(response.body.data.cv.id).toBe(testCVId);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/cvs/default')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/cvs/:id/duplicate', () => {
    it('should duplicate a CV successfully', async () => {
      const response = await request(app)
        .post(`/api/cvs/${testCVId}/duplicate`)
        .set('Cookie', [`token=${authToken}`])
        .send({ title: 'Duplicated CV' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cv).toHaveProperty('id');
      expect(response.body.data.cv.id).not.toBe(testCVId);
      expect(response.body.data.cv.title).toBe('Duplicated CV');
      expect(response.body.data.cv.personalInfo.fullName).toBe(testCV.personalInfo.fullName);
      expect(response.body.data.cv.personalInfo.email).toBe(testCV.personalInfo.email);
    });

    it('should return 404 for non-existent CV', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post(`/api/cvs/${fakeId}/duplicate`)
        .set('Cookie', [`token=${authToken}`])
        .send({ title: 'Duplicated CV' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/cvs/statistics', () => {
    it('should return CV statistics', async () => {
      const response = await request(app)
        .get('/api/cvs/statistics')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.statistics).toHaveProperty('total');
      expect(typeof response.body.data.statistics.total).toBe('number');
      expect(response.body.data.statistics.total).toBeGreaterThanOrEqual(2);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/cvs/statistics')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/cvs/:id', () => {
    it('should delete a CV successfully', async () => {
      const response = await request(app)
        .delete(`/api/cvs/${testCVId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 for already deleted CV', async () => {
      const response = await request(app)
        .delete(`/api/cvs/${testCVId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/cvs/${testCVId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
