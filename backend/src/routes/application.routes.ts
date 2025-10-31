import { Router } from 'express';
import {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getApplicationStatistics,
  getApplicationsByStatus,
  updateApplicationStatus,
} from '../controllers/application.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  createApplicationSchema,
  updateApplicationSchema,
  updateStatusSchema,
} from '../validators/application.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/applications/statistics:
 *   get:
 *     summary: Get application statistics
 *     description: Retrieve statistics about job applications by status
 *     tags: [Applications]
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
 *                         toApply:
 *                           type: number
 *                         applied:
 *                           type: number
 *                         interview:
 *                           type: number
 *                         offer:
 *                           type: number
 *                         rejected:
 *                           type: number
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/statistics', getApplicationStatistics);

/**
 * @swagger
 * /api/applications/kanban:
 *   get:
 *     summary: Get applications in Kanban view
 *     description: Retrieve applications grouped by status for Kanban board visualization
 *     tags: [Applications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Applications grouped by status
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
 *                     applications:
 *                       type: object
 *                       properties:
 *                         TO_APPLY:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Application'
 *                         APPLIED:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Application'
 *                         INTERVIEW:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Application'
 *                         OFFER:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Application'
 *                         REJECTED:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Application'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/kanban', getApplicationsByStatus);

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Create a new application
 *     description: Create a job application for tracking
 *     tags: [Applications]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               cvId:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174001
 *               status:
 *                 type: string
 *                 enum: [TO_APPLY, APPLIED, INTERVIEW, OFFER, REJECTED]
 *                 default: TO_APPLY
 *               appliedDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-15T10:00:00Z
 *               followUpDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-22T10:00:00Z
 *               interviewDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-29T14:00:00Z
 *               notes:
 *                 type: string
 *                 maxLength: 5000
 *                 example: Reached out via LinkedIn, awaiting response
 *               contactPerson:
 *                 type: string
 *                 maxLength: 200
 *                 example: Jane Smith - HR Manager
 *     responses:
 *       201:
 *         description: Application created successfully
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
 *                   example: Application created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     application:
 *                       $ref: '#/components/schemas/Application'
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
router.post('/', validate(createApplicationSchema), createApplication);

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Get all applications
 *     description: Retrieve all job applications with optional filters and pagination
 *     tags: [Applications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TO_APPLY, APPLIED, INTERVIEW, OFFER, REJECTED]
 *         description: Filter by application status
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
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
 *                     applications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Application'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAllApplications);

/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     summary: Get a specific application
 *     description: Retrieve a single application by ID with job and CV details
 *     tags: [Applications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application retrieved successfully
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
 *                     application:
 *                       $ref: '#/components/schemas/Application'
 *       404:
 *         description: Application not found
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
router.get('/:id', getApplicationById);

/**
 * @swagger
 * /api/applications/{id}:
 *   put:
 *     summary: Update an application
 *     description: Update application details (at least one field required)
 *     tags: [Applications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [TO_APPLY, APPLIED, INTERVIEW, OFFER, REJECTED]
 *               cvId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               appliedDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               followUpDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               interviewDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 maxLength: 5000
 *                 nullable: true
 *               contactPerson:
 *                 type: string
 *                 maxLength: 200
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Application updated successfully
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
 *                   example: Application updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     application:
 *                       $ref: '#/components/schemas/Application'
 *       400:
 *         description: Validation error
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
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', validate(updateApplicationSchema), updateApplication);

/**
 * @swagger
 * /api/applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     description: Update only the status of an application
 *     tags: [Applications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [TO_APPLY, APPLIED, INTERVIEW, OFFER, REJECTED]
 *                 example: INTERVIEW
 *     responses:
 *       200:
 *         description: Status updated successfully
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
 *                   example: Application status updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     application:
 *                       $ref: '#/components/schemas/Application'
 *       400:
 *         description: Validation error
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
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/status', validate(updateStatusSchema), updateApplicationStatus);

/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     summary: Delete an application
 *     description: Delete a job application
 *     tags: [Applications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application deleted successfully
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
 *                   example: Application deleted successfully
 *       404:
 *         description: Application not found
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
router.delete('/:id', deleteApplication);

export default router;
