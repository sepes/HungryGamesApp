import React, { useState } from 'react';
import { useFocusTrap } from '../utils/useFocusTrap';
import DebugTerminal from './DebugTerminal';
import twitchLogo from '../assets/twitch-logo.svg';
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
  onReconfigureTwitch,
  onDisconnectTwitch,
  volunteers = [],
  maxVolunteerSlots = 0,
  onStartVolunteerCollection,
  onSubmitVolunteers,
  onCancelVolunteerCollection,
  setupTributeCount = 12,
  onMockVolunteers
}) => {
  const containerRef = useFocusTrap(isOpen);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<boolean>(false);
  const [showVolunteerCollection, setShowVolunteerCollection] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [dontAskAgainReset, setDontAskAgainReset] = useState<boolean>(false);
  const [dontAskAgainDisconnect, setDontAskAgainDisconnect] = useState<boolean>(false);

  const handleDisconnect = async (): Promise<void> => {
    if (onDisconnectTwitch) {
      await onDisconnectTwitch();
    }
    setShowDisconnectConfirm(false);
    setDontAskAgainDisconnect(false);
    onClose();
  };

  const handleDisconnectClick = (): void => {
    const skipConfirm = localStorage.getItem('skipTwitchDisconnectConfirm') === 'true';
    if (skipConfirm) {
      void handleDisconnect();
    } else {
      setShowDisconnectConfirm(true);
    }
  };

  const handleDisconnectConfirm = (): void => {
    if (dontAskAgainDisconnect) {
      localStorage.setItem('skipTwitchDisconnectConfirm', 'true');
    }
    void handleDisconnect();
  };

  const handleDisconnectCancel = (): void => {
    setShowDisconnectConfirm(false);
    setDontAskAgainDisconnect(false);
  };

  const handleReconfigure = (): void => {
    if (onReconfigureTwitch) {
      onReconfigureTwitch();
    }
    // Keep settings panel open
  };

  const handleResetClick = (): void => {
    const skipConfirm = localStorage.getItem('skipResetConfirm') === 'true';
    if (skipConfirm) {
      onResetGame();
      onClose();
    } else {
      setShowResetConfirm(true);
    }
  };

  const handleResetConfirm = (): void => {
    if (dontAskAgainReset) {
      localStorage.setItem('skipResetConfirm', 'true');
    }
    onResetGame();
    setShowResetConfirm(false);
    setDontAskAgainReset(false);
    onClose();
  };

  const handleResetCancel = (): void => {
    setShowResetConfirm(false);
    setDontAskAgainReset(false);
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
            <h3 className={styles.twitchSectionHeading}>
              Twitch Chat Integration
              <img src={twitchLogo} alt="Twitch Logo" className={styles.twitchLogo} />
            </h3>
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
                  <p className={styles.statusValue}>IRC</p>
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
                      onClick={handleDisconnectClick} 
                      className="danger-button small"
                      aria-label="Disconnect from Twitch"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <div className={styles.confirmRevoke}>
                      <p>Are you sure? This will disconnect from Twitch chat.</p>
                      <div className={styles.checkboxContainer}>
                        <label>
                          <input 
                            type="checkbox" 
                            checked={dontAskAgainDisconnect}
                            onChange={(e) => setDontAskAgainDisconnect(e.target.checked)}
                            aria-label="Don't ask again when disconnecting from Twitch"
                          />
                          <span>Don't ask again</span>
                        </label>
                      </div>
                      <div className={styles.confirmButtons}>
                        <button 
                          onClick={handleDisconnectConfirm} 
                          className="danger-button small"
                          aria-label="Confirm disconnect"
                        >
                          Yes, Disconnect
                        </button>
                        <button 
                          onClick={handleDisconnectCancel} 
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
          
          {/* Volunteer Collection Section */}
          <div className={styles.settingsSection}>
            <h3>Volunteer Collection</h3>
            <div className={styles.volunteerCollectionButtons}>
              <button 
                onClick={() => setShowVolunteerCollection(!showVolunteerCollection)} 
                className="transition-button small"
                aria-label={showVolunteerCollection ? "Hide volunteer collection" : "Show volunteer collection"}
              >
                {showVolunteerCollection ? 'Hide Volunteer Collection' : 'Show Volunteer Collection'}
              </button>
              {twitchConnected && maxVolunteerSlots === 0 && (
                <button 
                  onClick={async () => {
                    if (onStartVolunteerCollection && gamePhase === 'setup') {
                      await onStartVolunteerCollection(setupTributeCount);
                      setShowVolunteerCollection(true);
                    }
                  }}
                  className="transition-button small"
                  disabled={gamePhase !== 'setup' || !twitchConnected || !onStartVolunteerCollection}
                  aria-label="Start volunteer collection"
                >
                  Start Collection
                </button>
              )}
            </div>
            {showVolunteerCollection && (
              <div className={styles.volunteerCollectionContent}>
                {twitchConnected ? (
                  <>
                    {maxVolunteerSlots > 0 ? (
                      <>
                        <div className={styles.volunteerInfo}>
                          <h4>How to Join</h4>
                          <p>
                            Viewers can type <strong>&quot;I volunteer&quot;</strong> in chat to enter the Hunger Games!
                          </p>
                        </div>

                        <div className={styles.slotStatus} aria-live="polite">
                          <h4>Volunteer Status</h4>
                          <div className={styles.statusBar}>
                            <div className={styles.progressBar}>
                              <div 
                                className={styles.progress} 
                                style={{ width: `${(volunteers.length / maxVolunteerSlots) * 100}%` }}
                                role="progressbar"
                                aria-valuenow={volunteers.length}
                                aria-valuemin={0}
                                aria-valuemax={maxVolunteerSlots}
                                aria-label={`${volunteers.length} out of ${maxVolunteerSlots} volunteer slots filled`}
                              />
                            </div>
                            <span className={styles.statusText}>
                              {volunteers.length} / {maxVolunteerSlots} Tributes
                            </span>
                          </div>
                        </div>

                        <div className={styles.volunteerList}>
                          <h4 id="volunteer-list-heading">Current Volunteers</h4>
                          {volunteers.length === 0 ? (
                            <p className={styles.emptyMessage}>Waiting for volunteers...</p>
                          ) : (
                            <ul aria-labelledby="volunteer-list-heading">
                              {volunteers.map((name: string, idx: number) => (
                                <li key={idx} className={styles.volunteerItem}>
                                  <span className={styles.volunteerNumber}>{idx + 1}</span>
                                  <span className={styles.volunteerName}>{name}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className={styles.volunteerActions}>
                          <button 
                            onClick={() => {
                              if (onSubmitVolunteers && volunteers.length >= 1) {
                                onSubmitVolunteers(volunteers);
                              }
                            }}
                            className="transition-button small"
                            disabled={gamePhase !== 'setup' || !twitchConnected || volunteers.length < 1}
                            aria-label={volunteers.length >= 1 ? 'Submit volunteers and return to setup' : `Need at least 1 volunteer to submit (currently ${volunteers.length})`}
                            title={volunteers.length < maxVolunteerSlots && volunteers.length >= 1 ? 'Submit incomplete list - remaining slots will be empty' : undefined}
                          >
                            {volunteers.length < 1 
                              ? 'Waiting for Volunteers' 
                              : volunteers.length === maxVolunteerSlots 
                                ? `Submit (${volunteers.length} Tributes)` 
                                : `Submit anyway (${volunteers.length}/${maxVolunteerSlots})`}
                          </button>
                          
                          <button 
                            onClick={() => {
                              if (onCancelVolunteerCollection) {
                                onCancelVolunteerCollection();
                              }
                            }}
                            className="transition-button small orange"
                            disabled={gamePhase !== 'setup' || !twitchConnected}
                            aria-label="Cancel volunteer collection"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : null}
                  </>
                ) : (
                  <p className={styles.statusDisconnected}>
                    Connect to Twitch Chat to enable volunteer collection.
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Game Controls Section */}
          <div className={styles.settingsSection}>
            <h3>Game Controls</h3>
            {!showResetConfirm ? (
              <button 
                onClick={handleResetClick} 
                className="danger-button small"
                aria-label="Reset game and return to setup screen"
              >
                Reset Game
              </button>
            ) : (
              <div className={styles.confirmRevoke}>
                <p>Are you sure? This will reset the game and return to setup.</p>
                <div className={styles.checkboxContainer}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={dontAskAgainReset}
                      onChange={(e) => setDontAskAgainReset(e.target.checked)}
                      aria-label="Don't ask again when resetting game"
                    />
                    <span>Don't ask again</span>
                  </label>
                </div>
                <div className={styles.confirmButtons}>
                  <button 
                    onClick={handleResetConfirm} 
                    className="danger-button small"
                    aria-label="Confirm reset game"
                  >
                    Yes, Reset Game
                  </button>
                  <button 
                    onClick={handleResetCancel} 
                    className="transition-button small"
                    aria-label="Cancel reset"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
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
                  onMockVolunteers={onMockVolunteers}
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
