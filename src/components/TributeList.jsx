import React, { useState } from 'react';

const TributeList = ({ players, type, title }) => {
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

  const sortPlayers = (players) => {
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

  const formatDeathInfo = (player) => {
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
    <section className={type === 'alive' ? 'alive-tributes' : 'fallen-tributes'} aria-labelledby={`${type}-tributes-heading`}>
      <h3 id={`${type}-tributes-heading`}>{title} ({players.length})</h3>
      
      <div className="tribute-controls">
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="tribute-sort-select"
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
          className="tribute-reverse-button"
          aria-label={`${reverseOrder ? 'Ascending' : 'Descending'} order`}
        >
          {reverseOrder ? '↑' : '↓'}
        </button>
      </div>

      <ul className="tribute-list">
        {sortedPlayers.map(player => (
          <li key={player.id} className={type === 'alive' ? 'tribute-item' : 'fallen-tribute-item'}>
            {type === 'alive' ? (
              <>
                <span className="tribute-name">{player.name}</span>
                <span className="tribute-district" aria-label={`District ${player.district}`}>D{player.district}</span>
                <span className="tribute-kills" aria-label={`${player.kills} kills`}>{player.kills} kills</span>
              </>
            ) : (
              <>
                <div className="fallen-tribute-main">
                  <span className="fallen-tribute-name">{player.name}</span>
                  <span className="fallen-tribute-district" aria-label={`District ${player.district}`}>D{player.district}</span>
                </div>
                <div className="fallen-tribute-stats">
                  <span className="fallen-tribute-kills" aria-label={`${player.kills} kills`}>{player.kills} kills</span>
                  <span className="fallen-tribute-phase" aria-label={`${formatDeathInfo(player)}`}>{formatDeathInfo(player)}</span>
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
