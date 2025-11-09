import { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

/**
 * Twitch EventSub Webhook Handler
 * 
 * POST /api/twitch-eventsub
 * Receives EventSub notifications from Twitch
 * 
 * Handles:
 * - Webhook verification challenges
 * - Chat message events
 * - Notification delivery
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const messageId = req.headers['twitch-eventsub-message-id'] as string;
    const messageType = req.headers['twitch-eventsub-message-type'] as string;
    const messageSignature = req.headers['twitch-eventsub-message-signature'] as string;
    const messageTimestamp = req.headers['twitch-eventsub-message-timestamp'] as string;

    // Verify webhook signature
    const secret = process.env.TWITCH_WEBHOOK_SECRET;
    if (!secret) {
        console.error('TWITCH_WEBHOOK_SECRET not set');
        res.status(500).json({ error: 'Server configuration error' });
        return;
    }

    if (!verifySignature(messageSignature, messageId, messageTimestamp, JSON.stringify(req.body), secret)) {
        console.error('Invalid signature');
        res.status(403).json({ error: 'Invalid signature' });
        return;
    }

    // Handle webhook verification challenge
    if (messageType === 'webhook_callback_verification') {
        const challenge = req.body.challenge;
        res.status(200).send(challenge);
        return;
    }

    // Handle notification
    if (messageType === 'notification') {
        const event = req.body.event;
        const subscriptionType = req.body.subscription?.type;

        // Handle channel.chat.message event
        if (subscriptionType === 'channel.chat.message') {
            await handleChatMessage(event);
        }

        res.status(200).json({ received: true });
        return;
    }

    // Handle revocation
    if (messageType === 'revocation') {
        console.log('Subscription revoked:', req.body);
        res.status(200).json({ received: true });
        return;
    }

    res.status(400).json({ error: 'Unknown message type' });
}

/**
 * Verifies the Twitch EventSub signature
 */
function verifySignature(
    signature: string,
    messageId: string,
    timestamp: string,
    body: string,
    secret: string
): boolean {
    const message = messageId + timestamp + body;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(message);
    const expectedSignature = 'sha256=' + hmac.digest('hex');
    return signature === expectedSignature;
}

/**
 * Handles incoming chat messages
 * Filters for volunteer messages and sends to connected clients
 */
async function handleChatMessage(event: any): Promise<void> {
    const username = event.chatter_user_login;
    const message = event.message?.text || '';

    console.log(`Chat message from ${username}: ${message}`);

    // Check if message contains volunteer keyword
    const volunteerKeywords = ['i volunteer', 'I volunteer', 'I VOLUNTEER'];
    const isVolunteer = volunteerKeywords.some(keyword => message.includes(keyword));

    if (isVolunteer) {
        console.log(`Volunteer detected: ${username}`);
        // Note: In production, you'd push this to a queue or websocket
        // For now, we'll store in a temporary collection that the client polls
        // Or use Server-Sent Events (SSE) / WebSocket for real-time updates
    }
}


