import React, { useState } from 'react';
import { generateRandomName } from '../utils/nameGenerator';
import styles from './SetupScreen/SetupScreen.module.scss';
import type { SetupScreenProps } from '../types/component.types';

interface CustomTributeConfig {
  tributes: number;
  districts: number;
  tributesPerDistrict: number;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, onOpenVolunteers, seConnected, seChannelName, onTributeConfigUpdate, onConnectToTwitch, preFilledNames = [], preFilledCount = 0, onClearPreFilled }) => {
  const [playerCount, setPlayerCount] = useState<number>(12);
  const [names, setNames] = useState<string[]>(Array(12).fill(''));
  const [customTributeConfig, setCustomTributeConfig] = useState<CustomTributeConfig | null>(null);

  // Load pre-filled names from volunteers when they exist
  React.useEffect(() => {
    if (preFilledNames && preFilledNames.length > 0 && preFilledCount > 0) {
      // Use the count from volunteer collection
      setPlayerCount(preFilledCount);
      const newNames = Array(preFilledCount).fill('');
      preFilledNames.forEach((name, idx) => {
        newNames[idx] = name;
      });
      setNames(newNames);
      
      // Clear the pre-filled names after loading
      if (onClearPreFilled) {
        onClearPreFilled();
      }
    }
  }, [preFilledNames, preFilledCount, onClearPreFilled]);

  // Shared function to update player count while preserving names
  const updatePlayerCountPreservingNames = (count: number): void => {
    setPlayerCount(count);
    
    // Preserve existing names when changing count
    const newNames = Array(count).fill('');
    names.forEach((name, idx) => {
      if (idx < count) {
        newNames[idx] = name;
      }
    });
    
    setNames(newNames);
  };

  const handleCountChange = (count: number): void => {
    updatePlayerCountPreservingNames(count);
    setCustomTributeConfig(null); // Clear custom config when using preset buttons
  };

  // Handle custom tribute configuration from terminal
  React.useEffect(() => {
    if (onTributeConfigUpdate) {
      (window as any).updateTributeConfig = (config: CustomTributeConfig) => {
        setCustomTributeConfig(config);
        updatePlayerCountPreservingNames(config.tributes);
      };
    }
    return () => {
      if ((window as any).updateTributeConfig) {
        delete (window as any).updateTributeConfig;
      }
    };
  }, [onTributeConfigUpdate, names]); // Add 'names' dependency

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
    if (!seConnected) {
      // If not connected, trigger the connection flow
      if (onConnectToTwitch) {
        onConnectToTwitch();
      }
      return;
    }
    console.log('[SetupScreen] Opening volunteers with playerCount:', playerCount);
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

    // Create players with proper district assignment
    const players = names.map((name, i) => {
      let district: number;
      if (customTributeConfig) {
        const numDistricts = customTributeConfig.districts;
        const basePerDistrict = customTributeConfig.tributesPerDistrict;
        const remainder = playerCount % numDistricts;
        const cutoff = remainder * (basePerDistrict + 1);
        
        // Distribute remainders from first districts onwards
        if (i < cutoff) {
          district = Math.floor(i / (basePerDistrict + 1)) + 1;
        } else {
          district = remainder + Math.floor((i - cutoff) / basePerDistrict) + 1;
        }
      } else {
        const basePerDistrict = Math.floor(playerCount / 12);
        const remainder = playerCount % 12;
        const cutoff = remainder * (basePerDistrict + 1);
        
        if (i < cutoff) {
          district = Math.floor(i / (basePerDistrict + 1)) + 1;
        } else {
          district = remainder + Math.floor((i - cutoff) / basePerDistrict) + 1;
        }
      }
      
      return {
        id: `player-${i}`,
        name: name.trim(),
        district: district,
        isAlive: true,
        kills: 0,
        items: [],
        diedInPhase: null,
        diedOnDay: null
      };
    });

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
                  className={`transition-button small ${playerCount === count && !customTributeConfig ? 'active' : ''}`}
                  onClick={() => handleCountChange(count)}
                  aria-pressed={playerCount === count && !customTributeConfig}
                  aria-label={`${count} tributes`}
                >
                  {count} Tributes
                </button>
              ))}
            </div>
            {customTributeConfig && (
              <div className={styles.customConfigInfo}>
                Custom: {customTributeConfig.tributes} tributes, {customTributeConfig.districts} districts
              </div>
            )}
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
              {Array.from({ length: customTributeConfig ? customTributeConfig.districts : 12 }, (_, districtIndex) => {
                const numDistricts = customTributeConfig ? customTributeConfig.districts : 12;
                const basePerDistrict = customTributeConfig ? customTributeConfig.tributesPerDistrict : Math.floor(playerCount / 12);
                
                // Distribute remainders from first districts onwards
                const remainder = playerCount % numDistricts;
                const districtTributeCount = districtIndex < remainder ? basePerDistrict + 1 : basePerDistrict;
                
                // Calculate start index: districts before remainder get +1, after get base amount
                const startIndex = districtIndex < remainder 
                  ? districtIndex * (basePerDistrict + 1)
                  : remainder * (basePerDistrict + 1) + (districtIndex - remainder) * basePerDistrict;
                
                const districtTributes = names.slice(startIndex, startIndex + districtTributeCount);
                
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
              {seConnected ? (
                <>Connected to: <strong>{seChannelName}</strong></>
              ) : (
                'Not connected to Twitch'
              )}
            </p>
            <button 
              onClick={handleUseVolunteers}
              className="transition-button large"
              aria-label={seConnected ? "Use chat volunteers to fill tribute slots" : "Connect to Twitch to use chat volunteers"}
            >
              Use Chat Volunteers
            </button>
            <p className={styles.volunteerHelp}>
              {seConnected 
                ? 'Let your viewers volunteer as tributes!' 
                : 'Connect to Twitch to let viewers volunteer!'
              }
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
