import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './utils/mongodb';
import { encryptToken } from './utils/encryption';
import { TwitchOAuthStartResponse, TwitchOAuthCallbackRequest, TwitchOAuthCallbackResponse, TwitchOAuthTokenResponse, TwitchUserInfo, TwitchConnection } from '../src/types/api.types';

/**
 * Twitch OAuth Flow Endpoints
 * 
 * GET /api/twitch-oauth?action=start
 * - Generates OAuth authorization URL
 * 
 * POST /api/twitch-oauth?action=callback
 * - Handles OAuth callback, exchanges code for tokens
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const action = (req.query?.action as string) || '';

    if (action === 'start') {
        return handleOAuthStart(req, res);
    } else if (action === 'callback') {
        return handleOAuthCallback(req, res);
    } else {
        res.status(400).json({ error: 'Invalid action. Use ?action=start or ?action=callback' });
    }
}

async function handleOAuthStart(req: VercelRequest, res: VercelResponse): Promise<void> {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const redirectUri = process.env.TWITCH_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        res.status(500).json({ 
            error: 'Server configuration error: TWITCH_CLIENT_ID or TWITCH_REDIRECT_URI not set' 
        });
        return;
    }

    // Generate state for CSRF protection
    const state = generateRandomState();

    // Scopes needed for chat access
    const scopes = [
        'chat:read',
        'chat:edit',
        'user:read:email'
    ];

    const authUrl = `https://id.twitch.tv/oauth2/authorize?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes.join(' '))}` +
        `&state=${state}`;

    const response: TwitchOAuthStartResponse = {
        authUrl
    };

    res.status(200).json(response);
}

async function handleOAuthCallback(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { code, state } = req.body as TwitchOAuthCallbackRequest;

    if (!code) {
        res.status(400).json({ error: 'Missing authorization code' });
        return;
    }

    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    const redirectUri = process.env.TWITCH_REDIRECT_URI;
    const encryptionKey = process.env.JWT_ENCRYPTION_KEY;

    if (!clientId || !clientSecret || !redirectUri || !encryptionKey) {
        res.status(500).json({ 
            error: 'Server configuration error: Missing required environment variables' 
        });
        return;
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri
            })
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Token exchange failed:', errorText);
            res.status(401).json({ error: 'Failed to exchange authorization code for tokens' });
            return;
        }

        const tokenData = await tokenResponse.json() as TwitchOAuthTokenResponse;

        // Get user information
        const userResponse = await fetch('https://api.twitch.tv/helix/users', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Client-Id': clientId
            }
        });

        if (!userResponse.ok) {
            console.error('User info fetch failed');
            res.status(401).json({ error: 'Failed to fetch user information' });
            return;
        }

        const userData = await userResponse.json();
        const userInfo = userData.data[0] as TwitchUserInfo;

        // Encrypt tokens
        const accessTokenEncrypted = encryptToken(tokenData.access_token, encryptionKey);
        const refreshTokenEncrypted = encryptToken(tokenData.refresh_token, encryptionKey);

        // Store in database
        const { db } = await connectToDatabase();
        const collection = db.collection<TwitchConnection>('twitch_connections');

        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

        const connection: TwitchConnection = {
            user_id: userInfo.id,
            connection_type: 'oauth',
            channel_name: userInfo.login,
            twitch_user_id: userInfo.id,
            access_token_encrypted: accessTokenEncrypted.encrypted,
            refresh_token_encrypted: refreshTokenEncrypted.encrypted,
            auth_tag: accessTokenEncrypted.authTag,
            iv: accessTokenEncrypted.iv,
            expires_at: expiresAt,
            created_at: new Date(),
            updated_at: new Date()
        };

        await collection.updateOne(
            { user_id: userInfo.id, connection_type: 'oauth' },
            { $set: connection },
            { upsert: true }
        );

        const response: TwitchOAuthCallbackResponse = {
            success: true,
            userId: userInfo.id,
            channelName: userInfo.login,
            displayName: userInfo.display_name
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).json({ error: 'Failed to complete OAuth flow' });
    }
}

function generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}


