import { Request, Response, NextFunction } from 'express';

type SanitizeOptions = {
  maxLength?: number;
  removeNullBytes?: boolean;
  trim?: boolean;
  allowedTags?: string[];
};

class Sanitizer {
  private static defaultOptions: SanitizeOptions = {
    maxLength: 1000,
    removeNullBytes: true,
    trim: true,
    allowedTags: []
  };

  /**
   * Recursively sanitize input data
   */
 static sanitizeInput<T>(data: T, options: SanitizeOptions = {}): T {
  const opts = { ...this.defaultOptions, ...options };

  if (typeof data === 'string') {
    let sanitized: string = data;

    if (opts.trim) sanitized = sanitized.trim();
    if (opts.removeNullBytes) sanitized = sanitized.replace(/\0/g, '');
    if (opts.maxLength) sanitized = sanitized.slice(0, opts.maxLength);

    // Safe cast because we know original was a string
    return sanitized as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map(item => this.sanitizeInput(item, opts)) as unknown as T;
  }

  if (typeof data === 'object' && data !== null) {
    const sanitizedObj: Record<string, unknown> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedObj[key] = this.sanitizeInput((data as Record<string, unknown>)[key], opts);
      }
    }
    return sanitizedObj as T;
  }

  return data;
}


  /**
   * Express middleware-ready sanitizer
   */
  static middleware(options?: SanitizeOptions) {
    return (req: Request, _res: Response, next: NextFunction) => {
      try {
        req.body = this.sanitizeInput(req.body, options);
        req.query = this.sanitizeInput(req.query, options);
        req.params = this.sanitizeInput(req.params, options);
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

export default Sanitizer;