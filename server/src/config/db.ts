import mongoose from 'mongoose';
import 'dotenv/config';
import Logger from './logger';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;
const CONNECTION_TIMEOUT_MS = 10000;

class Database {
  private static instance: Database;
  private readonly uri: string;
  private retryCount = 0;
  private isConnected = false;
  private _gridFsBucket?: any; // Use any to avoid type conflicts

  private constructor() {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    
    this.uri = process.env.MONGO_URI;
    
    // Configure mongoose
    mongoose.set('strictQuery', true);
    
    this.setupEventListeners();
  }

  private setupEventListeners() {
    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      this.retryCount = 0;
      Logger.info('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (error) => {
      Logger.error('MongoDB connection error:', error);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      Logger.warn('MongoDB disconnected');
      this.isConnected = false;
      // Don't auto-reconnect here to avoid infinite loops
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected && mongoose.connection.readyState === 1) {
      Logger.info('Already connected to MongoDB');
      return;
    }

    if (this.retryCount >= MAX_RETRIES) {
      const error = new Error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts`);
      Logger.error('Max retries reached. Could not connect to MongoDB');
      throw error;
    }

    try {
      Logger.info(`Attempting MongoDB connection... (attempt ${this.retryCount + 1}/${MAX_RETRIES})`);
      
      await mongoose.connect(this.uri, {
        serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS,
        socketTimeoutMS: 45000,
        connectTimeoutMS: CONNECTION_TIMEOUT_MS,
        maxPoolSize: 10,
        minPoolSize: 2,
        retryWrites: true,
        retryReads: true,
        w: 'majority',
        appName: process.env.APP_NAME || 'MyApp'
      });

      this.isConnected = true;
      this.retryCount = 0;
      Logger.info('MongoDB connection established');

    } catch (error) {
      this.retryCount++;
      Logger.error(`Connection attempt ${this.retryCount} failed:`, error);
      
      if (this.retryCount < MAX_RETRIES) {
        Logger.info(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        return this.connect();
      }
      
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.isConnected || mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        this.isConnected = false;
        Logger.info('MongoDB disconnected gracefully');
      }
    } catch (error) {
      Logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public getConnection(): mongoose.Connection {
    return mongoose.connection;
  }

  public getDb(): mongoose.mongo.Db {
    if (!this.isConnected || !mongoose.connection.db) {
      throw new Error('Database not connected or db not available');
    }
    return mongoose.connection.db;
  }

  // Simplified GridFS bucket - create when needed to avoid type conflicts
  public createGridFSBucket(bucketName?: string): any {
    if (!this.isConnected || !mongoose.connection.db) {
      throw new Error('Database not connected');
    }
    
    const { GridFSBucket } = mongoose.mongo;
    return new GridFSBucket(mongoose.connection.db, { bucketName: bucketName || 'fs' });
  }
}

export const MongoDB = Database.getInstance();