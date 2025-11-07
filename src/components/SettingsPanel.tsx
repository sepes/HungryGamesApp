import React, { useState } from 'react';
import { useFocusTrap } from '../utils/useFocusTrap';
import DebugTerminal from './DebugTerminal';
import styles from './SettingsPanel/SettingsPanel.module.scss';
import type { SettingsPanelProps } from '../types/component.types';

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, onResetGame, gameEngine, gamePhase, onNext, onShowVictory, showVictoryButton, seConnected, seChannelName, seUserId, onRevokeStreamElements, onReconfigureStreamElements }) => {
  const containerRef = useFocusTrap(isOpen);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState<boolean>(false);

  const handleRevoke = async (): Promise<void> => {
    if (onRevokeStreamElements) {
      await onRevokeStreamElements();
    }
    setShowRevokeConfirm(false);
    onClose();
  };

  const handleReconfigure = (): void => {
    if (onReconfigureStreamElements) {
      onReconfigureStreamElements();
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
          {/* StreamElements Section */}
          <div className={styles.settingsSection}>
            <h3>StreamElements</h3>
            {seConnected ? (
              <>
                <div className={styles.statusInfo}>
                  <p className={styles.statusLabel}>Status:</p>
                  <p className={styles.statusConnected}>Connected</p>
                </div>
                <div className={styles.statusInfo}>
                  <p className={styles.statusLabel}>Channel:</p>
                  <p className={styles.statusValue}>{seChannelName || seUserId}</p>
                </div>
                <div className={styles.buttonGroup}>
                  <button 
                    onClick={handleReconfigure} 
                    className="transition-button small"
                    aria-label="Reconfigure StreamElements connection"
                  >
                    Reconfigure
                  </button>
                  {!showRevokeConfirm ? (
                    <button 
                      onClick={() => setShowRevokeConfirm(true)} 
                      className="danger-button small"
                      aria-label="Revoke StreamElements access"
                    >
                      Revoke Access
                    </button>
                  ) : (
                    <div className={styles.confirmRevoke}>
                      <p>Are you sure? This will disconnect and delete your credentials.</p>
                      <div className={styles.confirmButtons}>
                        <button 
                          onClick={handleRevoke} 
                          className="danger-button small"
                          aria-label="Confirm revoke access"
                        >
                          Yes, Revoke
                        </button>
                        <button 
                          onClick={() => setShowRevokeConfirm(false)} 
                          className="transition-button small"
                          aria-label="Cancel revoke"
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
                  aria-label="Configure StreamElements"
                >
                  Configure StreamElements
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
