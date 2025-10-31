import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { connectDatabase } from './config/database';
import { swaggerSpec } from './config/swagger';

// Load environment variables from .env file
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import applicationRoutes from './routes/application.routes';
import cvRoutes from './routes/cv.routes';
import anschreibenRoutes from './routes/anschreiben.routes';

// Create Express application
const app = express();

// Get port from environment or use 5000 as default
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS - Allow frontend to communicate with backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies to be sent
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies (from forms)
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// ============================================
// API DOCUMENTATION
// ============================================

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'JobJäger API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Swagger JSON
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================
// ROUTES
// ============================================

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/cvs', cvRoutes);
app.use('/api/anschreiben', anschreibenRoutes);

// Health check route - test if server is running
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'JobJäger API is running!',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to JobJäger API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      jobs: '/api/jobs',
      applications: '/api/applications',
      cvs: '/api/cvs',
      anschreiben: '/api/anschreiben'
    }
  });
});

// 404 handler - Route not found
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
