import React, { useState } from 'react';
import HistoryModal from './HistoryModal';
import styles from './WinnerScreen/WinnerScreen.module.scss';
import type { WinnerScreenProps } from '../types/component.types';

const WinnerScreen: React.FC<WinnerScreenProps> = ({ winner, eventHistory, gameEngine, onReset }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [dontAskAgainReset, setDontAskAgainReset] = useState(false);
  
  if (!winner) return null;
  
  // Calculate statistics
  const daysSimulated = Math.floor(eventHistory.length / 3); // Rough estimate

  // Create sorted list of fallen tributes (excluding winner)
  const fallenTributes = gameEngine?.players
    .filter(player => !player.isAlive)
    .sort((a, b) => b.kills - a.kills) || [];

  const handleResetClick = (): void => {
    const skipConfirm = localStorage.getItem('skipResetConfirm') === 'true';
    if (skipConfirm) {
      onReset();
    } else {
      setShowResetConfirm(true);
    }
  };

  const handleResetConfirm = (): void => {
    if (dontAskAgainReset) {
      localStorage.setItem('skipResetConfirm', 'true');
    }
    onReset();
    setShowResetConfirm(false);
    setDontAskAgainReset(false);
  };

  const handleResetCancel = (): void => {
    setShowResetConfirm(false);
    setDontAskAgainReset(false);
  };

  return (
    <div className={styles.winnerContainer}>
      <div className={styles.victoryCelebration} role="status" aria-live="polite">
        <h1 className={styles.winnerTitle}>VICTOR</h1>
      </div>
      
      <div className="left-panel">
        <section className="alive-tributes" aria-labelledby="winner-stats-heading">
          <h3 id="winner-stats-heading">Victor Stats</h3>
          <div className={styles.winnerStats}>
            <div className={styles.statItem}>
              <span className="stat-label">Name:</span>
              <span className="stat-value">{winner.name}</span>
            </div>
            <div className={styles.statItem}>
              <span className="stat-label">District:</span>
              <span className="stat-value">{winner.district}</span>
            </div>
            <div className={styles.statItem}>
              <span className="stat-label">Kills:</span>
              <span className="stat-value">{winner.kills}</span>
            </div>
            <div className={styles.statItem}>
              <span className="stat-label">Days Survived:</span>
              <span className="stat-value">{daysSimulated}</span>
            </div>
          </div>
        </section>
      </div>
      
      <div className="center-panel">
        <section className={styles.winnerInfo} aria-labelledby="winner-details-heading">
          <article className={styles.winnerCard}>
            <h2 className={styles.winnerName} id="winner-details-heading">{winner.name} from District {winner.district}</h2>
          </article>
        </section>

        <section className={styles.finalMessage} aria-labelledby="victory-declaration-heading">
          <h3 id="victory-declaration-heading">Victory Declaration</h3>
          <p>
            {winner.name} has emerged victorious from the this year's Hunger Games, 
            outlasting all other tributes in a 
            brutal competition that lasted {daysSimulated} days.
            {winner.kills > 0 && ` With ${winner.kills} kill${winner.kills > 1 ? 's' : ''}, they proved their dominance in the arena.`}
          </p>
        </section>

        <div className={styles.actionButtons}>
          {!showResetConfirm ? (
            <>
              <button onClick={handleResetClick} className="transition-button large" aria-label="Start a new Hunger Games simulation">
                New Game
              </button>
              <button 
                onClick={() => setShowHistory(true)} 
                className="transition-button large" 
                aria-label="View complete game history"
              >
                View Full Game History
              </button>
            </>
          ) : (
            <div className={styles.confirmReset}>
              <p>Are you sure you want to start a new game? This will reset everything.</p>
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
                  className="danger-button large"
                  aria-label="Confirm start new game"
                >
                  Yes, New Game
                </button>
                <button 
                  onClick={handleResetCancel} 
                  className="transition-button large"
                  aria-label="Cancel new game"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="right-panel">
        <section className="fallen-tributes" aria-labelledby="fallen-tributes-heading">
          <h3 id="fallen-tributes-heading">Fallen Tributes</h3>
          <div className="fallen-tributes-list">
            {fallenTributes.map(player => (
              <div key={player.id} className="tribute-item tribute-fallen">
                  <div className="tribute-name-section">
                    <span className="tribute-name">{player.name}</span>
                  </div>
                  <div className="tribute-kills">
                    {player.kills} kills
                  </div>
                <div className="tribute-district">
                  D{player.district}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <HistoryModal 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        eventHistory={eventHistory}
        gameEngine={gameEngine}
      />
    </div>
  );
};

export default WinnerScreen;
