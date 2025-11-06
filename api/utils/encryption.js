const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts a JWT token using AES-256-GCM
 * @param {string} token - The plaintext JWT token to encrypt
 * @param {string} encryptionKey - Hex string encryption key (64 chars)
 * @returns {object} - { encrypted, iv, authTag }
 */
function encryptToken(token, encryptionKey) {
    try {
        // Generate random IV
        const iv = crypto.randomBytes(IV_LENGTH);

        // Convert hex key to buffer
        const key = Buffer.from(encryptionKey, 'hex');

        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        // Encrypt the token
        let encrypted = cipher.update(token, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Get authentication tag
        const authTag = cipher.getAuthTag();

        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    } catch (error) {
        console.error('Encryption error:', error.message);
        throw new Error('Failed to encrypt token');
    }
}

/**
 * Decrypts an encrypted JWT token using AES-256-GCM
 * @param {string} encrypted - The encrypted token (hex string)
 * @param {string} ivHex - The initialization vector (hex string)
 * @param {string} authTagHex - The authentication tag (hex string)
 * @param {string} encryptionKey - Hex string encryption key (64 chars)
 * @returns {string} - The decrypted plaintext token
 */
function decryptToken(encrypted, ivHex, authTagHex, encryptionKey) {
    try {
        // Convert hex strings to buffers
        const key = Buffer.from(encryptionKey, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        // Decrypt the token
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error.message);
        throw new Error('Failed to decrypt token');
    }
}

module.exports = {
    encryptToken,
    decryptToken
};