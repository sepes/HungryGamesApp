import React, { useState } from 'react';
import styles from './StreamElementsSetup/StreamElementsSetup.module.scss';

export interface TwitchSetupProps {
  onComplete: (channelName: string, connectionType: 'irc' | 'oauth') => void;
  isModal?: boolean;
  onClose?: () => void;
}

type ConnectionMode = 'select' | 'irc' | 'oauth';

export default function TwitchSetup({ onComplete, isModal = false, onClose }: TwitchSetupProps) {
  const [mode, setMode] = useState<ConnectionMode>('select');
  const [channelName, setChannelName] = useState<string>('');
  const [oauthToken, setOauthToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleIRCSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Clean and format channel name: lowercase, remove @ prefix, trim whitespace
      const cleanChannelName = channelName.trim().toLowerCase().replace(/^@/, '');
      
      // Validate channel name format (alphanumeric and underscores only)
      if (!/^[a-z0-9_]+$/.test(cleanChannelName)) {
        throw new Error('Channel name can only contain letters, numbers, and underscores');
      }
      
      if (cleanChannelName.length === 0) {
        throw new Error('Channel name cannot be empty');
      }
      
      // Store connection info directly to localStorage (no API needed for IRC)
      localStorage.setItem('twitchConnectionType', 'irc');
      localStorage.setItem('twitchChannelName', cleanChannelName);
      if (oauthToken) {
        localStorage.setItem('twitchOAuthToken', oauthToken);
      }
      
      // IRC connection happens in App.tsx via connectToTwitch()
      onComplete(cleanChannelName, 'irc');
      
      if (isModal && onClose) {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthStart = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/twitch-oauth?action=start');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start OAuth flow');
      }

      window.location.href = data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  const containerClass = isModal ? styles.setupModal : styles.setupContainer;
  const cardClass = isModal ? styles.setupCardModal : styles.setupCard;

  if (mode === 'select') {
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
          
          <h2>Connect to Twitch</h2>
          <p className={styles.description}>
            Choose how you want to connect to Twitch chat for volunteer collection.
          </p>

          <div className={styles.connectionOptions}>
            <div className={styles.optionCard} onClick={() => setMode('irc')}>
              <h3>IRC Connection</h3>
              <p>Quick and simple. Can be anonymous or use your own token.</p>
              <ul>
                <li>Fast setup</li>
                <li>Works locally</li>
                <li>Anonymous or authenticated</li>
              </ul>
              <button className={styles.submitButton}>Use IRC</button>
            </div>

            <div className={styles.optionCard} onClick={() => setMode('oauth')}>
              <h3>OAuth Connection</h3>
              <p>Full authentication with Twitch. More features and better reliability.</p>
              <ul>
                <li>Official Twitch OAuth</li>
              </ul>
              <button className={styles.submitButton}>Use OAuth</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'irc') {
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
          
          <button 
            onClick={() => setMode('select')} 
            className={styles.backButton}
            aria-label="Back to connection options"
          >
            ← Back
          </button>

          <h2>IRC Connection</h2>
          <p className={styles.description}>
            Connect to Twitch chat via IRC. Can be used anonymously or with your OAuth token for better access.
          </p>

          <form onSubmit={handleIRCSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="channelName">Twitch Channel Name</label>
              <input
                id="channelName"
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g., yourchannel or @yourchannel"
                required
                disabled={loading}
                aria-describedby="channelName-help"
              />
              <small id="channelName-help">Enter your Twitch username (case-insensitive, no URL needed)</small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="oauthToken">OAuth Token (Optional)</label>
              <input
                id="oauthToken"
                type="password"
                value={oauthToken}
                onChange={(e) => setOauthToken(e.target.value)}
                placeholder="oauth:your_token_here (optional)"
                disabled={loading}
                aria-describedby="oauthToken-help"
              />
              <small id="oauthToken-help">
                Leave empty for anonymous connection. Get token from: <a href="https://twitchapps.com/tmi/" target="_blank" rel="noopener noreferrer">twitchapps.com/tmi</a>
              </small>
            </div>

            {error && (
              <div className={styles.error} role="alert">
                <strong>Error:</strong> {error}
              </div>
            )}

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Connecting...' : 'Connect via IRC'}
            </button>
          </form>

          <div className={styles.security}>
            <h3>About IRC Connection</h3>
            <p>
              IRC is a lightweight protocol for connecting to Twitch chat. Anonymous connections work fine for reading chat, 
              but you will need an OAuth token if you want to send messages. The connection happens in your browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'oauth') {
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
          
          <button 
            onClick={() => setMode('select')} 
            className={styles.backButton}
            aria-label="Back to connection options"
          >
            ← Back
          </button>

          <h2>OAuth Connection</h2>
          <p className={styles.description}>
            Authenticate with Twitch using OAuth 2.0 for full access to chat features and better reliability.
          </p>

          {error && (
            <div className={styles.error} role="alert">
              <strong>Error:</strong> {error}
              {error.includes('TWITCH_CLIENT_ID') && (
                <div className={styles.errorHint}>
                  <strong>Setup Required:</strong>
                  <ol>
                    <li>Register a Twitch app at <a href="https://dev.twitch.tv/console/apps" target="_blank" rel="noopener noreferrer">dev.twitch.tv/console/apps</a></li>
                    <li>Add environment variables to .env file:
                      <ul>
                        <li>TWITCH_CLIENT_ID</li>
                        <li>TWITCH_CLIENT_SECRET</li>
                        <li>TWITCH_REDIRECT_URI</li>
                        <li>TWITCH_WEBHOOK_SECRET</li>
                      </ul>
                    </li>
                    <li>Restart the server</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          <button 
            onClick={handleOAuthStart}
            className={styles.submitButton}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Redirecting...' : 'Authenticate with Twitch'}
          </button>

          <div className={styles.security}>
            <h3>About OAuth</h3>
            <p>
              You will be redirected to Twitch to authorize this application. Your credentials are encrypted 
              using AES-256-GCM and stored securely. Tokens can be revoked at any time from your Twitch settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}


