import { useState, useEffect, useRef } from 'react';
import SetupScreen from './components/SetupScreen';
import SimulationScreen from './components/SimulationScreen';
import WinnerScreen from './components/WinnerScreen';
import SettingsPanel from './components/SettingsPanel';
import TwitchSetup from './components/TwitchSetup';
import { GameLoop } from './engine/gameLoop';
import { twitchIRC } from './services/twitchIRC';
import type { TwitchConnectionStatus } from './services/twitchIRC';
import { generateAllNames } from './utils/nameGenerator';
import type { Player, GamePhase, SimulationPhase, FallenTributeData } from './types/game.types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.scss';

function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const gamePhaseRef = useRef<GamePhase>('setup');
  const [gameEngine, setGameEngine] = useState<GameLoop | null>(null);
  const [currentEvents, setCurrentEvents] = useState<string[]>([]);
  const [currentPhase, setCurrentPhase] = useState<SimulationPhase>('cornucopia');
  const [winner, setWinner] = useState<Player | null>(null);
  const [eventHistory, setEventHistory] = useState<string[][]>([]);
  const [showVictoryButton, setShowVictoryButton] = useState<boolean>(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState<boolean>(false);
  const [tributeData, setTributeData] = useState<FallenTributeData[] | null>(null);
  const [showDamage, setShowDamage] = useState<boolean>(false);
  const [skipFallen, setSkipFallen] = useState<boolean>(false);
  const [isFallenAnimating, setIsFallenAnimating] = useState<boolean>(false);
  const skipFallenRef = useRef<boolean>(false);

  const handleToggleDamage = (mode?: 'on' | 'off'): boolean => {
    const next = mode === 'on' ? true : mode === 'off' ? false : !showDamage;
    setShowDamage(next);
    return next;
  };

  const handleToggleSkipFallen = (mode?: 'on' | 'off'): boolean => {
    const next = mode === 'on' ? true : mode === 'off' ? false : !skipFallen;
    skipFallenRef.current = next;
    setSkipFallen(next);
    if (next) {
      setIsFallenAnimating(false);
    }
    return next;
  };
  

  // Chat integration state
  const [volunteers, setVolunteers] = useState<string[]>([]);
  const [maxVolunteerSlots, setMaxVolunteerSlots] = useState<number>(0);
  const maxVolunteerSlotsRef = useRef<number>(0);
  const [setupTributeCount, setSetupTributeCount] = useState<number>(12);
  const [preFilledNames, setPreFilledNames] = useState<string[]>([]);
  const [preFilledCount, setPreFilledCount] = useState<number>(0);
  const [twitchStatus, setTwitchStatus] = useState<TwitchConnectionStatus>('disconnected');
  const [twitchError, setTwitchError] = useState<string>('');
  const [twitchChannelName, setTwitchChannelName] = useState<string>('');
  const [twitchConnectionType, setTwitchConnectionType] = useState<'irc' | null>(null);
  const [showTwitchSetup, setShowTwitchSetup] = useState<boolean>(false);
  const twitchConnected = twitchStatus === 'connected';

  // Chat integration handlers
  const addVolunteerFromChat = (username: string): void => {
    if (gamePhaseRef.current === 'setup' && maxVolunteerSlotsRef.current > 0) {
      addVolunteer(username);
    }
  };

  // Keep refs in sync with state
  useEffect(() => {
    gamePhaseRef.current = gamePhase;
  }, [gamePhase]);

  useEffect(() => {
    maxVolunteerSlotsRef.current = maxVolunteerSlots;
  }, [maxVolunteerSlots]);

  useEffect(() => {
    maxVolunteerSlotsRef.current = maxVolunteerSlots;
  }, [maxVolunteerSlots]);

  const addVolunteer = (username: string): void => {
    setVolunteers(prev => {
      const slotCap = maxVolunteerSlotsRef.current;
      if (slotCap <= 0) {
        return prev;
      }

      // If already volunteered, move to end of list
      if (prev.includes(username)) {
        const filtered = prev.filter(name => name !== username);
        if (prev.length >= slotCap) {
          return [...filtered, username];
        }
        return [...filtered, username];
      }

      if (prev.length >= slotCap) {
        return prev;
      }

      return [...prev, username];
    });
  };

  const handleSetupTributeCountChange = (count: number): void => {
    setSetupTributeCount(count);
    setMaxVolunteerSlots(prev => {
      if (prev <= 0) {
        return prev;
      }
      maxVolunteerSlotsRef.current = count;
      return count;
    });
    setVolunteers(prev => (prev.length > count ? prev.slice(0, count) : prev));
  };

  const mockVolunteers = (count: number): { added: number; slotLimit: number } => {
    const slotLimit = maxVolunteerSlots > 0 ? maxVolunteerSlots : setupTributeCount;
    const added = Math.min(count, slotLimit);

    if (maxVolunteerSlots <= 0) {
      maxVolunteerSlotsRef.current = setupTributeCount;
      setMaxVolunteerSlots(setupTributeCount);
    }

    setVolunteers(generateAllNames(added));
    return { added, slotLimit };
  };

  const openVolunteerCollection = async (tributeCount: number): Promise<void> => {
    maxVolunteerSlotsRef.current = tributeCount;
    setMaxVolunteerSlots(tributeCount);
    maxVolunteerSlotsRef.current = tributeCount; // Critical: set ref synchronously before connect
    setVolunteers([]);

    if (twitchConnected && twitchIRC.isConnected()) {
      const healthy = await twitchIRC.checkStatus();
      if (healthy) {
        return;
      }
    }

    const savedConnectionType = localStorage.getItem('twitchConnectionType');
    const savedChannelName = twitchChannelName || localStorage.getItem('twitchChannelName');

    if ((savedConnectionType || twitchConnectionType) && savedChannelName) {
      await connectToTwitch(savedChannelName, 'irc');
    } else {
      setShowTwitchSetup(true);
    }
  };

  const handleTwitchSetupComplete = async (channelName: string, connectionType: 'irc'): Promise<void> => {
    setShowTwitchSetup(false);
    await connectToTwitch(channelName, connectionType);
  };


  const connectToTwitch = async (channelName: string, _connectionType: 'irc'): Promise<void> => {
    setTwitchChannelName(channelName);
    setTwitchConnectionType('irc');

    await twitchIRC.connect({
      channelName,
      onMessage: (username: string, message: string) => {
        if (message.toLowerCase().includes('i volunteer')) {
          addVolunteerFromChat(username);
        }
      },
      onStatusChange: (status: TwitchConnectionStatus, errorMessage?: string) => {
        setTwitchStatus(status);
        setTwitchError(errorMessage || '');
      }
    });
  };

  const handleRetryTwitchConnection = async (): Promise<void> => {
    const channel = twitchChannelName || localStorage.getItem('twitchChannelName') || '';
    if (channel) {
      await connectToTwitch(channel, 'irc');
    } else {
      setShowTwitchSetup(true);
    }
  };

  const handleReconfigureTwitch = (): void => {
    setShowTwitchSetup(true);
  };

  const handleDisconnectTwitch = async (): Promise<void> => {
    await twitchIRC.disconnect();
    setTwitchStatus('disconnected');
    setTwitchError('');
    setTwitchChannelName('');
    setTwitchConnectionType(null);
    localStorage.removeItem('twitchConnectionType');
    localStorage.removeItem('twitchChannelName');
  };

  const submitVolunteers = (volunteerList: string[]): void => {
    // Set pre-filled names
    setPreFilledNames(volunteerList);
    setPreFilledCount(maxVolunteerSlots);
    
    // Clear volunteers after transferring (privacy)
    setVolunteers([]);
    
    // Close SettingsPanel
    setShowSettingsPanel(false);
  };

  const startGame = (players: Player[]): void => {
    const engine = new GameLoop(players);
    setGameEngine(engine);
    setGamePhase('simulation');
    
    // Expose game configuration to console
    if (typeof window !== 'undefined') {
      window.HungryGames = {
        getConfig: () => engine.getConfig(),
        setWinnerCount: (count: number) => engine.setWinnerCount(count)
      };
    }
    
    // Generate first segment (Prologue)
    handleNext(engine);
  };

  const handleNext = (engine: GameLoop | null = gameEngine): void => {
    if (!engine) return;
    const result = engine.nextSegment();
    setCurrentEvents(result.events);
    if (result.phase === 'winner') {
      setCurrentPhase('victory');
    } else {
      setCurrentPhase(result.phase);
    }
    setEventHistory(prev => [...prev, result.events]);
    setTributeData(result.tributeData || null);
    setIsFallenAnimating(
      !skipFallenRef.current &&
        result.phase === 'fallen' &&
        Boolean(result.tributeData && result.tributeData.length > 0)
    );
    
    if (result.winner) {
      setWinner(result.winner);
      setShowVictoryButton(true);
      // Don't immediately switch - let user see the events first
    }
  };

  const showVictory = (): void => {
    setIsFallenAnimating(false);
    setGamePhase('winner');
  };

  const resetGame = (): void => {
    setGamePhase('setup');
    setGameEngine(null);
    setCurrentEvents([]);
    setCurrentPhase('cornucopia');
    setWinner(null);
    setEventHistory([]);
    setShowVictoryButton(false);
    setTributeData(null);
    setIsFallenAnimating(false);
    setVolunteers([]);
  };

  const cancelVolunteerCollection = async (): Promise<void> => {
    setVolunteers([]);
    maxVolunteerSlotsRef.current = 0;
    setMaxVolunteerSlots(0); // Reset to 0 to indicate collection is not active
  };

  // Auto-connect to Twitch on page load if saved connection info exists
  const hasAutoConnected = useRef(false);
  useEffect(() => {
    // Prevent double-connection in React Strict Mode
    if (hasAutoConnected.current) return;
    
    const savedConnectionType = localStorage.getItem('twitchConnectionType');
    const savedChannelName = localStorage.getItem('twitchChannelName');
    
    if (savedConnectionType === 'irc' && savedChannelName) {
      hasAutoConnected.current = true;
      console.log('[App] Auto-connecting to saved Twitch channel:', savedChannelName);
      connectToTwitch(savedChannelName, 'irc');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      void twitchIRC.disconnect();
    };
  }, []);


  return (
    <div className="app" role="application" aria-label="Hunger Games Simulator">
      <button 
        onClick={() => setShowSettingsPanel(true)} 
        className="settings-button"
        aria-label="Open settings panel"
      >
        ⚙
      </button>
      
      <main aria-live="polite" aria-label={`Current phase: ${gamePhase}`}>
        {showTwitchSetup && (
          <TwitchSetup 
            onComplete={handleTwitchSetupComplete}
            isModal={true}
            onClose={() => {
              setShowTwitchSetup(false);
              setGamePhase('setup');
            }}
          />
        )}
        
        {!showTwitchSetup && gamePhase === 'setup' && (
          <SetupScreen 
            onStart={startGame}
            onTributeConfigUpdate={true}
            preFilledNames={preFilledNames}
            preFilledCount={preFilledCount}
            onClearPreFilled={() => {
              setPreFilledNames([]);
              setPreFilledCount(0);
            }}
            onTributeCountChange={handleSetupTributeCountChange}
            setupTributeCount={setupTributeCount}
          />
        )}
        
        {gamePhase === 'simulation' && (
          <SimulationScreen 
            events={currentEvents}
            onNext={handleNext}
            gameEngine={gameEngine}
            currentPhase={currentPhase}
            showVictoryButton={showVictoryButton}
            onShowVictory={showVictory}
            onResetGame={resetGame}
            tributeData={tributeData}
            showDamage={showDamage}
            skipFallen={skipFallen}
            onFallenAnimationComplete={() => setIsFallenAnimating(false)}
          />
        )}
        
        {gamePhase === 'winner' && winner && (
          <WinnerScreen 
            winner={winner}
            eventHistory={eventHistory}
            gameEngine={gameEngine}
            onReset={resetGame}
          />
        )}
      </main>
      
      <SettingsPanel 
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
        onResetGame={resetGame}
        gameEngine={gameEngine}
        gamePhase={gamePhase}
        currentPhase={currentPhase}
        stepCount={eventHistory.length}
        isFallenAnimating={isFallenAnimating}
        onNext={handleNext}
        onShowVictory={showVictory}
        showVictoryButton={showVictoryButton}
        enableTributeConfig={gamePhase === 'setup'}
        twitchConnected={twitchConnected}
        twitchStatus={twitchStatus}
        twitchError={twitchError}
        twitchChannelName={twitchChannelName}
        twitchConnectionType={twitchConnectionType}
        onReconfigureTwitch={handleReconfigureTwitch}
        onDisconnectTwitch={handleDisconnectTwitch}
        onRetryTwitchConnection={handleRetryTwitchConnection}
        onTwitchSetupComplete={handleTwitchSetupComplete}
        volunteers={volunteers}
        maxVolunteerSlots={maxVolunteerSlots}
        onStartVolunteerCollection={openVolunteerCollection}
        onSubmitVolunteers={submitVolunteers}
        onCancelVolunteerCollection={cancelVolunteerCollection}
        setupTributeCount={setupTributeCount}
        onMockVolunteers={mockVolunteers}
        showDamage={showDamage}
        onToggleDamage={handleToggleDamage}
        skipFallen={skipFallen}
        onToggleSkipFallen={handleToggleSkipFallen}
      />
    </div>
  );
}

export default App;
