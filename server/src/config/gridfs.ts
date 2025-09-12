import { GridFSBucket } from 'mongodb';
import { MongoDB } from './db';
import Logger from './logger';

class GridFSService {
  private static instance: GridFSService;
  private _bucket?: GridFSBucket;

  private constructor() {
    // Initialize bucket after DB is connected
    if (MongoDB.getConnectionStatus()) {
      this._bucket = new GridFSBucket(MongoDB.getDb(), { bucketName: 'uploads' });
      Logger.info('GridFSBucket initialized');
    } else {
      MongoDB.getConnection().once('connected', () => {
        this._bucket = new GridFSBucket(MongoDB.getDb(), { bucketName: 'uploads' });
        Logger.info('GridFSBucket initialized after DB connect');
      });
    }
  }

  public static getInstance(): GridFSService {
    if (!GridFSService.instance) {
      GridFSService.instance = new GridFSService();
    }
    return GridFSService.instance;
  }

  public getBucket(): GridFSBucket {
    if (!this._bucket) {
      throw new Error('GridFSBucket is not initialized yet.');
    }
    return this._bucket;
  }
}

export const GridFS = GridFSService.getInstance();
