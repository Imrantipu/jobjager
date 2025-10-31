import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JobJäger API Documentation',
      version: '1.0.0',
      description:
        'Complete API documentation for JobJäger - An AI-Powered Job Application Manager for the German job market',
      contact: {
        name: 'API Support',
        email: 'support@jobjager.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.jobjager.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in httpOnly cookie',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Job: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            companyName: { type: 'string' },
            positionTitle: { type: 'string' },
            jobDescription: { type: 'string' },
            location: { type: 'string' },
            salaryRange: { type: 'string' },
            techStack: { type: 'array', items: { type: 'string' } },
            sourceUrl: { type: 'string', format: 'uri' },
            sourcePlatform: { type: 'string' },
            isSaved: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Application: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            jobId: { type: 'string', format: 'uuid' },
            cvId: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['TO_APPLY', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'],
            },
            appliedDate: { type: 'string', format: 'date-time' },
            followUpDate: { type: 'string', format: 'date-time' },
            interviewDate: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
            contactPerson: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CV: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            personalInfo: { type: 'object' },
            experience: { type: 'array', items: { type: 'object' } },
            education: { type: 'array', items: { type: 'object' } },
            skills: { type: 'array', items: { type: 'object' } },
            languages: { type: 'array', items: { type: 'object' } },
            isDefault: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Anschreiben: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            applicationId: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            content: { type: 'string' },
            isTemplate: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Jobs',
        description: 'Job posting management endpoints',
      },
      {
        name: 'Applications',
        description: 'Job application tracking endpoints',
      },
      {
        name: 'CVs',
        description: 'CV builder and management endpoints',
      },
      {
        name: 'Anschreiben',
        description: 'German cover letter (Anschreiben) management endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to API routes with JSDoc comments
};

export const swaggerSpec = swaggerJsdoc(options);
