import 'dotenv/config';
import { MongoDB } from './config/db';
import Logger from './config/logger';
import app from './app'; 
const PORT = parseInt(process.env.PORT || '5000', 10);

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  Logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  Logger.error('Unhandled Rejection at:', promise, 'Reason:', reason);
});

// Connect to database and start server
async function startServer() {
  try {
    await MongoDB.connect();

    const server = app.listen(PORT, '0.0.0.0', () => {
      Logger.info(`Server running on http://localhost:${PORT}`);
      Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown handlers
    const shutdown = (signal: string) => {
      Logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        Logger.info('HTTP server closed');
        try {
          await MongoDB.disconnect();
          Logger.info('Database connection closed');
        } catch (err) {
          Logger.error('Error closing database connection:', err);
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();