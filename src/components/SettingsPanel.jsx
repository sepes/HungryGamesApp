import React, { useState } from 'react';
import { useFocusTrap } from '../utils/useFocusTrap';
import DebugTerminal from './DebugTerminal';

const SettingsPanel = ({ isOpen, onClose, onResetGame }) => {
  const containerRef = useFocusTrap(isOpen);
  const [showTerminal, setShowTerminal] = useState(false);

  return (
    <div className={`settings-panel ${isOpen ? 'open' : ''}`} ref={containerRef}>
      <div className="settings-panel-content">
        <div className="settings-panel-header">
          <h2>Settings</h2>
          <button 
            onClick={onClose} 
            className="danger-button close"
            aria-label="Close settings panel"
          >
            ×
          </button>
        </div>
        
        <div className="settings-panel-body">
          {/* Game Controls Section */}
          <div className="settings-section">
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
          <div className="settings-section">
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
                <DebugTerminal />
              </div>
            )}
          </div>
          
          {/* Future Settings Sections */}
          {/* 
          <div className="settings-section">
            <h3>Game Settings</h3>
            <!-- Future game settings will go here -->
          </div>
          
          <div className="settings-section">
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
