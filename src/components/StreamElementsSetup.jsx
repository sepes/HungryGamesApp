import React, { useState } from 'react';
import styles from './StreamElementsSetup/StreamElementsSetup.module.scss';

export default function StreamElementsSetup({ onComplete, isModal = false, onClose }) {
  const [userId, setUserId] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, jwtToken })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Registration failed';
        const errorCode = data.errorCode || 'UNKNOWN';
        console.error('Registration failed:', errorCode, errorMsg, data.details);
        throw new Error(errorMsg);
      }

      // Store userId in localStorage for future sessions
      localStorage.setItem('seUserId', userId);
      
      onComplete(userId, data.channelName);
      
      if (isModal && onClose) {
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const containerClass = isModal ? styles.setupModal : styles.setupContainer;
  const cardClass = isModal ? styles.setupCardModal : styles.setupCard;

  return (
    <div className={containerClass}>
      <div className={cardClass}>
        {isModal && onClose && (
          <button 
            onClick={onClose} 
            className={styles.closeButton}
            aria-label="Close setup dialog"
          >
            ×
          </button>
        )}
        
        <h2>Connect StreamElements</h2>
        <p className={styles.description}>
          Connect your StreamElements account to enable chat integration with the Hunger Games simulator.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="userId">Username / Channel ID</label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your channel name"
              required
              disabled={loading}
              aria-describedby="userId-help"
            />
            <small id="userId-help">This will be used to identify your session</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="jwtToken">StreamElements JWT Token</label>
            <input
              id="jwtToken"
              type="password"
              value={jwtToken}
              onChange={(e) => setJwtToken(e.target.value)}
              placeholder="Paste your JWT token here"
              required
              disabled={loading}
              aria-describedby="jwtToken-help"
            />
            <small id="jwtToken-help">
              Find in: StreamElements → Account Settings → Channels → Show Secrets
            </small>
          </div>

          {error && (
            <div className={styles.error} role="alert">
              <strong>Error:</strong>
              <div className={styles.errorMessage}>{error}</div>
              {error.includes('JWT_ENCRYPTION_KEY') && (
                <div className={styles.errorHint}>
                  <strong>Solution:</strong>
                  <ol>
                    <li>Create a <code>.env</code> file in your project root (next to package.json)</li>
                    <li>Add: <code>JWT_ENCRYPTION_KEY=your_64_char_hex_key</code></li>
                    <li>Add: <code>MONGODB_URI=your_mongodb_connection_string</code></li>
                    <li>Restart the dev server</li>
                  </ol>
                </div>
              )}
              {error.includes('MONGODB_URI') && (
                <div className={styles.errorHint}>
                  <strong>Solution:</strong> Add your MongoDB connection string to the .env file as MONGODB_URI and restart the server.
                </div>
              )}
            </div>
          )}

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Connecting...' : 'Connect Account'}
          </button>
        </form>

        <div className={styles.security}>
          <h3>Security & Privacy</h3>
          <p>
            Your JWT token is encrypted using AES-256-GCM and stored securely in a MongoDB database. 
            Your token is never exposed to the public. Only volunteer usernames are temporarily stored 
            during game setup and are cleared after the game starts. No chat logs are saved.
          </p>
        </div>
      </div>
    </div>
  );
}

