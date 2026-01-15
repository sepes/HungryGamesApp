import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './utils/mongodb';
import { TwitchIRCConnectRequest, TwitchIRCConnectResponse, TwitchConnection } from '../src/types/api.types';

/**
 * Twitch IRC Connection Endpoint
 * Stores IRC connection information for the client to use
 * 
 * POST /api/twitch-irc
 * Body: { userId, channelName }
 * 
 * Note: Actual IRC connection happens client-side using tmi.js
 * This endpoint just stores the connection preferences
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { userId, channelName } = req.body as TwitchIRCConnectRequest;

    if (!userId || !channelName) {
        res.status(400).json({ error: 'Missing userId or channelName' });
        return;
    }

    try {
        const { db } = await connectToDatabase();
        const collection = db.collection<TwitchConnection>('twitch_connections');

        const connection: TwitchConnection = {
            user_id: userId,
            connection_type: 'irc',
            channel_name: channelName.toLowerCase(),
            created_at: new Date(),
            updated_at: new Date()
        };

        await collection.updateOne(
            { user_id: userId, connection_type: 'irc' },
            { $set: connection },
            { upsert: true }
        );

        const response: TwitchIRCConnectResponse = {
            success: true,
            connectionType: 'anonymous',
            channelName: channelName.toLowerCase()
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('IRC connection storage error:', error);
        res.status(500).json({ error: 'Failed to store IRC connection' });
    }
}
