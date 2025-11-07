import React, { useState } from 'react';
import { generateRandomName } from '../utils/nameGenerator';
import styles from './SetupScreen/SetupScreen.module.scss';
import type { SetupScreenProps } from '../types/component.types';

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, onOpenVolunteers, seConnected, seChannelName }) => {
  const [playerCount, setPlayerCount] = useState<number>(12);
  const [names, setNames] = useState<string[]>(Array(12).fill(''));

  const handleCountChange = (count: number): void => {
    setPlayerCount(count);
    setNames(Array(count).fill(''));
  };

  const handleNameChange = (index: number, value: string): void => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  // Helper function to find duplicate names
  const findDuplicateNames = (): Set<string> => {
    const nameCounts: Record<string, number> = {};
    const duplicates = new Set<string>();
    
    names.forEach(name => {
      const trimmedName = name.trim().toLowerCase();
      if (trimmedName) {
        nameCounts[trimmedName] = (nameCounts[trimmedName] || 0) + 1;
        if (nameCounts[trimmedName]! > 1) {
          duplicates.add(trimmedName);
        }
      }
    });
    
    return duplicates;
  };

  const randomizeEmptyNames = () => {
    const newNames = [...names];
    const usedNames = new Set();
    
    // Collect all existing names (including empty ones)
    names.forEach(name => {
      if (name.trim()) {
        usedNames.add(name.trim().toLowerCase());
      }
    });
    
    // Only randomize empty fields
    for (let i = 0; i < playerCount; i++) {
      if (!newNames[i]?.trim()) {
        let name;
        do {
          name = generateRandomName();
        } while (usedNames.has(name.toLowerCase()));
        usedNames.add(name.toLowerCase());
        newNames[i] = name;
      }
    }
    
    setNames(newNames);
    
    // Focus the start button after randomizing
    setTimeout(() => {
      const startButton = document.querySelector<HTMLButtonElement>('.start-button');
      if (startButton) {
        startButton.focus();
      }
    }, 0);
  };

  const [validationMessage, setValidationMessage] = useState('');

  const handleUseVolunteers = () => {
    onOpenVolunteers(playerCount);
  };

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
    <div className={styles.setupScreen}>
      <header className="game-header">
        <h1>Hunger Games Simulator</h1>
      </header>
      
      <div className="left-panel">

      <section className={styles.setupInfo}>
        <h3>Game Rules</h3>
        <p>
          The Hunger Games will begin with the Cornucopia bloodbath, followed by day and night phases
          until only one tribute remains.
        </p>
      </section>

      <section className={styles.setupInfo}>
        <h3>Game Setup</h3>
        <p>
          Configure your Hunger Games simulation by selecting the number of tributes and entering their names.
        </p>
      </section>

      <section className={styles.setupInfo}>
        <h3>Naming Requirements</h3>
        <ul>
          <li>Every tribute must have a name</li>
          <li>All names must be unique</li>
          <li>Names are limited to 30 characters</li>
          </ul>
          <ul>
          <p>Tips:</p>
          <li>
            Use the &quot;Randomize Unnamed&quot; button to fill empty fields
          </li>
        </ul>
      </section>
      </div>
      
      <div className="center-panel">
        <section aria-labelledby="tribute-count-heading">
          <h2 id="tribute-count-heading">Select Number of Tributes</h2>
          <fieldset>
            <div className={styles.buttonGroup} aria-labelledby="tribute-count-heading">
              {[12, 24, 48].map(count => (
                <button
                  key={count}
                  className={`transition-button small ${playerCount === count ? 'active' : ''}`}
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
          <div className="tribute-names-heading section-heading">
            <h2 id="tribute-names-heading">Enter names for each tribute</h2>
            <button onClick={randomizeEmptyNames} className="transition-button small" aria-label="Generate random names for empty tribute fields">
              Randomize Unnamed
            </button>
          </div>
        
          
          <fieldset>
            <div className={styles.districtsContainer}>
              {Array.from({ length: 12 }, (_, districtIndex) => {
                const tributesPerDistrict = playerCount / 12;
                const startIndex = districtIndex * tributesPerDistrict;
                const districtTributes = names.slice(startIndex, startIndex + tributesPerDistrict);
                
                return (
                  <div key={districtIndex} className={styles.districtGroup}>
                    <h3 className={styles.districtTitle} id={`district-${districtIndex + 1}-heading`}>District {districtIndex + 1}</h3>
                    <div className={styles.districtTributes} role="group" aria-labelledby={`district-${districtIndex + 1}-heading`}>
                      {districtTributes.map((name, tributeIndex) => {
                        const globalIndex = startIndex + tributeIndex;
                        const duplicates = findDuplicateNames();
                        const isDuplicate = name.trim() && duplicates.has(name.trim().toLowerCase());
                        
                        return (
                          <div key={globalIndex} className={`${styles.nameInputGroup} ${isDuplicate ? styles.hasDuplicate : ''}`}>
                            <label htmlFor={`tribute-${globalIndex}`}>Tribute {tributeIndex + 1}</label>
                            {isDuplicate && (
                              <div className={styles.duplicateError}>Duplicate name!</div>
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

      </div>
      
      <div className="right-panel">
        <div className={styles.actionControls}>
          {seConnected && (
            <>
            <div className={styles.volunteerOption}>
              <p className={styles.volunteerInfo}>
                Connected to: <strong>{seChannelName}</strong>
              </p>
              <button 
                onClick={handleUseVolunteers}
                className="transition-button large"
                aria-label="Use chat volunteers to fill tribute slots"
              >
                Use Chat Volunteers
              </button>
              <p className={styles.volunteerHelp}>
                Let your viewers volunteer as tributes!
              </p>
            </div>
            <div className={styles.divider}>or</div>
            </>
          )}
          
          <button onClick={startGame} className="transition-button large" aria-label="Start the Hunger Games simulation">
            Start the Games
          </button>
        </div>
      </div>
    </div>
  );
}

export default SetupScreen;
