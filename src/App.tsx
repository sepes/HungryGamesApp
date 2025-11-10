import { useState, useEffect, useRef } from 'react';
import SetupScreen from './components/SetupScreen';
import SimulationScreen from './components/SimulationScreen';
import WinnerScreen from './components/WinnerScreen';
import SettingsPanel from './components/SettingsPanel';
import VolunteerScreen from './components/VolunteerScreen';
import TwitchSetup from './components/TwitchSetup';
import { GameEngine } from './engine/gameEngine';
import { twitchIRC } from './services/twitchIRC';
import type { Player, GamePhase, SimulationPhase, FallenTributeData, MajorEventConfig } from './types/game.types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.scss';

function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const gamePhaseRef = useRef<GamePhase>('setup');
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [currentEvents, setCurrentEvents] = useState<string[]>([]);
  const [currentPhase, setCurrentPhase] = useState<SimulationPhase>('cornucopia');
  const [winner, setWinner] = useState<Player | null>(null);
  const [eventHistory, setEventHistory] = useState<string[][]>([]);
  const [showVictoryButton, setShowVictoryButton] = useState<boolean>(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState<boolean>(false);
  const [tributeData, setTributeData] = useState<FallenTributeData[] | null>(null);
  
  // State to track where TwitchSetup was opened from
  const [twitchSetupContext, setTwitchSetupContext] = useState<'setup' | 'volunteer' | null>(null);

  // Chat integration state
  const [volunteers, setVolunteers] = useState<string[]>([]);
  const [maxVolunteerSlots, setMaxVolunteerSlots] = useState<number>(24);
  const [preFilledNames, setPreFilledNames] = useState<string[]>([]);
  const [preFilledCount, setPreFilledCount] = useState<number>(0);
  const [showVolunteerModal, setShowVolunteerModal] = useState<boolean>(false);
  const showVolunteerModalRef = useRef<boolean>(false);
  const [twitchConnected, setTwitchConnected] = useState<boolean>(false);
  const [twitchChannelName, setTwitchChannelName] = useState<string>('');
  const [twitchConnectionType, setTwitchConnectionType] = useState<'irc' | 'oauth' | null>(null);
  const [showTwitchSetup, setShowTwitchSetup] = useState<boolean>(false);

  // Chat integration handlers
  const addVolunteerFromChat = (username: string): void => {
    if (showVolunteerModalRef.current && gamePhaseRef.current === 'setup') {
      addVolunteer(username);
    }
  };

  // Keep refs in sync with state
  useEffect(() => {
    gamePhaseRef.current = gamePhase;
  }, [gamePhase]);

  useEffect(() => {
    showVolunteerModalRef.current = showVolunteerModal;
  }, [showVolunteerModal]);

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
      
      // Removed auto-start on full - user must click submit
      
      return newVolunteers;
    });
  };

  const openVolunteerCollection = async (tributeCount: number): Promise<void> => {
    console.log('[openVolunteerCollection] Setting max volunteer slots to:', tributeCount);
    setMaxVolunteerSlots(tributeCount);
    setVolunteers([]);
    
    const savedConnectionType = localStorage.getItem('twitchConnectionType');
    const savedChannelName = localStorage.getItem('twitchChannelName');
    
    if (savedConnectionType && savedChannelName) {
      await connectToTwitch(savedChannelName, savedConnectionType as 'irc' | 'oauth');
      setShowVolunteerModal(true);
    } else {
      setTwitchSetupContext('volunteer');
      setShowTwitchSetup(true);
    }
  };

  const handleTwitchSetupComplete = async (channelName: string, connectionType: 'irc' | 'oauth'): Promise<void> => {
    setShowTwitchSetup(false);
    await connectToTwitch(channelName, connectionType);
    
    // If opened from volunteer context, show volunteer collection modal
    // If opened from setup, just stay on setup screen with connection ready
    if (twitchSetupContext === 'volunteer') {
      setShowVolunteerModal(true);
    }
    
    setTwitchSetupContext(null);
  };

  const handleConnectToTwitch = (): void => {
    setTwitchSetupContext('setup');
    setShowTwitchSetup(true);
  };

  const connectToTwitch = async (channelName: string, connectionType: 'irc' | 'oauth'): Promise<void> => {
    try {
      if (connectionType === 'irc') {
        const savedToken = localStorage.getItem('twitchOAuthToken');
        
        // Disconnect existing connection first to avoid duplicates
        if (twitchIRC.isConnected()) {
          console.log('[connectToTwitch] Disconnecting existing connection');
          await twitchIRC.disconnect();
        }
        
        console.log('[connectToTwitch] Establishing new connection to', channelName);
        await twitchIRC.connect({
          channelName,
          oauthToken: savedToken || undefined,
            onMessage: (username: string, message: string) => {
            console.log('[IRC] Message from', username, ':', message);
            const volunteerKeywords = ['i volunteer', 'I volunteer', 'I VOLUNTEER'];
            const isVolunteer = volunteerKeywords.some(keyword => message.includes(keyword));
            console.log('[IRC] Is volunteer message?', isVolunteer, 'Current phase:', gamePhaseRef.current, 'Show modal:', showVolunteerModalRef.current);
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
      }
    } catch (error) {
      console.error('Failed to connect to Twitch:', error);
    }
  };

  const handleReconfigureTwitch = (): void => {
    setShowTwitchSetup(true);
  };

  const handleDisconnectTwitch = async (): Promise<void> => {
    if (twitchConnectionType === 'irc' && twitchIRC.isConnected()) {
      await twitchIRC.disconnect();
    }
    setTwitchConnected(false);
    setTwitchChannelName('');
    setTwitchConnectionType(null);
    localStorage.removeItem('twitchConnectionType');
    localStorage.removeItem('twitchChannelName');
    localStorage.removeItem('twitchOAuthToken');
  };

  const submitVolunteers = (volunteerList: string[]): void => {
    // Set pre-filled names and close modal
    setPreFilledNames(volunteerList);
    setPreFilledCount(maxVolunteerSlots); // Remember the tribute count
    setShowVolunteerModal(false);
    
    // Disconnect IRC but keep connection info saved for easy reconnection
    if (twitchConnectionType === 'irc' && twitchIRC.isConnected()) {
      twitchIRC.disconnect();
      // Don't set twitchConnected to false - keep showing as "connected" in UI
      // so user can easily reconnect when clicking "Use Chat Volunteers" again
    }
    
    // Clear volunteers after transferring (privacy)
    setVolunteers([]);
  };

  const startGame = (players: Player[]): void => {
    const engine = new GameEngine(players);
    setGameEngine(engine);
    setGamePhase('simulation');
    
    // Expose major event configuration to console
    if (typeof window !== 'undefined') {
      window.HungryGames = {
        majorEventConfig: engine.getMajorEventConfig(),
        updateMajorEventConfig: (config: Partial<MajorEventConfig>) => engine.updateMajorEventConfig(config)
      };
    }
    
    // Generate first segment (Cornucopia)
    handleNext(engine);
  };

  const handleNext = (engine: GameEngine | null = gameEngine): void => {
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
    setShowVolunteerModal(false);
    
    // Disconnect IRC but keep connection info saved
    if (twitchConnectionType === 'irc' && twitchIRC.isConnected()) {
      await twitchIRC.disconnect();
      // Keep twitchConnected true so user can easily reconnect
    }
  };

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
        
        {!showTwitchSetup && showVolunteerModal && gamePhase === 'setup' && (
          <VolunteerScreen 
            volunteers={volunteers}
            maxSlots={maxVolunteerSlots}
            onStartGame={() => submitVolunteers(volunteers)}
            onCancel={cancelVolunteerCollection}
            channelName={twitchChannelName || 'Connecting...'}
            isConnected={twitchConnected}
          />
        )}
        
        {!showTwitchSetup && !showVolunteerModal && gamePhase === 'setup' && (
          <SetupScreen 
            onStart={startGame}
            onOpenVolunteers={openVolunteerCollection}
            onTributeConfigUpdate={true}
            seConnected={twitchConnected}
            seChannelName={twitchChannelName}
            onConnectToTwitch={handleConnectToTwitch}
            preFilledNames={preFilledNames}
            preFilledCount={preFilledCount}
            onClearPreFilled={() => {
              setPreFilledNames([]);
              setPreFilledCount(0);
            }}
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
      />
    </div>
  );
}

export default App;
