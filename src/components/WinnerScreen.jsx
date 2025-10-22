import React from 'react';

const WinnerScreen = ({ winner, eventHistory, onReset }) => {
  if (!winner) return null;
  
  // Calculate statistics
  const daysSimulated = Math.floor(eventHistory.length / 3); // Rough estimate
  const totalEvents = eventHistory.flat().length;

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
              <span className="stat-value">D{winner.district}</span>
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
            <h2 className="winner-name" id="winner-details-heading">{winner.name}</h2>
            <dl className="winner-details">
              <div className="detail-item">
                <dt className="detail-label">District:</dt>
                <dd className="detail-value" aria-label={`District ${winner.district}`}>{winner.district}</dd>
              </div>
              <div className="detail-item">
                <dt className="detail-label">Kills:</dt>
                <dd className="detail-value" aria-label={`${winner.kills} kills`}>{winner.kills}</dd>
              </div>
              <div className="detail-item">
                <dt className="detail-label">Days Survived:</dt>
                <dd className="detail-value" aria-label={`${daysSimulated} days survived`}>{daysSimulated}</dd>
              </div>
              <div className="detail-item">
                <dt className="detail-label">Total Events:</dt>
                <dd className="detail-value" aria-label={`${totalEvents} total events`}>{totalEvents}</dd>
              </div>
            </dl>
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
          <button onClick={onReset} className="reset-button" aria-label="Start a new Hunger Games simulation">
            New Game
          </button>
        </div>
      </div>

      <div className="right-panel">
        <section className="fallen-tributes" aria-labelledby="fallen-tributes-heading">
          <h3 id="fallen-tributes-heading">Fallen Tributes</h3>
          <p>All other tributes have fallen in the arena.</p>
        </section>
      </div>

      <details className="history-details" aria-label="Game history">
        <summary>View Full Game History</summary>
        <div className="history-log" role="log" aria-label="Complete game event history">
          {eventHistory.map((segment, idx) => (
            <div key={idx} className="history-segment">
              {segment.map((event, i) => (
                <div key={i} className="history-event">{event}</div>
              ))}
              <hr className="segment-divider" />
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

export default WinnerScreen;
