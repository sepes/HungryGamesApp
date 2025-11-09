import React, { useState } from 'react';
import { useFocusTrap } from '../utils/useFocusTrap';
import DebugTerminal from './DebugTerminal';
import styles from './SettingsPanel/SettingsPanel.module.scss';
import type { SettingsPanelProps } from '../types/component.types';

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  onResetGame, 
  gameEngine, 
  gamePhase, 
  onNext, 
  onShowVictory, 
  showVictoryButton, 
  enableTributeConfig,
  twitchConnected,
  twitchChannelName,
  twitchConnectionType,
  onReconfigureTwitch,
  onDisconnectTwitch
}) => {
  const containerRef = useFocusTrap(isOpen);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<boolean>(false);

  const handleDisconnect = async (): Promise<void> => {
    if (onDisconnectTwitch) {
      await onDisconnectTwitch();
    }
    setShowDisconnectConfirm(false);
    onClose();
  };

  const handleReconfigure = (): void => {
    if (onReconfigureTwitch) {
      onReconfigureTwitch();
    }
    onClose();
  };

  return (
    <div className={`${styles.settingsPanel} ${isOpen ? styles.open : ''}`} ref={containerRef}>
      <div className={styles.settingsPanelContent}>
        <div className={styles.settingsPanelHeader}>
          <h2>Settings</h2>
          <button 
            onClick={onClose} 
            className="danger-button close"
            aria-label="Close settings panel"
          >
            ×
          </button>
        </div>
        
        <div className={styles.settingsPanelBody}>
          {/* Twitch Chat Section */}
          <div className={styles.settingsSection}>
            <h3>Twitch Chat Integration</h3>
            {twitchConnected ? (
              <>
                <div className={styles.statusInfo}>
                  <p className={styles.statusLabel}>Status:</p>
                  <p className={styles.statusConnected}>Connected</p>
                </div>
                <div className={styles.statusInfo}>
                  <p className={styles.statusLabel}>Channel:</p>
                  <p className={styles.statusValue}>{twitchChannelName}</p>
                </div>
                <div className={styles.statusInfo}>
                  <p className={styles.statusLabel}>Connection Type:</p>
                  <p className={styles.statusValue}>{twitchConnectionType === 'irc' ? 'IRC' : 'OAuth'}</p>
                </div>
                <div className={styles.buttonGroup}>
                  <button 
                    onClick={handleReconfigure} 
                    className="transition-button small"
                    aria-label="Reconfigure Twitch connection"
                  >
                    Reconfigure
                  </button>
                  {!showDisconnectConfirm ? (
                    <button 
                      onClick={() => setShowDisconnectConfirm(true)} 
                      className="danger-button small"
                      aria-label="Disconnect from Twitch"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <div className={styles.confirmRevoke}>
                      <p>Are you sure? This will disconnect from Twitch chat.</p>
                      <div className={styles.confirmButtons}>
                        <button 
                          onClick={handleDisconnect} 
                          className="danger-button small"
                          aria-label="Confirm disconnect"
                        >
                          Yes, Disconnect
                        </button>
                        <button 
                          onClick={() => setShowDisconnectConfirm(false)} 
                          className="transition-button small"
                          aria-label="Cancel disconnect"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className={styles.statusDisconnected}>Not Connected</p>
                <button 
                  onClick={handleReconfigure} 
                  className="transition-button small"
                  aria-label="Configure Twitch Chat"
                >
                  Configure Twitch Chat
                </button>
              </>
            )}
          </div>
          
          {/* Game Controls Section */}
          <div className={styles.settingsSection}>
            <h3>Game Controls</h3>
            <button 
              onClick={onResetGame} 
              className="danger-button small"
              aria-label="Reset game and return to setup screen"
            >
              Reset Game
            </button>
          </div>
          
          {/* Debug Terminal Section */}
          <div className={styles.settingsSection}>
            <h3>Debug Terminal</h3>
            <button 
              onClick={() => setShowTerminal(!showTerminal)} 
              className="transition-button small"
              aria-label={showTerminal ? "Hide debug terminal" : "Show debug terminal"}
            >
              {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
            </button>
            {showTerminal && (
              <div className="terminal-container">
                <DebugTerminal 
                  gameEngine={gameEngine}
                  gamePhase={gamePhase}
                  onNext={onNext}
                  onShowVictory={onShowVictory}
                  showVictoryButton={showVictoryButton}
                  enableTributeConfig={enableTributeConfig}
                />
              </div>
            )}
          </div>
          
          {/* Future Settings Sections */}
          {/* 
          <div className={styles.settingsSection}>
            <h3>Game Settings</h3>
            <!-- Future game settings will go here -->
          </div>
          
          <div className={styles.settingsSection}>
            <h3>Display Settings</h3>
            <!-- Future display settings will go here -->
          </div>
          */}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
