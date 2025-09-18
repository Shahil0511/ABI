import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import { StatusCodes } from 'http-status-codes';
import Logger from './config/logger';
import errorHandler from './middleware/errorHandler';
import routes from './routes/index';

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173',"https://abi-saju.onrender.com"];

// Security Middleware
app.use(helmet()); // Security headers

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow curl, mobile apps, etc.

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ❌ Don’t crash → respond with explicit rejection
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Explicitly handle preflight OPTIONS everywhere
app.options('*', (req, res) => {
  res.sendStatus(200);
});


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      error: 'Too many requests, please try again later',
    });
  },
});
app.use(limiter);



// Body parsing
app.use(express.json({ limit: '10mb' })); // OK for JSON
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
app.use(
  morgan('dev', {
    stream: { write: (message: string) => Logger.http(message.trim()) },
  })
);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/', routes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    error: 'Endpoint not found',
  });
});

// Global error handler
app.use(errorHandler);

export default app;