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
      return 'Fell in Cornucopia';
    } else if (player.diedInPhase === 'day') {
      return `Fell on Day ${player.diedOnDay}`;
    } else if (player.diedInPhase === 'night') {
      return `Fell on Night ${player.diedOnDay}`;
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
            className="danger-button close"
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
                          <div className="tribute-alive-details">
                            <span className="tribute-status-alive">Alive</span>
                            {player.inventory && player.inventory.length > 0 && (
                              <div className="tribute-inventory">
                                <strong>Items:</strong> {player.inventory.map(item => `${item.name} (${item.uses})`).join(', ')}
                              </div>
                            )}
                            {player.alliances && player.alliances.length > 0 && (
                              <div className="tribute-alliances">
                                <strong>Allies:</strong> {player.alliances.map(allyId => {
                                  const ally = gameEngine.players.find(p => p.id === allyId);
                                  return ally ? ally.name : 'Unknown';
                                }).join(', ')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="tribute-status-fallen">
                            {formatDeathInfo(player)}
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
