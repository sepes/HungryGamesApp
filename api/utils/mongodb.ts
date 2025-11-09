import { MongoClient, Db, Collection } from 'mongodb';
import { UserCredential, TwitchConnection } from '../../src/types/api.types';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

interface DatabaseConnection {
    client: MongoClient;
    db: Db;
}

/**
 * Connects to MongoDB with connection pooling
 * Reuses existing connection if available
 * @returns Promise resolving to client and database objects
 */
export async function connectToDatabase(): Promise<DatabaseConnection> {
    // Return cached connection if available
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
    }

    try {
        // Create new connection
        const client = await MongoClient.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            maxIdleTimeMS: 60000,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        const db = client.db();

        // Ensure indexes exist
        await db.collection('user_credentials').createIndex({ user_id: 1 }, { unique: true });
        await db.collection('twitch_connections').createIndex({ user_id: 1, connection_type: 1 }, { unique: true });

        // Cache for reuse
        cachedClient = client;
        cachedDb = db;

        console.log('MongoDB connected successfully');

        return { client, db };
    } catch (error) {
        console.error('MongoDB connection error:', (error as Error).message);
        throw new Error('Failed to connect to database');
    }
}

/**
 * Gets the user_credentials collection
 * @returns Promise resolving to the collection
 */
export async function getUserCredentialsCollection(): Promise<Collection<UserCredential>> {
    const { db } = await connectToDatabase();
    return db.collection<UserCredential>('user_credentials');
}

/**
 * Gets the twitch_connections collection
 * @returns Promise resolving to the collection
 */
export async function getTwitchConnectionsCollection(): Promise<Collection<TwitchConnection>> {
    const { db } = await connectToDatabase();
    return db.collection<TwitchConnection>('twitch_connections');
}

module.exports = {
    connectToDatabase,
    getUserCredentialsCollection,
    getTwitchConnectionsCollection
};

