const { getUserCredentialsCollection } = require('./utils/mongodb');
const { encryptToken } = require('./utils/encryption');

module.exports = async function handler(req, res) {
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
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, jwtToken } = req.body;

    if (!userId || !jwtToken) {
        return res.status(400).json({ error: 'Missing userId or jwtToken' });
    }

    // Validate encryption key is set
    if (!process.env.JWT_ENCRYPTION_KEY) {
        console.error('JWT_ENCRYPTION_KEY not set');
        return res.status(500).json({
            error: 'Server configuration error: JWT_ENCRYPTION_KEY environment variable is not set. Please add JWT_ENCRYPTION_KEY to your .env file and restart the server.',
            errorCode: 'MISSING_ENCRYPTION_KEY'
        });
    }

    // Validate MongoDB URI is set
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI not set');
        return res.status(500).json({
            error: 'Server configuration error: MONGODB_URI environment variable is not set. Please add MONGODB_URI to your .env file and restart the server.',
            errorCode: 'MISSING_MONGODB_URI'
        });
    }

    try {
        // Validate token with StreamElements API
        const response = await fetch('https://api.streamelements.com/kappa/v2/channels/me', {
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('StreamElements validation failed:', response.status, await response.text());
            return res.status(401).json({
                error: `Invalid StreamElements JWT token (HTTP ${response.status}). Please check that your token is correct and hasn't expired. Get a new token from: StreamElements → Account Settings → Channels → Show Secrets`,
                errorCode: 'INVALID_SE_TOKEN'
            });
        }

        const channelInfo = await response.json();

        // Encrypt the JWT token
        const { encrypted, iv, authTag } = encryptToken(jwtToken, process.env.JWT_ENCRYPTION_KEY);

        // Store credentials in MongoDB
        const collection = await getUserCredentialsCollection();

        const credential = {
            user_id: userId,
            jwt_token_encrypted: encrypted,
            auth_tag: authTag,
            iv: iv,
            channel_id: channelInfo._id,
            channel_name: channelInfo.displayName,
            registered_at: new Date()
        };

        await collection.updateOne({ user_id: userId }, { $set: credential }, { upsert: true });

        console.log('User registered successfully:', userId);

        return res.status(200).json({
            success: true,
            userId,
            channelName: channelInfo.displayName
        });
    } catch (error) {
        console.error('Registration error:', error.message, error.stack);

        // Provide specific error messages based on error type
        let errorMessage = 'Server error during registration: ';
        let errorCode = 'UNKNOWN_ERROR';

        if (error.message.includes('MONGODB_URI')) {
            errorMessage += 'MongoDB connection failed. Check your MONGODB_URI environment variable.';
            errorCode = 'MONGODB_CONNECTION_ERROR';
        } else if (error.message.includes('fetch')) {
            errorMessage += 'Failed to connect to StreamElements API. Check your internet connection.';
            errorCode = 'NETWORK_ERROR';
        } else if (error.message.includes('encrypt')) {
            errorMessage += 'Token encryption failed. Check JWT_ENCRYPTION_KEY format (should be 64-char hex string).';
            errorCode = 'ENCRYPTION_ERROR';
        } else {
            errorMessage += error.message;
        }

        return res.status(500).json({
            error: errorMessage,
            errorCode: errorCode,
            details: error.message
        });
    }
};