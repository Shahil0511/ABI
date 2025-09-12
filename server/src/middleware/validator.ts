import { Request, Response, NextFunction } from 'express';
import { AnySchema } from 'joi';
import { StatusCodes } from 'http-status-codes';
import Logger from '../config/logger';
import { ErrorResponse } from '../config/response';
import Sanitizer from '../services/sanitizer';


export type SanitizeOptions = {
  maxLength?: number;
  removeNullBytes?: boolean;
  trim?: boolean;
  allowedTags?: string[];
};

/**
 * Validation middleware factory that handles both body and query validation
 * with proper sanitization and error handling.
 */
export function validator(
  schema: AnySchema,
  options: {
    payloadType?: 'body' | 'query' | 'params' | 'headers';
    allowUnknown?: boolean;
    sanitizeOptions?: SanitizeOptions;
  } = { payloadType: 'body', allowUnknown: false }
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req[options.payloadType || 'body'];
      const sanitizedPayload = Sanitizer.sanitizeInput(payload, options.sanitizeOptions);

      const { error, value } = schema.validate(sanitizedPayload, {
        abortEarly: false,
        allowUnknown: options.allowUnknown,
        stripUnknown: true,
      });

      if (error) {
        Logger.warn('Validation failed', {
          path: req.path,
          errors: error.details,
          payload: sanitizedPayload
        });

        const validationErrors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type,
        }));

        return new ErrorResponse(
          'Validation Error',
          StatusCodes.BAD_REQUEST,
          { errors: validationErrors }
        ).send(res);
      }

      // Replace the payload with the validated and sanitized value
      req[options.payloadType || 'body'] = value;
      next();
    } catch (error) {
      next(error);
    }
  };
}