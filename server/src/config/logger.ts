// src/utils/logger.ts
import winston from 'winston';
import { TransformableInfo } from 'logform';
import DailyRotateFile from 'winston-daily-rotate-file';
import { inspect } from 'util';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format for console output
const consoleFormat = printf((info: TransformableInfo) => {
  const { level, message, timestamp, stack, ...meta } = info;
  let log = `${timestamp} [${level}]: ${message}`;

  if (stack) {
    log += `\n${stack}`;
  }

  if (Object.keys(meta).length > 0) {
    log += `\n${inspect(meta, { colors: true, depth: 5 })}`;
  }

  return log;
});




// Custom format for file output (JSON format for better parsing)
const fileFormat = winston.format.json();

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Create the logger instance
const logger = winston.createLogger({
  levels,
  level: isProduction ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }), // Include stack traces for errors
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' })
  ),
  transports: [
    // Console transport (colorized)
    new winston.transports.Console({
      format: combine(
        colorize(),
        consoleFormat
      ),
      silent: process.env.NODE_ENV === 'test' // Disable in test environment
    }),
    // Daily rotating file transport for errors
    new DailyRotateFile({
      level: 'error',
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat
    }),
    // Daily rotating file transport for all logs
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat
    })
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat
    })
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat
    })
  ]
});

// Add stream for morgan (HTTP logging)
( logger as any ).stream = {
  write: (message: string) => {
    logger.http(message.trim());
  }
};

// Custom logger methods for better DX
class Logger {
  public static error(message: string, meta?: any, _p0?: string, _reason?: unknown): void {
    logger.error(message, meta);
  }

  public static warn(message: string, meta?: any): void {
    logger.warn(message, meta);
  }

  public static info(message: string, meta?: any): void {
    logger.info(message, meta);
  }

  public static http(message: string, meta?: any): void {
    logger.http(message, meta);
  }

  public static verbose(message: string, meta?: any): void {
    logger.verbose(message, meta);
  }

  public static debug(message: string, meta?: any): void {
    logger.debug(message, meta);
  }

  public static log(level: string, message: string, meta?: any): void {
    logger.log(level, message, meta);
  }
}

export default Logger;