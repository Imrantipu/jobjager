import { Router } from 'express';
import {
  generateAnschreiben,
  createAnschreiben,
  getAllAnschreiben,
  getAnschreibenById,
  updateAnschreiben,
  deleteAnschreiben,
  duplicateAnschreiben,
  refineAnschreiben,
  getAnschreibenStatistics,
  getAnschreibenByApplication,
} from '../controllers/anschreiben.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  generateAnschreibenSchema,
  createAnschreibenSchema,
  updateAnschreibenSchema,
  duplicateAnschreibenSchema,
  refineAnschreibenSchema,
} from '../validators/anschreiben.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/anschreiben/statistics:
 *   get:
 *     summary: Get Anschreiben statistics
 *     description: Retrieve statistics about cover letters for the authenticated user
 *     tags: [Anschreiben]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 15
 *                         templates:
 *                           type: number
 *                           example: 3
 *                         linked:
 *                           type: number
 *                           example: 10
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/statistics', getAnschreibenStatistics);

/**
 * @swagger
 * /api/anschreiben/generate:
 *   post:
 *     summary: Generate a new Anschreiben using AI
 *     description: Create a German cover letter using AI based on job description and applicant information
 *     tags: [Anschreiben]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobDescription
 *               - companyName
 *               - positionTitle
 *               - applicantName
 *               - applicantEmail
 *               - applicantPhone
 *             properties:
 *               applicationId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional application ID to link the cover letter to
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               jobDescription:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 5000
 *                 example: We are looking for a Full Stack Developer with experience in React and Node.js...
 *               companyName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: Tech Innovations GmbH
 *               positionTitle:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: Senior Full Stack Developer
 *               applicantName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: Max Mustermann
 *               applicantEmail:
 *                 type: string
 *                 format: email
 *                 example: max.mustermann@example.com
 *               applicantPhone:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: +49 176 12345678
 *               experience:
 *                 type: string
 *                 maxLength: 2000
 *                 example: 5 years of experience in web development with React and Node.js
 *               skills:
 *                 type: string
 *                 maxLength: 1000
 *                 example: React, TypeScript, Node.js, PostgreSQL, Docker
 *               education:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Bachelor of Science in Computer Science
 *               motivation:
 *                 type: string
 *                 maxLength: 1000
 *                 example: I am passionate about building scalable web applications
 *               saveAsTemplate:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Anschreiben generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Anschreiben generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     anschreiben:
 *                       $ref: '#/components/schemas/Anschreiben'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/generate', validate(generateAnschreibenSchema), generateAnschreiben);

/**
 * @swagger
 * /api/anschreiben/application/{applicationId}:
 *   get:
 *     summary: Get all Anschreiben for a specific application
 *     description: Retrieve all cover letters linked to a specific job application
 *     tags: [Anschreiben]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Anschreiben retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     anschreiben:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Anschreiben'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/application/:applicationId', getAnschreibenByApplication);

/**
 * @swagger
 * /api/anschreiben:
 *   post:
 *     summary: Create a new Anschreiben manually
 *     description: Create a cover letter manually without AI generation
 *     tags: [Anschreiben]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               applicationId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional application ID to link the cover letter to
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: Cover Letter - Tech Innovations GmbH
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 10000
 *                 example: Sehr geehrte Damen und Herren...
 *               isTemplate:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Anschreiben created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Anschreiben created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     anschreiben:
 *                       $ref: '#/components/schemas/Anschreiben'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validate(createAnschreibenSchema), createAnschreiben);

/**
 * @swagger
 * /api/anschreiben:
 *   get:
 *     summary: Get all Anschreiben
 *     description: Retrieve all cover letters for authenticated user with optional template filter
 *     tags: [Anschreiben]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: isTemplate
 *         schema:
 *           type: boolean
 *         description: Filter by template status
 *         example: true
 *     responses:
 *       200:
 *         description: Anschreiben retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     anschreiben:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Anschreiben'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAllAnschreiben);

/**
 * @swagger
 * /api/anschreiben/{id}:
 *   get:
 *     summary: Get a specific Anschreiben
 *     description: Retrieve a single cover letter by ID
 *     tags: [Anschreiben]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Anschreiben ID
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Anschreiben retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     anschreiben:
 *                       $ref: '#/components/schemas/Anschreiben'
 *       404:
 *         description: Anschreiben not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getAnschreibenById);

/**
 * @swagger
 * /api/anschreiben/{id}:
 *   put:
 *     summary: Update an Anschreiben
 *     description: Update an existing cover letter (at least one field required)
 *     tags: [Anschreiben]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Anschreiben ID
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: Updated Cover Letter Title
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 10000
 *                 example: Sehr geehrte Damen und Herren...
 *               isTemplate:
 *                 type: boolean
 *                 example: true
 *               applicationId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Anschreiben updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Anschreiben updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     anschreiben:
 *                       $ref: '#/components/schemas/Anschreiben'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Anschreiben not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', validate(updateAnschreibenSchema), updateAnschreiben);

/**
 * @swagger
 * /api/anschreiben/{id}/duplicate:
 *   post:
 *     summary: Duplicate an Anschreiben
 *     description: Create a copy of an existing cover letter with optional new title
 *     tags: [Anschreiben]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Anschreiben ID to duplicate
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: Copy of Cover Letter - Tech Innovations GmbH
 *     responses:
 *       201:
 *         description: Anschreiben duplicated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Anschreiben duplicated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     anschreiben:
 *                       $ref: '#/components/schemas/Anschreiben'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Anschreiben not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/duplicate', validate(duplicateAnschreibenSchema), duplicateAnschreiben);

/**
 * @swagger
 * /api/anschreiben/{id}/refine:
 *   post:
 *     summary: Refine an Anschreiben using AI
 *     description: Improve or modify an existing cover letter using AI based on provided instructions
 *     tags: [Anschreiben]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Anschreiben ID to refine
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - improvementInstructions
 *             properties:
 *               improvementInstructions:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 1000
 *                 example: Make it more formal and emphasize my leadership experience
 *     responses:
 *       200:
 *         description: Anschreiben refined successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Anschreiben refined successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     anschreiben:
 *                       $ref: '#/components/schemas/Anschreiben'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Anschreiben not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/refine', validate(refineAnschreibenSchema), refineAnschreiben);

/**
 * @swagger
 * /api/anschreiben/{id}:
 *   delete:
 *     summary: Delete an Anschreiben
 *     description: Delete a cover letter permanently
 *     tags: [Anschreiben]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Anschreiben ID
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Anschreiben deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Anschreiben deleted successfully
 *       404:
 *         description: Anschreiben not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', deleteAnschreiben);

export default router;
