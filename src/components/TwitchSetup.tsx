import React, { useState } from 'react';
import styles from './StreamElementsSetup/StreamElementsSetup.module.scss';

export interface TwitchSetupProps {
  onComplete: (channelName: string, connectionType: 'irc' | 'oauth') => void;
  isModal?: boolean;
  onClose?: () => void;
}

type ConnectionMode = 'select' | 'irc';

export default function TwitchSetup({ onComplete, isModal = false, onClose }: TwitchSetupProps) {
  const [mode, setMode] = useState<ConnectionMode>('irc');
  const [channelName, setChannelName] = useState<string>('');
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

          <div className={styles.connectionOptions}>
            <div className={styles.optionCard} onClick={() => setMode('irc')}>
              <h3>IRC Connection</h3>
              <p>Quick and simple.</p>
              <ul>
                <li>Use your channel name to connect the chat</li>
              </ul>
              <button className={styles.submitButton}>Use IRC</button>
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

          <h2>IRC Connection</h2>
          <p className={styles.description}>
            Connect to Twitch chat via IRC.
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
              IRC is a lightweight protocol for connecting to Twitch chat. Anonymous connections work fine for reading chat. The connection happens in your browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}


