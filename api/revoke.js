const { getUserCredentialsCollection } = require('./utils/mongodb');

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

    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        // Delete user credentials from MongoDB
        const collection = await getUserCredentialsCollection();
        const result = await collection.deleteOne({ user_id: userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('User credentials revoked:', userId);

        return res.status(200).json({
            success: true,
            message: 'Credentials revoked successfully'
        });
    } catch (error) {
        console.error('Revoke error:', error.message);
        return res.status(500).json({ error: 'Server error during revocation' });
    }
};