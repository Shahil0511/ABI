import 'dotenv/config';
import { MongoDB } from './config/db';
import Logger from './config/logger';



// Import app after Redis is ready to avoid circular dependencies
let app: any;

const PORT = parseInt(process.env.PORT || '5000');

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  Logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('UNHANDLED REJECTION:', reason);
  Logger.error('Unhandled Rejection at:', promise, 'Reason:', reason);
  process.exit(1);
});

async function startServer() {
  try {
  
    if (!process.env.MONGO_URI) {
      Logger.error('MONGO_URI environment variable is required');
      process.exit(1);
    }

    Logger.info('Starting server...');
    
    // Connect to database
    await MongoDB.connect();
    console.log("4. Database connected successfully");
    Logger.info('Database connected successfully');

    // Wait for Redis initialization before starting server

    Logger.info('Waiting for Redis initialization...');
    const { redisInitializationPromise } = await import('./config/rateLimit');
    await redisInitializationPromise;
   
    Logger.info('Redis initialization completed');

  
    app = (await import('./app')).default;
   

    // Start server

    const server = app.listen(PORT, '0.0.0.0', () => {
     
      Logger.info(`Server running on http://localhost:${PORT}`);
      Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Add error handling for the server itself
    server.on('error', (error:any) => {
      console.error("SERVER ERROR:", error);
      Logger.error('HTTP server error:', error);
      process.exit(1);
    });

    // Graceful shutdown handler
    const shutdown = async (signal: string) => {
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
    console.error("START SERVER ERROR:", error);
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
}


startServer();