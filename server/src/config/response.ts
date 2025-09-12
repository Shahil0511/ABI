import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class ErrorResponse {
  constructor(
    public message: string,
    public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    public details?: any,
    public errorCode?: string
  ) {}

  send(res: Response) {
    res.status(this.statusCode).json({
      success: false,
      error: {
        message: this.message,
        code: this.errorCode,
        ...(this.details && { details: this.details }),
      },
      timestamp: new Date().toISOString(),
    });
  }
}