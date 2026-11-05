import { useState, useEffect, useRef } from 'react';
import SetupScreen from './components/SetupScreen';
import SimulationScreen from './components/SimulationScreen';
import WinnerScreen from './components/WinnerScreen';
import SettingsPanel from './components/SettingsPanel';
import TwitchSetup from './components/TwitchSetup';
import { GameLoop } from './engine/gameLoop';
import { twitchIRC } from './services/twitchIRC';
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
  

  // Chat integration state
  const [volunteers, setVolunteers] = useState<string[]>([]);
  const [maxVolunteerSlots, setMaxVolunteerSlots] = useState<number>(0);
  const [setupTributeCount, setSetupTributeCount] = useState<number>(12);
  const [preFilledNames, setPreFilledNames] = useState<string[]>([]);
  const [preFilledCount, setPreFilledCount] = useState<number>(0);
  const [twitchConnected, setTwitchConnected] = useState<boolean>(false);
  const [twitchChannelName, setTwitchChannelName] = useState<string>('');
  const [twitchConnectionType, setTwitchConnectionType] = useState<'irc' | null>(null);
  const [showTwitchSetup, setShowTwitchSetup] = useState<boolean>(false);

  // Chat integration handlers
  const addVolunteerFromChat = (username: string): void => {
    if (gamePhaseRef.current === 'setup') {
      addVolunteer(username);
    }
  };

  // Keep refs in sync with state
  useEffect(() => {
    gamePhaseRef.current = gamePhase;
  }, [gamePhase]);

  const addVolunteer = (username: string): void => {
    setVolunteers(prev => {
      // If already volunteered, move to end of list
      if (prev.includes(username)) {
        console.log('[addVolunteer] User re-volunteered, moving to tail:', username);
        const filtered = prev.filter(name => name !== username);
        
        // If list is already full, just move them to the end
        if (prev.length >= maxVolunteerSlots) {
          return [...filtered, username];
        }
        
        // Otherwise add to end (which adds a new slot)
        return [...filtered, username];
      }
      
      if (prev.length >= maxVolunteerSlots) {
        console.log('[addVolunteer] Slots full, cannot add more');
        return prev;
      }
      
      const newVolunteers = [...prev, username];
      console.log('[addVolunteer] Added volunteer. Total:', newVolunteers.length);
      
      return newVolunteers;
    });
  };

  const handleSetupTributeCountChange = (count: number): void => {
    setSetupTributeCount(count);
    setMaxVolunteerSlots(prev => {
      if (prev <= 0) {
        return prev;
      }
      return count;
    });
    setVolunteers(prev => (prev.length > count ? prev.slice(0, count) : prev));
  };

  const mockVolunteers = (count: number): { added: number; slotLimit: number } => {
    const slotLimit = maxVolunteerSlots > 0 ? maxVolunteerSlots : setupTributeCount;
    const added = Math.min(count, slotLimit);

    if (maxVolunteerSlots <= 0) {
      setMaxVolunteerSlots(setupTributeCount);
    }

    setVolunteers(generateAllNames(added));
    return { added, slotLimit };
  };

  const openVolunteerCollection = async (tributeCount: number): Promise<void> => {
    console.log('[openVolunteerCollection] Setting max volunteer slots to:', tributeCount);
    setMaxVolunteerSlots(tributeCount);
    setVolunteers([]);
    
    // If already connected, just start listening (listening is already active via onMessage handler)
    if (twitchConnected && twitchIRC.isConnected()) {
      console.log('[openVolunteerCollection] Already connected, starting volunteer collection');
      return;
    }
    
    // Only connect if not already connected
    const savedConnectionType = localStorage.getItem('twitchConnectionType');
    const savedChannelName = localStorage.getItem('twitchChannelName');
    
    if (savedConnectionType && savedChannelName) {
      await connectToTwitch(savedChannelName, savedConnectionType as 'irc');
    } else {
      setShowTwitchSetup(true);
    }
  };

  const handleTwitchSetupComplete = async (channelName: string, connectionType: 'irc'): Promise<void> => {
    setShowTwitchSetup(false);
    await connectToTwitch(channelName, connectionType);
  };


  const connectToTwitch = async (channelName: string, _connectionType: 'irc'): Promise<void> => {
    try {
      // Disconnect existing connection first to avoid duplicates
      if (twitchIRC.isConnected()) {
        console.log('[connectToTwitch] Disconnecting existing connection');
        await twitchIRC.disconnect();
      }
      
      console.log('[connectToTwitch] Establishing new connection to', channelName);
      await twitchIRC.connect({
        channelName,
        onMessage: (username: string, message: string) => {
          console.log('[IRC] Message from', username, ':', message);
          const volunteerKeywords = ['i volunteer', 'I volunteer', 'I VOLUNTEER'];
          const isVolunteer = volunteerKeywords.some(keyword => message.includes(keyword));
          console.log('[IRC] Is volunteer message?', isVolunteer, 'Current phase:', gamePhaseRef.current);
          if (isVolunteer) {
            addVolunteerFromChat(username);
          }
        },
        onConnect: () => {
          console.log('Connected to Twitch IRC');
          setTwitchConnected(true);
          setTwitchChannelName(channelName);
          setTwitchConnectionType('irc');
        },
        onDisconnect: () => {
          console.log('Disconnected from Twitch IRC');
          setTwitchConnected(false);
        }
      });
    } catch (error) {
      console.error('Failed to connect to Twitch:', error);
    }
  };

  const handleReconfigureTwitch = (): void => {
    setShowTwitchSetup(true);
  };

  const handleDisconnectTwitch = async (): Promise<void> => {
    if (twitchIRC.isConnected()) {
      await twitchIRC.disconnect();
    }
    setTwitchConnected(false);
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
    if (result.phase !== 'winner') {
      setCurrentPhase(result.phase as SimulationPhase);
    }
    setEventHistory(prev => [...prev, result.events]);
    setTributeData(result.tributeData || null);
    
    if (result.winner) {
      setWinner(result.winner);
      setShowVictoryButton(true);
      // Don't immediately switch - let user see the events first
    }
  };

  const showVictory = (): void => {
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
    setVolunteers([]);
  };

  const cancelVolunteerCollection = async (): Promise<void> => {
    setVolunteers([]);
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
      if (twitchIRC.isConnected()) {
        twitchIRC.disconnect();
      }
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
        onNext={handleNext}
        onShowVictory={showVictory}
        showVictoryButton={showVictoryButton}
        enableTributeConfig={gamePhase === 'setup'}
        twitchConnected={twitchConnected}
        twitchChannelName={twitchChannelName}
        twitchConnectionType={twitchConnectionType}
        onReconfigureTwitch={handleReconfigureTwitch}
        onDisconnectTwitch={handleDisconnectTwitch}
        onTwitchSetupComplete={handleTwitchSetupComplete}
        volunteers={volunteers}
        maxVolunteerSlots={maxVolunteerSlots}
        onStartVolunteerCollection={openVolunteerCollection}
        onSubmitVolunteers={submitVolunteers}
        onCancelVolunteerCollection={cancelVolunteerCollection}
        setupTributeCount={setupTributeCount}
        onMockVolunteers={mockVolunteers}
      />
    </div>
  );
}

export default App;
