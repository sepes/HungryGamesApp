import React from 'react';
import { useFocusTrap } from '../utils/useFocusTrap';

const TributesPanel = ({ gameEngine, isOpen, onClose }) => {
  const containerRef = useFocusTrap(isOpen);

  if (!gameEngine) return null;

  // Group all players by district
  const playersByDistrict = {};
  gameEngine.players.forEach(player => {
    if (!playersByDistrict[player.district]) {
      playersByDistrict[player.district] = [];
    }
    playersByDistrict[player.district].push(player);
  });

  const formatDeathInfo = (player) => {
    if (player.isAlive) return null;
    
    if (player.diedInPhase === 'cornucopia') {
      return 'fell in Cornucopia';
    } else if (player.diedInPhase === 'day') {
      return `fell on Day ${player.diedOnDay}`;
    } else if (player.diedInPhase === 'night') {
      return `fell on Night ${player.diedOnDay}`;
    }
    return 'Unknown';
  };

  return (
    <div className={`tributes-panel ${isOpen ? 'open' : ''}`} ref={containerRef}>
      <div className="tributes-panel-content">
        <div className="tributes-panel-header">
          <h2>All Tributes</h2>
          <button 
            onClick={onClose} 
            className="tributes-close-button"
            aria-label="Close tributes panel"
          >
            ×
          </button>
        </div>
        
        <div className="tributes-panel-body">
          {Object.keys(playersByDistrict)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(district => (
              <div key={district} className="district-group">
                <h3 className="district-title">District {district}</h3>
                <div className="district-tributes">
                  {playersByDistrict[district].map(player => (
                    <div 
                      key={player.id} 
                      className={`tribute-item ${player.isAlive ? 'tribute-alive' : 'tribute-fallen'}`}
                    >
                      <div className="tribute-main">
                        <div className="tribute-name-section">
                          <span className="tribute-name">{player.name}</span>
                        </div>
                        <div className="tribute-kills">
                          {player.kills} kills
                        </div>
                      </div>
                      <div className="tribute-status">
                        {player.isAlive ? (
                          <span className="tribute-status-alive">Alive</span>
                        ) : (
                          <span className="tribute-status-fallen">
                            Fallen {formatDeathInfo(player)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TributesPanel;
