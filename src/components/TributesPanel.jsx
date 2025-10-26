import React from 'react';
import { useFocusTrap } from '../utils/useFocusTrap';
import styles from './TributesPanel/TributesPanel.module.scss';

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
    <div className={`${styles.tributesPanel} ${isOpen ? styles.open : ''}`} ref={containerRef}>
      <div className={styles.tributesPanelContent}>
        <div className={styles.tributesPanelHeader}>
          <h2>All Tributes</h2>
          <button 
            onClick={onClose} 
            className="danger-button close"
            aria-label="Close tributes panel"
          >
            ×
          </button>
        </div>
        
        <div className={styles.tributesPanelBody}>
          {Object.keys(playersByDistrict)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(district => (
              <div key={district} className={styles.districtGroup}>
                <h3 className={styles.districtTitle}>District {district}</h3>
                <div className={styles.districtTributes}>
                  {playersByDistrict[district].map(player => (
                    <div 
                      key={player.id} 
                      className={`${styles.tributeItem} ${player.isAlive ? styles.tributeAlive : styles.tributeFallen}`}
                    >
                      <div className={styles.tributeMain}>
                        <div className={styles.tributeNameSection}>
                          <span className={styles.tributeName}>{player.name}</span>
                        </div>
                        <div className={styles.tributeKills}>
                          {player.kills} kills
                        </div>
                      </div>
                      <div className={styles.tributeStatus}>
                        {player.isAlive ? (
                          <div className="tribute-alive-details">
                            <span className={styles.tributeStatusAlive}>Alive</span>
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
                          <span className={styles.tributeStatusFallen}>
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
