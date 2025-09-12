import { Request, Response, NextFunction, RequestHandler } from 'express';
import Logger from '../config/logger';
import MetricsService from '../services/metrics';

export function asyncHandler(
  handler: RequestHandler,
  options?: {
    metrics?: boolean;
    operationName?: string;
  }
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime();
    const { metrics = true, operationName = handler.name } = options || {};

    try {
      if (metrics) {
        MetricsService.startRequest(operationName);
      }

      await handler(req, res, next);

      if (metrics) {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const duration = seconds * 1000 + nanoseconds / 1e6;
        MetricsService.endRequest(operationName, 'success', duration);
      }
    } catch (error) {
      if (metrics) {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const duration = seconds * 1000 + nanoseconds / 1e6;
        MetricsService.endRequest(operationName, 'error', duration, error instanceof Error ? error : undefined);
      }

      Logger.error('Async handler error', {
        error,
        operation: operationName,
        path: req.path,
        method: req.method
      });

      next(error);
    }
  };
}