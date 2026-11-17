import React, { useState, useEffect, useRef } from 'react';
import TributesPanel from './TributesPanel';
import EventText from './EventText';
import styles from './SimulationScreen/SimulationScreen.module.scss';
import type { SimulationScreenProps } from '../types/component.types';

interface FallenAnimationState {
  isPlaying: boolean;
  currentIndex: number;
  isVisible: boolean;
  isAnimating: boolean;
  isHurried: boolean;
}

const SimulationScreen: React.FC<SimulationScreenProps> = ({ events, onNext, gameEngine, currentPhase, showVictoryButton, onShowVictory, onResetGame: _onResetGame, tributeData, showDamage, skipFallen, onFallenAnimationComplete }) => {
  const [showTributesPanel, setShowTributesPanel] = useState<boolean>(false);
  const [fallenAnimation, setFallenAnimation] = useState<FallenAnimationState>({
    isPlaying: false,
    currentIndex: 0,
    isVisible: false,
    isAnimating: false,
    isHurried: false
  });
  const skipFallenRef = useRef<boolean>(skipFallen);
  skipFallenRef.current = skipFallen;

  // Handle fallen cannon animation
  useEffect(() => {
    if (!skipFallenRef.current && currentPhase === 'fallen' && tributeData && tributeData.length > 0) {
      setFallenAnimation({
        isPlaying: true,
        currentIndex: 0,
        isVisible: false,
        isAnimating: false,
        isHurried: false
      });
    } else {
      setFallenAnimation({
        isPlaying: false,
        currentIndex: 0,
        isVisible: false,
        isAnimating: false,
        isHurried: false
      });
    }
  }, [currentPhase, tributeData]);

  useEffect(() => {
    if (skipFallen) {
      setFallenAnimation({
        isPlaying: false,
        currentIndex: 0,
        isVisible: false,
        isAnimating: false,
        isHurried: false
      });
    }
  }, [skipFallen]);

  const onFallenAnimationCompleteRef = useRef(onFallenAnimationComplete);
  onFallenAnimationCompleteRef.current = onFallenAnimationComplete;

  // Animation sequence
  useEffect(() => {
    if (!fallenAnimation.isPlaying || !tributeData || tributeData.length === 0) return;

    const currentTribute = tributeData[fallenAnimation.currentIndex];
    if (!currentTribute) return;

    let displayTimeout: ReturnType<typeof setTimeout> | undefined;
    let fadeOutTimeout: ReturnType<typeof setTimeout> | undefined;

    // Start fade in
    setFallenAnimation(prev => ({ ...prev, isAnimating: true, isVisible: true }));
 
    // After fade in completes, wait, then fade out
    const fadeInTimeout = setTimeout(() => {
      setFallenAnimation(prev => ({ ...prev, isAnimating: false }));
      
      // Wait for display time, then fade out
      displayTimeout = setTimeout(() => {
        setFallenAnimation(prev => ({ ...prev, isAnimating: true, isVisible: false }));
        
        // After fade out completes, move to next tribute or end
        fadeOutTimeout = setTimeout(() => {
          if (fallenAnimation.currentIndex < tributeData.length - 1) {
            setFallenAnimation(prev => ({
              ...prev,
              currentIndex: prev.currentIndex + 1,
              isAnimating: false
            }));
          } else {
            // Animation complete
            setFallenAnimation({
              isPlaying: false,
              currentIndex: 0,
              isVisible: false,
              isAnimating: false,
              isHurried: false
            });
            onFallenAnimationCompleteRef.current();
          }
        }, fallenAnimation.isHurried ? 500 : 1000); // Fade out duration
      }, fallenAnimation.isHurried ? 1000 : 2000); // Display time
    }, fallenAnimation.isHurried ? 500 : 1000); // Fade in duration

    return () => {
      clearTimeout(fadeInTimeout);
      if (displayTimeout) clearTimeout(displayTimeout);
      if (fadeOutTimeout) clearTimeout(fadeOutTimeout);
    };
  }, [fallenAnimation.currentIndex, fallenAnimation.isPlaying, fallenAnimation.isHurried, tributeData]);
  
  if (!gameEngine) return null;
  
  const alivePlayers = gameEngine.players.filter(p => p.isAlive);
  const totalPlayers = gameEngine.players.length;

  const hurryUpAnimation = () => {
    setFallenAnimation(prev => ({ ...prev, isHurried: true }));
  };

  const skipFallenAnimation = () => {
    setFallenAnimation({
      isPlaying: false,
      currentIndex: 0,
      isVisible: false,
      isAnimating: false,
      isHurried: false
    });
    onFallenAnimationComplete();
  };

  const getPhaseDisplayName = (phase: string) => {
    switch(phase) {
      case 'prologue': return 'Arena Prologue';
      case 'cornucopia': return 'The Cornucopia';
      case 'day': return 'Day';
      case 'night': return 'Night';
      case 'fallen': return 'Fallen Tributes';
      case 'victory': return 'Victory';
      case 'epilogue': return 'Epilogue';
      default: return phase;
    }
  };

  return (
    <div className={styles.simulationContainer}>
      <button 
        onClick={() => setShowTributesPanel(true)} 
        className="tributes-button"
        aria-label="View all tributes"
      >
        Tributes
      </button>
      
      <header className={styles.gameHeader}>
        <h2>Hunger Games Simulation</h2>
      </header>

      <section className="left-panel">
        <div className={styles.gameStats} role="status" aria-label="Game statistics">
          <div className={styles.stat}>
            <span className={styles.statLabel}>Day:</span>
            <span className={styles.statValue} aria-label={`Day ${gameEngine?.day || 0}`}>{gameEngine?.day || 0}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Phase:</span>
            <span className={styles.statValue} aria-label={`Current phase: ${getPhaseDisplayName(currentPhase)}`}>{getPhaseDisplayName(currentPhase)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Alive:</span>
            <span className={styles.statValue} aria-label={`${alivePlayers.length} out of ${totalPlayers} tributes alive`}>{alivePlayers.length}/{totalPlayers}</span>
          </div>
        </div>
      </section>

      <div className="center-panel" style={{ position: 'relative' }}>
        <section className={styles.eventDisplay} aria-label="Game events" aria-live="polite">
          {events.map((event, index) => (
            <div key={index} className={styles.eventLine}>
              <EventText text={event} />
            </div>
          ))}
        </section>
        
        {/* Fallen Cannon Animation Overlay */}
        {fallenAnimation.isPlaying && (
          <div className={styles.fallenCannonOverlay}>
            <div className={styles.fallenCannonDisplay}>
              {tributeData && tributeData[fallenAnimation.currentIndex] && (
                <div className={styles.fallenTributeAnnouncement}>
                  <div className={styles.fallenTributeContent}>
                    {tributeData[fallenAnimation.currentIndex]?.isNoFallen ? (
                      <div className={styles.fallenNoDeaths}>
                        No fallen on day {gameEngine?.day || 0}
                      </div>
                    ) : (
                      <>
                        <div className={styles.fallenTributeName}>
                            {tributeData[fallenAnimation.currentIndex]?.name}
                        </div>
                        <div className={styles.fallenTributeDistrict} hidden={tributeData[fallenAnimation.currentIndex]?.isEmpty}>
                          District {tributeData[fallenAnimation.currentIndex]?.district}
                        </div>
                      </>
                    )}
                    <div 
                      className={`${styles.fallenTributeCurtain} ${styles.left} ${
                        fallenAnimation.isVisible ? styles.fadeOut : ''
                      } ${fallenAnimation.isHurried ? styles.hurried : ''}`}
                    />
                    <div 
                      className={`${styles.fallenTributeCurtain} ${styles.right} ${
                        fallenAnimation.isVisible ? styles.fadeOut : ''
                      } ${fallenAnimation.isHurried ? styles.hurried : ''}`}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className={styles.fallenCannonControls}>
              {!fallenAnimation.isHurried ? (
                <button 
                  onClick={hurryUpAnimation}
                  className="transition-button small orange"
                  aria-label="Speed up fallen cannon animation"
                >
                  Hurry up
                </button>
              ) : (
                <button 
                  onClick={skipFallenAnimation}
                  className="transition-button small orange"
                  aria-label="Skip fallen cannon animation"
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <section className="right-panel">
        <div className="action-controls">
          {showVictoryButton ? (
            <button onClick={onShowVictory} className="transition-button large" aria-label="View victory screen">
              View Victory
            </button>
          ) : (
            <button onClick={() => onNext()} className="transition-button large" aria-label="Advance to next game phase">
              {currentPhase === 'night' ? 'Show Fallen' : currentPhase === 'epilogue' ? 'Game Ended' : 'Next Phase'}
            </button>
          )}
        </div>
      </section>
      
      <TributesPanel 
        gameEngine={gameEngine}
        isOpen={showTributesPanel}
        onClose={() => setShowTributesPanel(false)}
        showDamage={showDamage}
      />
    </div>
  );
};

export default SimulationScreen;
