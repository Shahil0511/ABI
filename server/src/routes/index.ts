import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '../config/logger';
import { asyncHandler } from '../middleware/asyncHandler';
import { validator } from '../middleware/validator';
import { healthCheckSchema } from '../middleware/system.validation';
import { apiRateLimit } from '../config/rateLimit';
import userRouter from "./userRoutes"
import newsRouter from "../routes/newsRoutes"

const router = Router();

// API Health Check Endpoint
router.get(
  '/health',
  apiRateLimit,
  validator(healthCheckSchema),
  asyncHandler(async (req: Request, res: Response) => {
    Logger.info('Health check requested', { 
      ip: req.ip,
      userAgent: req.headers['user-agent'] 
    });
    
    res.status(StatusCodes.OK).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || 'unknown',
      services: {
        database: 'connected',
        redis: 'connected'
      }
    });
  })
);

// Root Endpoint
router.get('/', (req: Request, res: Response) => {
  Logger.debug('Root endpoint accessed', { ip: req.ip });
  res.status(StatusCodes.OK).json({
    message: 'Server is running 🚀',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    documentation: '/api-docs',
    endpoints: [
      'GET /api/health',
      'GET /api/v1/...'
    ]
  });
});

router.use('/api', userRouter)
router.use('/api/news', newsRouter);

// API v1 Routes
const v1Router = Router();
v1Router.get('/example', (req, res) => {
  res.json({ message: 'API v1 working' });
});
router.use('/api/v1', v1Router);

// 404 Handler for undefined routes
router.use((req: Request, res: Response) => {
  Logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    headers: req.headers
  });
  
  res.status(StatusCodes.NOT_FOUND).json({
    error: 'Endpoint not found',
    timestamp: new Date().toISOString(),
    documentation: process.env.API_DOCS_URL || '/api-docs',
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/v1/example'
    ]
  });
});

export default router;