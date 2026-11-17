import React, { useState, useEffect } from 'react';
import { useFocusTrap } from '../utils/useFocusTrap';
import styles from './TributesPanel/TributesPanel.module.scss';
import type { Player } from '../types/game.types';
import { GameLoop } from '../engine/gameLoop';

interface TributesPanelProps {
  gameEngine: GameLoop | null;
  isOpen: boolean;
  onClose: () => void;
  showDamage: boolean;
}

const TributesPanel: React.FC<TributesPanelProps> = ({ gameEngine, isOpen, onClose, showDamage }) => {
  const containerRef = useFocusTrap(isOpen);
  const [showDamageFor, setShowDamageFor] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!gameEngine) return;
    if (showDamage) {
      setShowDamageFor(new Set(gameEngine.players.map(p => p.id)));
    } else {
      setShowDamageFor(new Set());
    }
  }, [showDamage, gameEngine]);

  const toggleDamage = (playerId: string) => {
    setShowDamageFor(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  if (!gameEngine) return null;

  // Group all players by district
  const playersByDistrict: { [key: number]: Player[] } = {};
  gameEngine.players.forEach(player => {
    if (!playersByDistrict[player.district]) {
      playersByDistrict[player.district] = [];
    }
    playersByDistrict[player.district]!.push(player);
  });

  const formatDeathInfo = (player: Player): string | null => {
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
                  {(playersByDistrict[parseInt(district)] || []).map((player: Player) => (
                    <div 
                      key={player.id} 
                      className={`${styles.tributeItem} ${player.isAlive ? styles.tributeAlive : styles.tributeFallen}`}
                    >
                      <div className={styles.tributeMain}>
                        <div className={styles.tributeNameSection}>
                          <span className={styles.tributeName}>{player.name}</span>
                        </div>
                        <div className={styles.tributeStats}>
                          <div className={styles.tributeKills}>
                            {player.kills} kills
                          </div>
                          {player.isAlive && (
                            <>
                              <button 
                                onClick={() => toggleDamage(player.id)} 
                                className={styles.damageToggleButton}
                                aria-label={showDamageFor.has(player.id) ? "Hide damage" : "Show damage"}
                              >
                                dmg
                              </button>
                              {showDamageFor.has(player.id) && (
                                <div className={styles.tributeDamage}>
                                  {player.damage || 0}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className={styles.tributeStatus}>
                        {player.isAlive ? (
                          <div className="tribute-alive-details">
                            <span className={styles.tributeStatusAlive}>Alive</span>
                            {player.inventory && player.inventory.length > 0 && (
                              <div className="tribute-inventory">
                                <strong>Items:</strong> {player.inventory.map((item) => item.name).join(', ')}
                              </div>
                            )}
                            {player.alliances && player.alliances.length > 0 && (
                              <div className="tribute-alliances">
                                <strong>Allies:</strong> {player.alliances.map((allyId: string) => {
                                  const ally = gameEngine?.players.find(p => p.id === allyId);
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
