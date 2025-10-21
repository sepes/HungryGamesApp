import React from 'react';

const SimulationScreen = ({ events, onNext, gameEngine, currentPhase, showVictoryButton, onShowVictory }) => {
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
      <header className="game-header">
        <h2>Hunger Games Simulation</h2>
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
      </header>

      <section className="event-display" aria-label="Game events" aria-live="polite">
        {events.map((event, index) => (
          <div key={index} className="event-line" dangerouslySetInnerHTML={{ __html: event }}>
          </div>
        ))}
      </section>
      
      <div className="controls">
        <section className="alive-tributes" aria-labelledby="alive-tributes-heading">
          <h3 id="alive-tributes-heading">Alive Tributes ({alivePlayers.length})</h3>
          <ul className="tribute-list">
            {alivePlayers.map(player => (
              <li key={player.id} className="tribute-item">
                <span className="tribute-name">{player.name}</span>
                <span className="tribute-district" aria-label={`District ${player.district}`}>D{player.district}</span>
                <span className="tribute-kills" aria-label={`${player.kills} kills`}>{player.kills} kills</span>
              </li>
            ))}
          </ul>
        </section>
        
        <div className="action-controls">
          {showVictoryButton ? (
            <button onClick={onShowVictory} className="victory-button" aria-label="View victory screen">
              View Victory
            </button>
          ) : (
            <button onClick={() => onNext()} className="next-button" aria-label="Advance to next game phase">
              Next Phase →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationScreen;
