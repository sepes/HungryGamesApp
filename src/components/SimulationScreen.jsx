import React, { useState } from 'react';
import TributesPanel from './TributesPanel';

const SimulationScreen = ({ events, onNext, gameEngine, currentPhase, showVictoryButton, onShowVictory, onResetGame }) => {
  const [showTributesPanel, setShowTributesPanel] = useState(false);
  
  if (!gameEngine) return null;
  
  const alivePlayers = gameEngine.players.filter(p => p.isAlive);
  const totalPlayers = gameEngine.players.length;

  const getPhaseDisplayName = (phase) => {
    switch(phase) {
      case 'cornucopia': return 'The Cornucopia';
      case 'day': return 'Day';
      case 'night': return 'Night';
      case 'fallen': return 'Fallen Tributes';
      default: return phase;
    }
  };

  return (
    <div className="simulation-container">
      <button 
        onClick={() => setShowTributesPanel(true)} 
        className="tributes-button"
        aria-label="View all tributes"
      >
        Tributes
      </button>
      
      <header className="game-header">
        <h2>Hunger Games Simulation</h2>
      </header>

      <section className="left-panel">
        <div className="game-stats" role="status" aria-label="Game statistics">
          <div className="stat">
            <span className="stat-label">Day:</span>
            <span className="stat-value" aria-label={`Day ${gameEngine.day}`}>{gameEngine.day}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Phase:</span>
            <span className="stat-value" aria-label={`Current phase: ${getPhaseDisplayName(currentPhase)}`}>{getPhaseDisplayName(currentPhase)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Alive:</span>
            <span className="stat-value" aria-label={`${alivePlayers.length} out of ${totalPlayers} tributes alive`}>{alivePlayers.length}/{totalPlayers}</span>
          </div>
        </div>
      </section>

      <div className="center-panel">
        <section className="event-display" aria-label="Game events" aria-live="polite">
          {events.map((event, index) => (
            <div key={index} className="event-line" dangerouslySetInnerHTML={{ __html: event }}>
            </div>
          ))}
        </section>
      </div>

      <section className="right-panel">
        <div className="action-controls">
          {showVictoryButton ? (
            <button onClick={onShowVictory} className="transition-button large" aria-label="View victory screen">
              View Victory
            </button>
          ) : (
            <button onClick={() => onNext()} className="transition-button large" aria-label="Advance to next game phase">
              Next Phase →
            </button>
          )}
        </div>
      </section>
      
      <TributesPanel 
        gameEngine={gameEngine}
        isOpen={showTributesPanel}
        onClose={() => setShowTributesPanel(false)}
      />
    </div>
  );
};

export default SimulationScreen;
