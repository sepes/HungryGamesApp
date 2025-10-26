import React, { useState } from 'react';
import { useFocusTrap } from '../utils/useFocusTrap';
import DebugTerminal from './DebugTerminal';
import styles from './SettingsPanel/SettingsPanel.module.scss';

const SettingsPanel = ({ isOpen, onClose, onResetGame, gameEngine, gamePhase, onNext, onShowVictory, showVictoryButton }) => {
  const containerRef = useFocusTrap(isOpen);
  const [showTerminal, setShowTerminal] = useState(false);

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
