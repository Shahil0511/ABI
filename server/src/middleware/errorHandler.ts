import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '../config/logger';
import { ErrorResponse } from '../config/response';

const isProduction = process.env.NODE_ENV === 'production';

class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    public details?: any
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error with contextual information
  Logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    statusCode: err.statusCode,
    details: err.details,
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return new ErrorResponse(
      'Validation Error',
      StatusCodes.BAD_REQUEST,
      err.errors
    ).send(res);
  }

  if (err.name === 'UnauthorizedError') {
    return new ErrorResponse(
      'Authentication Failed',
      StatusCodes.UNAUTHORIZED
    ).send(res);
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return new ErrorResponse(
      err.message,
      err.statusCode,
      isProduction ? undefined : err.details
    ).send(res);
  }

  // Generic error response (hide details in production)
  const response = isProduction
    ? new ErrorResponse('Internal Server Error')
    : new ErrorResponse(
        err.message || 'Internal Server Error',
        StatusCodes.INTERNAL_SERVER_ERROR,
        {
          stack: err.stack,
          ...(err.details && { details: err.details }),
        }
      );

  response.send(res);
}

export { AppError };