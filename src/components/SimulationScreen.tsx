import React, { useState, useEffect, useRef, useCallback } from 'react';
import TributesPanel from './TributesPanel';
import styles from './SimulationScreen/SimulationScreen.module.scss';
import type { SimulationScreenProps } from '../types/component.types';

interface FallenAnimationState {
  isPlaying: boolean;
  currentIndex: number;
  isVisible: boolean;
  isAnimating: boolean;
  isHurried: boolean;
}

// Per-tribute timings. Normal total is 4000ms per tribute, which the debug
// terminal's autoplay delay assumes - keep the two in sync.
const FADE_MS = 1000;
const DISPLAY_MS = 2000;
const FADE_MS_HURRIED = 500;
const DISPLAY_MS_HURRIED = 1000;

const IDLE_ANIMATION: FallenAnimationState = {
  isPlaying: false,
  currentIndex: 0,
  isVisible: false,
  isAnimating: false,
  isHurried: false
};

const SimulationScreen: React.FC<SimulationScreenProps> = ({ events, onNext, gameEngine, currentPhase, showVictoryButton: showVictorButton, onShowVictory: onShowVictor, tributeData }) => {
  const [showTributesPanel, setShowTributesPanel] = useState<boolean>(false);
  const [fallenAnimation, setFallenAnimation] = useState<FallenAnimationState>(IDLE_ANIMATION);

  // Every pending step of the animation chain, so all of them can be cancelled
  // together on skip, phase change or unmount
  const timersRef = useRef<number[]>([]);
  // Read inside scheduled steps, so hurrying does not have to restart the effect
  const isHurriedRef = useRef<boolean>(false);

  const clearTimers = useCallback((): void => {
    timersRef.current.forEach(id => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const scheduleStep = useCallback((step: () => void, delay: number): void => {
    timersRef.current.push(window.setTimeout(step, delay));
  }, []);

  useEffect(() => {
    isHurriedRef.current = fallenAnimation.isHurried;
  }, [fallenAnimation.isHurried]);

  // Handle fallen cannon animation
  useEffect(() => {
    if (currentPhase === 'fallen' && tributeData && tributeData.length > 0) {
      setFallenAnimation({ ...IDLE_ANIMATION, isPlaying: true });
    } else {
      setFallenAnimation(IDLE_ANIMATION);
    }
  }, [currentPhase, tributeData]);

  // Animation sequence
  useEffect(() => {
    if (!fallenAnimation.isPlaying || !tributeData || tributeData.length === 0) return;

    const currentTribute = tributeData[fallenAnimation.currentIndex];
    if (!currentTribute) return;

    const isLastTribute = fallenAnimation.currentIndex >= tributeData.length - 1;
    const fadeMs = (): number => (isHurriedRef.current ? FADE_MS_HURRIED : FADE_MS);
    const displayMs = (): number => (isHurriedRef.current ? DISPLAY_MS_HURRIED : DISPLAY_MS);

    // Start fade in
    setFallenAnimation(prev => ({ ...prev, isAnimating: true, isVisible: true }));

    // After fade in completes, wait, then fade out
    scheduleStep(() => {
      setFallenAnimation(prev => ({ ...prev, isAnimating: false }));

      // Wait for display time, then fade out
      scheduleStep(() => {
        setFallenAnimation(prev => ({ ...prev, isAnimating: true, isVisible: false }));

        // After fade out completes, move to next tribute or end
        scheduleStep(() => {
          if (isLastTribute) {
            // Animation complete
            setFallenAnimation(IDLE_ANIMATION);
          } else {
            setFallenAnimation(prev => ({
              ...prev,
              currentIndex: prev.currentIndex + 1,
              isAnimating: false
            }));
          }
        }, fadeMs());
      }, displayMs());
    }, fadeMs());

    // Cancels every step still pending, whichever stage the chain is in
    return clearTimers;
  }, [fallenAnimation.currentIndex, fallenAnimation.isPlaying, tributeData, scheduleStep, clearTimers]);

  if (!gameEngine) return null;
  
  const alivePlayers = gameEngine.players.filter(p => p.isAlive);
  const totalPlayers = gameEngine.players.length;

  const hurryUpAnimation = () => {
    // Picked up by the pending steps through isHurriedRef, so the current
    // tribute keeps playing instead of restarting
    isHurriedRef.current = true;
    setFallenAnimation(prev => ({ ...prev, isHurried: true }));
  };

  const skipFallenAnimation = () => {
    clearTimers();
    setFallenAnimation(IDLE_ANIMATION);
  };

  const getPhaseDisplayName = (phase: string) => {
    switch(phase) {
      case 'cornucopia': return 'The Cornucopia';
      case 'day': return 'Day';
      case 'night': return 'Night';
      case 'fallen': return 'Fallen Tributes';
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
            <div key={index} className={styles.eventLine} dangerouslySetInnerHTML={{ __html: event }}>
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
          {showVictorButton ? (
            <button onClick={onShowVictor} className="transition-button large" aria-label="View victory screen">
              View Victor
            </button>
          ) : 
           
          (
            <>
            <button onClick={() => onNext()} className="transition-button large" aria-label="Go back to setup">
              {currentPhase === 'night' ? 'Show Fallen' : 'Next Phase'}
            </button>
            {alivePlayers.length === 0 ? 'If this button does not work reset the game from setting.' : '' /*DELETEME */}
            </>
          )}
        </div>
      </section>
      
      <TributesPanel 
        gameEngine={gameEngine}
        isOpen={showTributesPanel}
        onClose={() => setShowTributesPanel(false)}
      />
    </div>
  );
};

export default SimulationScreen;
