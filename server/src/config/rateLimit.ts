import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse } from '../config/response';
import Logger from '../config/logger';


const isProduction = process.env.NODE_ENV === 'production';


let redisClient: any = null;
let isRedisInitialized = false;

// Create Redis client with better error handling
const createRedisClient = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            Logger.error('Max Redis reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    client.on('error', (err: any) => {
      Logger.error('Redis client error:', err);
    });

    client.on('connect', () => {
      Logger.info('Redis connected successfully');
    });

    client.on('ready', () => {
      Logger.info('Redis client ready');
      isRedisInitialized = true;
    });

    client.on('end', () => {
      Logger.warn('Redis connection ended');
      isRedisInitialized = false;
    });

    await client.connect();
    return client;
  } catch (error) {
    Logger.error('Redis connection failed completely:', error);
    return null;
  }
};


// Initialize Redis immediately and export a promise
export const redisInitializationPromise = (async () => {
  try {
    redisClient = await createRedisClient();
    if (redisClient) {
      Logger.info('Redis initialized successfully for rate limiting');
    } else {
      Logger.warn('Redis initialization failed, using memory store');
    }
  } catch (error) {
    Logger.error('Failed to initialize Redis:', error);
    redisClient = null;
  }
})();


interface RateLimitOptions {
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  message?: string;
}


// Factory function that creates rate limiters with proper Redis check
function createRateLimiter(
  windowMs: number,
  max: number,
  options: RateLimitOptions = {}
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting for health checks
    if (req.path === '/health' || req.path === '/metrics') {
      return next();
    }

    const limiterConfig: any = {
      windowMs,
      max,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: options.keyGenerator,
      skip: options.skip || (() => !isProduction),
      handler: (req: Request, res: Response) => {
        Logger.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
          method: req.method,
        });

        return new ErrorResponse(
          options.message || 'Too many requests, please try again later',
          StatusCodes.TOO_MANY_REQUESTS,
          {
            retryAfter: `${windowMs / 1000} seconds`,
            documentation: 'https://api.example.com/docs/rate-limits',
          }
        ).send(res);
      },
    };

    // Only use Redis store if client is available and connected
    if (redisClient && isRedisInitialized) {
      limiterConfig.store = new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
      });
    } else {
      Logger.warn('Using memory store for rate limiting');
    }

    const limiter = rateLimit(limiterConfig);
    return limiter(req, res, next);
  };
}


// Export pre-configured rate limiters
export const strictRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100,
  { message: 'Too many requests from this IP, please try again later.' }
);

export const apiRateLimit = createRateLimiter(
  60 * 1000, // 1 minute
  1000,
  { message: 'API rate limit exceeded, please slow down.' }
);

export const authRateLimit = createRateLimiter(
  60 * 1000, // 1 minute
  5,
  { message: 'Too many authentication attempts, please try again later.' }
);

// Export Redis client for other uses (with safety check)
export { redisClient };
