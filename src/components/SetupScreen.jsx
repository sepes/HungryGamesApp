import React, { useState } from 'react';
import { generateRandomName } from '../utils/nameGenerator';

const SetupScreen = ({ onStart }) => {
  const [playerCount, setPlayerCount] = useState(12);
  const [names, setNames] = useState(Array(12).fill(''));

  const handleCountChange = (count) => {
    setPlayerCount(count);
    setNames(Array(count).fill(''));
  };

  const handleNameChange = (index, value) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  // Helper function to find duplicate names
  const findDuplicateNames = () => {
    const nameCounts = {};
    const duplicates = new Set();
    
    names.forEach(name => {
      const trimmedName = name.trim().toLowerCase();
      if (trimmedName) {
        nameCounts[trimmedName] = (nameCounts[trimmedName] || 0) + 1;
        if (nameCounts[trimmedName] > 1) {
          duplicates.add(trimmedName);
        }
      }
    });
    
    return duplicates;
  };

  const randomizeNames = () => {
    const newNames = [];
    const usedNames = new Set();
    
    for (let i = 0; i < playerCount; i++) {
      let name;
      do {
        name = generateRandomName();
      } while (usedNames.has(name));
      usedNames.add(name);
      newNames.push(name);
    }
    
    setNames(newNames);
  };

  const [validationMessage, setValidationMessage] = useState('');

  const startGame = () => {
    // Validate names
    const filledNames = names.filter(n => n.trim() !== '');
    if (filledNames.length < playerCount) {
      setValidationMessage(`Please enter all ${playerCount} names or use Randomize`);
      return;
    }

    // Check for duplicates
    const uniqueNames = new Set(filledNames.map(n => n.trim()));
    if (uniqueNames.size < playerCount) {
      setValidationMessage('All names must be unique!');
      return;
    }

    setValidationMessage('');

    // Create players
    const players = names.map((name, i) => ({
      id: `player-${i}`,
      name: name.trim(),
      district: Math.floor(i / (playerCount / 12)) + 1,
      isAlive: true,
      kills: 0,
      items: [],
      diedInPhase: null,
      diedOnDay: null
    }));

    onStart(players);
  };

  return (
    <div className="setup-screen">
      <header className="game-header">
        <h1>Hunger Games Simulator</h1>
      </header>
      
      <div className="left-panel">
        <section className="setup-info">
          <h3>Game Setup</h3>
          <p>Configure your Hunger Games simulation by selecting the number of tributes and entering their names.</p>
        </section>
      </div>
      
      <div className="center-panel">
        <section aria-labelledby="tribute-count-heading">
          <h2 id="tribute-count-heading">Select Number of Tributes</h2>
          <fieldset>
            <legend className="sr-only">Choose the number of tributes for the game</legend>
            <div className="button-group" aria-labelledby="tribute-count-heading">
              {[12, 24, 48].map(count => (
                <button
                  key={count}
                  className={`count-button ${playerCount === count ? 'active' : ''}`}
                  onClick={() => handleCountChange(count)}
                  aria-pressed={playerCount === count}
                  aria-label={`${count} tributes`}
                >
                  {count} Tributes
                </button>
              ))}
            </div>
          </fieldset>
        </section>

        <section aria-labelledby="tribute-names-heading">
          <h2 id="tribute-names-heading">Enter Tribute Names</h2>
          <button onClick={randomizeNames} className="randomize-button" aria-label="Generate random names for all tributes">
            Randomize All Names
          </button>
        
          
          <fieldset>
            <legend className="sr-only">Enter names for each tribute</legend>
            <div className="districts-container">
              {Array.from({ length: 12 }, (_, districtIndex) => {
                const tributesPerDistrict = playerCount / 12;
                const startIndex = districtIndex * tributesPerDistrict;
                const districtTributes = names.slice(startIndex, startIndex + tributesPerDistrict);
                
                return (
                  <div key={districtIndex} className="district-group">
                    <h3 className="district-title" id={`district-${districtIndex + 1}-heading`}>District {districtIndex + 1}</h3>
                    <div className="district-tributes" role="group" aria-labelledby={`district-${districtIndex + 1}-heading`}>
                      {districtTributes.map((name, tributeIndex) => {
                        const globalIndex = startIndex + tributeIndex;
                        const duplicates = findDuplicateNames();
                        const isDuplicate = name.trim() && duplicates.has(name.trim().toLowerCase());
                        
                        return (
                          <div key={globalIndex} className={`name-input-group ${isDuplicate ? 'has-duplicate' : ''}`}>
                            <label htmlFor={`tribute-${globalIndex}`}>Tribute {tributeIndex + 1}</label>
                            {isDuplicate && (
                              <div className="duplicate-error">Duplicate name!</div>
                            )}
                            <input
                              id={`tribute-${globalIndex}`}
                              type="text"
                              value={name}
                              onChange={(e) => handleNameChange(globalIndex, e.target.value)}
                              placeholder="Enter name"
                              maxLength={30}
                              aria-label={`Tribute {tributeIndex + 1} from District {districtIndex + 1}`}
                              aria-describedby={globalIndex === 0 ? "name-instructions" : undefined}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>
        </section>

        <div aria-live="polite" aria-atomic="true">
          {validationMessage && (
            <div role="alert" className="validation-message">
              {validationMessage}
            </div>
          )}
        </div>

      <div id="name-instructions" className="name-instructions">
        Enter a unique name for each tribute. Names must be unique across all districts.
      </div>

        <button onClick={startGame} className="start-button" aria-label="Start the Hunger Games simulation">
          Start the Games
        </button>
      </div>
      
      <div className="right-panel">
        <section className="setup-info">
          <h3>Game Rules</h3>
          <p>The Hunger Games will begin with the Cornucopia bloodbath, followed by day and night phases until only one tribute remains.</p>
        </section>
      </div>
    </div>
  );
}

export default SetupScreen;
