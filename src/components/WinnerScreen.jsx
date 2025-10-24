import React, { useState } from 'react';
import HistoryModal from './HistoryModal';

const WinnerScreen = ({ winner, eventHistory, gameEngine, onReset }) => {
  const [showHistory, setShowHistory] = useState(false);
  
  if (!winner) return null;
  
  // Calculate statistics
  const daysSimulated = Math.floor(eventHistory.length / 3); // Rough estimate

  // Create sorted list of fallen tributes (excluding winner)
  const fallenTributes = gameEngine?.players
    .filter(player => !player.isAlive)
    .sort((a, b) => b.kills - a.kills) || [];

  return (
    <div className="winner-container">
      <div className="victory-celebration" role="status" aria-live="polite">
        <h1 className="winner-title">VICTOR</h1>
      </div>
      
      <div className="left-panel">
        <section className="alive-tributes" aria-labelledby="winner-stats-heading">
          <h3 id="winner-stats-heading">Victor Stats</h3>
          <div className="winner-stats">
            <div className="stat-item">
              <span className="stat-label">Name:</span>
              <span className="stat-value">{winner.name}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">District:</span>
              <span className="stat-value">{winner.district}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Kills:</span>
              <span className="stat-value">{winner.kills}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Days Survived:</span>
              <span className="stat-value">{daysSimulated}</span>
            </div>
          </div>
        </section>
      </div>
      
      <div className="center-panel">
        <section className="winner-info" aria-labelledby="winner-details-heading">
          <article className="winner-card">
            <h2 className="winner-name" id="winner-details-heading">{winner.name} from District {winner.district}</h2>
          </article>
        </section>

        <section className="final-message" aria-labelledby="victory-declaration-heading">
          <h3 id="victory-declaration-heading">Victory Declaration</h3>
          <p>
            {winner.name} has emerged victorious from the 74th Hunger Games, 
            outlasting all other tributes in a 
            brutal competition that lasted {daysSimulated} days.
            {winner.kills > 0 && ` With ${winner.kills} kill${winner.kills > 1 ? 's' : ''}, they proved their dominance in the arena.`}
          </p>
        </section>

        <div className="action-buttons">
          <button onClick={onReset} className="transition-button large" aria-label="Start a new Hunger Games simulation">
            New Game
          </button>
          <button 
            onClick={() => setShowHistory(true)} 
            className="transition-button large" 
            aria-label="View complete game history"
          >
            View Full Game History
          </button>
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
      />
    </div>
  );
};

export default WinnerScreen;
