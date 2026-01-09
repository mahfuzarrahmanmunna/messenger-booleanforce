// src/config/database.ts
import { MongoClient, Db, ServerApiVersion } from 'mongodb';
import { logger } from '../utils/logger.js';

let client: MongoClient;
let db: Db;

export async function connectDatabase(): Promise<Db> {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'boolean_force';
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  client = new MongoClient(mongoUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    db = client.db(dbName);
    logger.info(`Connected to database: ${dbName}`);
    return db;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return db;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    logger.info('Database connection closed');
  }
}