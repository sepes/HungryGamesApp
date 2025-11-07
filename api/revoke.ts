import { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserCredentialsCollection } from './utils/mongodb';
import { RevokeRequest, RevokeResponse, RevokeErrorResponse } from '../src/types/api.types';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' } as RevokeErrorResponse);
        return;
    }

    const { userId } = req.body as RevokeRequest;

    if (!userId) {
        res.status(400).json({ error: 'Missing userId' } as RevokeErrorResponse);
        return;
    }

    try {
        // Delete user credentials from MongoDB
        const collection = await getUserCredentialsCollection();
        const result = await collection.deleteOne({ user_id: userId });

        if (result.deletedCount === 0) {
            res.status(404).json({ error: 'User not found' } as RevokeErrorResponse);
            return;
        }

        console.log('User credentials revoked:', userId);

        res.status(200).json({
            success: true,
            message: 'Credentials revoked successfully'
        } as RevokeResponse);
    } catch (error) {
        console.error('Revoke error:', (error as Error).message);
        res.status(500).json({ error: 'Server error during revocation' } as RevokeErrorResponse);
    }
}

module.exports = handler;

