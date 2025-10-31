import { Router } from 'express';
import {
  createCV,
  getAllCVs,
  getCVById,
  getDefaultCV,
  updateCV,
  setDefaultCV,
  deleteCV,
  duplicateCV,
  getCVStatistics,
} from '../controllers/cv.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  createCVSchema,
  updateCVSchema,
  duplicateCVSchema,
} from '../validators/cv.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/cvs/statistics:
 *   get:
 *     summary: Get CV statistics
 *     description: Retrieve statistics about CVs for the authenticated user
 *     tags: [CVs]
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
 *                           example: 5
 *                         default:
 *                           type: number
 *                           example: 1
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/statistics', getCVStatistics);

/**
 * @swagger
 * /api/cvs/default:
 *   get:
 *     summary: Get default CV
 *     description: Retrieve the default CV for the authenticated user
 *     tags: [CVs]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Default CV retrieved successfully
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
 *                     cv:
 *                       $ref: '#/components/schemas/CV'
 *       404:
 *         description: No default CV found
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
router.get('/default', getDefaultCV);

/**
 * @swagger
 * /api/cvs:
 *   post:
 *     summary: Create a new CV
 *     description: Create a new CV with personal info, experience, education, skills, and languages
 *     tags: [CVs]
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
 *               - personalInfo
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 example: Frontend Developer CV
 *               personalInfo:
 *                 type: object
 *                 required:
 *                   - fullName
 *                   - email
 *                   - phone
 *                 properties:
 *                   fullName:
 *                     type: string
 *                     maxLength: 200
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: john.doe@example.com
 *                   phone:
 *                     type: string
 *                     maxLength: 50
 *                     example: +49 123 456789
 *                   address:
 *                     type: string
 *                     maxLength: 200
 *                     example: Hauptstrasse 123
 *                   city:
 *                     type: string
 *                     maxLength: 100
 *                     example: Berlin
 *                   country:
 *                     type: string
 *                     maxLength: 100
 *                     example: Germany
 *                   postalCode:
 *                     type: string
 *                     maxLength: 20
 *                     example: 10115
 *                   dateOfBirth:
 *                     type: string
 *                     example: 1990-01-15
 *                   nationality:
 *                     type: string
 *                     maxLength: 100
 *                     example: German
 *                   linkedIn:
 *                     type: string
 *                     format: uri
 *                     example: https://linkedin.com/in/johndoe
 *                   github:
 *                     type: string
 *                     format: uri
 *                     example: https://github.com/johndoe
 *                   website:
 *                     type: string
 *                     format: uri
 *                     example: https://johndoe.com
 *                   summary:
 *                     type: string
 *                     maxLength: 1000
 *                     example: Experienced frontend developer with 5 years in React
 *               experience:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - company
 *                     - position
 *                     - startDate
 *                     - current
 *                     - description
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: exp-1
 *                     company:
 *                       type: string
 *                       maxLength: 200
 *                       example: Tech Corp GmbH
 *                     position:
 *                       type: string
 *                       maxLength: 200
 *                       example: Senior Frontend Developer
 *                     location:
 *                       type: string
 *                       maxLength: 200
 *                       example: Berlin, Germany
 *                     startDate:
 *                       type: string
 *                       example: 2020-01-01
 *                     endDate:
 *                       type: string
 *                       example: 2023-12-31
 *                     current:
 *                       type: boolean
 *                       example: false
 *                     description:
 *                       type: string
 *                       maxLength: 2000
 *                       example: Developed and maintained React applications
 *                     achievements:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [Improved performance by 50%, Led team of 5 developers]
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - institution
 *                     - degree
 *                     - fieldOfStudy
 *                     - startDate
 *                     - current
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: edu-1
 *                     institution:
 *                       type: string
 *                       maxLength: 200
 *                       example: Technical University of Berlin
 *                     degree:
 *                       type: string
 *                       maxLength: 200
 *                       example: Bachelor of Science
 *                     fieldOfStudy:
 *                       type: string
 *                       maxLength: 200
 *                       example: Computer Science
 *                     location:
 *                       type: string
 *                       maxLength: 200
 *                       example: Berlin, Germany
 *                     startDate:
 *                       type: string
 *                       example: 2015-09-01
 *                     endDate:
 *                       type: string
 *                       example: 2019-06-30
 *                     current:
 *                       type: boolean
 *                       example: false
 *                     grade:
 *                       type: string
 *                       maxLength: 50
 *                       example: 1.5
 *                     description:
 *                       type: string
 *                       maxLength: 1000
 *                       example: Focused on web technologies and software engineering
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - category
 *                     - name
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: skill-1
 *                     category:
 *                       type: string
 *                       maxLength: 100
 *                       example: Frontend
 *                     name:
 *                       type: string
 *                       maxLength: 100
 *                       example: React
 *                     level:
 *                       type: string
 *                       enum: [Beginner, Intermediate, Advanced, Expert]
 *                       example: Advanced
 *               languages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - name
 *                     - level
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: lang-1
 *                     name:
 *                       type: string
 *                       maxLength: 100
 *                       example: German
 *                     level:
 *                       type: string
 *                       enum: [A1, A2, B1, B2, C1, C2, Native]
 *                       example: Native
 *                     description:
 *                       type: string
 *                       maxLength: 500
 *                       example: Native speaker
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: CV created successfully
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
 *                   example: CV created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     cv:
 *                       $ref: '#/components/schemas/CV'
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
router.post('/', validate(createCVSchema), createCV);

/**
 * @swagger
 * /api/cvs:
 *   get:
 *     summary: Get all CVs
 *     description: Retrieve all CVs for the authenticated user
 *     tags: [CVs]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: CVs retrieved successfully
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
 *                     cvs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CV'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAllCVs);

/**
 * @swagger
 * /api/cvs/{id}:
 *   get:
 *     summary: Get a specific CV
 *     description: Retrieve a single CV by ID
 *     tags: [CVs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: CV ID
 *     responses:
 *       200:
 *         description: CV retrieved successfully
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
 *                     cv:
 *                       $ref: '#/components/schemas/CV'
 *       404:
 *         description: CV not found
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
router.get('/:id', getCVById);

/**
 * @swagger
 * /api/cvs/{id}:
 *   put:
 *     summary: Update a CV
 *     description: Update an existing CV (at least one field required)
 *     tags: [CVs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: CV ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 example: Updated Frontend Developer CV
 *               personalInfo:
 *                 type: object
 *                 properties:
 *                   fullName:
 *                     type: string
 *                     maxLength: 200
 *                   email:
 *                     type: string
 *                     format: email
 *                   phone:
 *                     type: string
 *                     maxLength: 50
 *                   address:
 *                     type: string
 *                     maxLength: 200
 *                   city:
 *                     type: string
 *                     maxLength: 100
 *                   country:
 *                     type: string
 *                     maxLength: 100
 *                   postalCode:
 *                     type: string
 *                     maxLength: 20
 *                   dateOfBirth:
 *                     type: string
 *                   nationality:
 *                     type: string
 *                     maxLength: 100
 *                   linkedIn:
 *                     type: string
 *                     format: uri
 *                   github:
 *                     type: string
 *                     format: uri
 *                   website:
 *                     type: string
 *                     format: uri
 *                   summary:
 *                     type: string
 *                     maxLength: 1000
 *               experience:
 *                 type: array
 *                 items:
 *                   type: object
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *               languages:
 *                 type: array
 *                 items:
 *                   type: object
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: CV updated successfully
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
 *                   example: CV updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     cv:
 *                       $ref: '#/components/schemas/CV'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: CV not found
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
router.put('/:id', validate(updateCVSchema), updateCV);

/**
 * @swagger
 * /api/cvs/{id}/default:
 *   patch:
 *     summary: Set CV as default
 *     description: Mark a specific CV as the default CV (unmarks any other default CV)
 *     tags: [CVs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: CV ID
 *     responses:
 *       200:
 *         description: CV set as default successfully
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
 *                   example: CV set as default successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     cv:
 *                       $ref: '#/components/schemas/CV'
 *       404:
 *         description: CV not found
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
router.patch('/:id/default', setDefaultCV);

/**
 * @swagger
 * /api/cvs/{id}/duplicate:
 *   post:
 *     summary: Duplicate a CV
 *     description: Create a copy of an existing CV with an optional new title
 *     tags: [CVs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: CV ID to duplicate
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 example: Frontend Developer CV (Copy)
 *                 description: Optional new title for the duplicated CV
 *     responses:
 *       201:
 *         description: CV duplicated successfully
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
 *                   example: CV duplicated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     cv:
 *                       $ref: '#/components/schemas/CV'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: CV not found
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
router.post('/:id/duplicate', validate(duplicateCVSchema), duplicateCV);

/**
 * @swagger
 * /api/cvs/{id}:
 *   delete:
 *     summary: Delete a CV
 *     description: Delete a CV permanently
 *     tags: [CVs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: CV ID
 *     responses:
 *       200:
 *         description: CV deleted successfully
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
 *                   example: CV deleted successfully
 *       404:
 *         description: CV not found
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
router.delete('/:id', deleteCV);

export default router;
