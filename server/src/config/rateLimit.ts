import { Request, Response, NextFunction } from 'express';
import { rateLimit as rateLimitLib, ipKeyGenerator } from 'express-rate-limit'; 
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse } from '../config/response';
import Logger from '../config/logger';

const isProduction = process.env.NODE_ENV === 'production';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});
redisClient.on('error', (err: any) => Logger.error('Redis client error', err));

redisClient.connect()
  .then(() => Logger.info('Redis connected for rate limiting'))
  .catch((err) => Logger.error('Redis connection failed', err));

export function createRateLimiter(
  windowMs: number,
  max: number,
  options: {
    keyGenerator?: (req: Request) => string;
    skip?: (req: Request) => boolean;
    message?: string;
  } = {}
) {
  const limiter = rateLimitLib({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    }),
   keyGenerator: options.keyGenerator || ((req) => ipKeyGenerator(req.ip ?? 'unknown-ip')),

    skip: options.skip || (() => !isProduction),
    handler: (req, res) => {
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
  });

  return (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/health' || req.path === '/metrics') {
      return next();
    }
    return limiter(req, res, next);
  };
}

export const strictRateLimit = createRateLimiter(15 * 60 * 1000, 100);
export const apiRateLimit = createRateLimiter(60 * 1000, 1000);
export const authRateLimit = createRateLimiter(60 * 1000, 5);
