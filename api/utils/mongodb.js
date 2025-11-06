const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

/**
 * Connects to MongoDB with connection pooling
 * Reuses existing connection if available
 * @returns {Promise<{client: MongoClient, db: Db}>}
 */
async function connectToDatabase() {
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

        // Cache for reuse
        cachedClient = client;
        cachedDb = db;

        console.log('MongoDB connected successfully');

        return { client, db };
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw new Error('Failed to connect to database');
    }
}

/**
 * Gets the user_credentials collection
 * @returns {Promise<Collection>}
 */
async function getUserCredentialsCollection() {
    const { db } = await connectToDatabase();
    return db.collection('user_credentials');
}

module.exports = {
    connectToDatabase,
    getUserCredentialsCollection
};