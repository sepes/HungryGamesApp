import React, { useState } from 'react';
import styles from './TributeList/TributeList.module.scss';
import type { Player } from '../types/game.types';

interface TributeListProps {
  players: Player[];
  type: 'alive' | 'fallen';
  title: string;
}

const TributeList: React.FC<TributeListProps> = ({ players, type, title }) => {
  const [sortBy, setSortBy] = useState(type === 'fallen' ? 'order' : 'district');
  const [reverseOrder, setReverseOrder] = useState(false);

  const getSortOptions = () => {
    if (type === 'fallen') {
      return [
        { value: 'order', label: 'Order of Death' },
        { value: 'district', label: 'District' },
        { value: 'kills', label: 'Kills' },
        { value: 'daysSurvived', label: 'Days Survived' }
      ];
    } else {
      return [
        { value: 'district', label: 'District' },
        { value: 'kills', label: 'Kills' }
      ];
    }
  };

  const sortPlayers = (players: Player[]) => {
    const sorted = [...players].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'district':
          comparison = a.district - b.district;
          break;
        case 'kills':
          comparison = b.kills - a.kills; // Higher kills first
          break;
        case 'daysSurvived':
          if (type === 'fallen') {
            comparison = (b.diedOnDay || 0) - (a.diedOnDay || 0); // Later death = more days survived
          }
          break;
        case 'order':
          // Keep original order for fallen players
          comparison = 0;
          break;
        default:
          comparison = 0;
      }
      
      return comparison;
    });
    
    return reverseOrder ? sorted.reverse() : sorted;
  };

  const formatDeathInfo = (player: Player): string | null => {
    if (type !== 'fallen') return null;
    
    if (player.diedInPhase === 'cornucopia') {
      return 'Fell in Cornucopia';
    } else if (player.diedInPhase === 'day') {
      return `Fell on Day ${player.diedOnDay}`;
    } else if (player.diedInPhase === 'night') {
      return `Fell on Night ${player.diedOnDay}`;
    }
    return 'Unknown';
  };

  const sortedPlayers = sortPlayers(players);

  return (
    <section className={type === 'alive' ? styles.aliveTributes : styles.fallenTributes} aria-labelledby={`${type}-tributes-heading`}>
      <h3 id={`${type}-tributes-heading`}>{title} ({players.length})</h3>
      
      <div className={styles.tributeControls}>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.tributeSortSelect}
          aria-label={`Sort ${type} tributes by`}
        >
          {getSortOptions().map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <button 
          onClick={() => setReverseOrder(!reverseOrder)}
          className={styles.tributeReverseButton}
          aria-label={`${reverseOrder ? 'Ascending' : 'Descending'} order`}
        >
          {reverseOrder ? '↑' : '↓'}
        </button>
      </div>

      <ul className={styles.tributeList}>
        {sortedPlayers.map(player => (
          <li key={player.id} className={type === 'alive' ? 'tribute-item' : styles.fallenTributeItem}>
            {type === 'alive' ? (
              <>
                <span className="tribute-name">{player.name}</span>
                <span className="tribute-district" aria-label={`District ${player.district}`}>D{player.district}</span>
                <span className="tribute-kills" aria-label={`${player.kills} kills`}>{player.kills} kills</span>
              </>
            ) : (
              <>
                <div className={styles.fallenTributeMain}>
                  <span className={styles.fallenTributeName}>{player.name}</span>
                  <span className={styles.fallenTributeDistrict} aria-label={`District ${player.district}`}>D{player.district}</span>
                </div>
                <div className={styles.fallenTributeStats}>
                  <span className={styles.fallenTributeKills} aria-label={`${player.kills} kills`}>{player.kills} kills</span>
                  <span className={styles.fallenTributePhase} aria-label={`${formatDeathInfo(player)}`}>{formatDeathInfo(player)}</span>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TributeList;
