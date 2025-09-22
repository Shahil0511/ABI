import mongoose from 'mongoose';
import Logger from './logger';

class GridFSService {
  private static instance: GridFSService;
  private _bucket?: mongoose.mongo.GridFSBucket;

  private constructor() {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      this.initializeBucket();
    } else {
      mongoose.connection.once('connected', () => {
        if (mongoose.connection.db) {
          this.initializeBucket();
        } else {
          Logger.error('MongoDB connection established but db is undefined');
        }
      });
    }
  }

  private initializeBucket() {
    if (!mongoose.connection.db) {
      throw new Error('MongoDB database instance is not available');
    }
    
    this._bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { 
      bucketName: 'uploads' 
    });
    Logger.info('GridFSBucket initialized');
  }

  public static getInstance(): GridFSService {
    if (!GridFSService.instance) {
      GridFSService.instance = new GridFSService();
    }
    return GridFSService.instance;
  }

  public getBucket(): mongoose.mongo.GridFSBucket {
    if (!this._bucket) {
      throw new Error('GridFSBucket is not initialized yet. Database may not be connected.');
    }
    return this._bucket;
  }

  // Helper method to check if bucket is ready
  public isReady(): boolean {
    return !!this._bucket;
  }
}

export const GridFS = GridFSService.getInstance();