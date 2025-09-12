import mongoose from 'mongoose';
import 'dotenv/config';
import  Logger  from './logger'; 
import { GridFSBucket } from 'mongodb';


const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;
const CONNECTION_TIMEOUT_MS = 10000;
const SOCKET_TIMEOUT_MS = 45000;

class Database {
  private static instance: Database;
  private readonly uri: string;
  private retryCount = 0;
  private isConnected = false;
   private _gridFsBucket?: GridFSBucket;

  private constructor() {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    
    this.uri = process.env.MONGO_URI;
    
    // Configure connection options
    mongoose.set('strictQuery', true);
    
    // Event listeners
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
      this.handleDisconnect();
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      Logger.info('Already connected to MongoDB');
      return;
    }

    if (this.retryCount >= MAX_RETRIES) {
      Logger.error('Max retries reached. Could not connect to MongoDB');
      throw new Error('Max connection retries reached');
    }

    try {
      Logger.info('Attempting MongoDB connection...');
      
      await mongoose.connect(this.uri, {
        serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS,
        socketTimeoutMS: SOCKET_TIMEOUT_MS,
        retryWrites: true,
        retryReads: true,
        w: 'majority', // Write concern
        appName: process.env.APP_NAME || 'MyApp',
        maxPoolSize: 50, // Adjust based on your needs
        minPoolSize: 10,
        connectTimeoutMS: CONNECTION_TIMEOUT_MS,
      });

      this.isConnected = true;
    } catch (error) {
      this.retryCount++;
      Logger.error(`Connection attempt ${this.retryCount} failed:`, error);
      
      if (this.retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        return this.connect();
      }
      
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await mongoose.disconnect();
        Logger.info('MongoDB disconnected gracefully');
      }
    } catch (error) {
      Logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  private async handleDisconnect(): Promise<void> {
    if (!this.isConnected && this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      Logger.info(`Attempting to reconnect (${this.retryCount}/${MAX_RETRIES})...`);
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      await this.connect();
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getConnection(): mongoose.Connection {
  return mongoose.connection;
}

public getDb(): any { // or type Db from mongodb
  return mongoose.connection.db;
}
}

export const MongoDB = Database.getInstance();