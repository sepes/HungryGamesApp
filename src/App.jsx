import React, { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import SimulationScreen from './components/SimulationScreen';
import WinnerScreen from './components/WinnerScreen';
import SettingsPanel from './components/SettingsPanel';
import VolunteerScreen from './components/VolunteerScreen';
import { GameEngine } from './engine/gameEngine';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.scss';

function App() {
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup' | 'volunteer-collection' | 'simulation' | 'winner'
  const [gameEngine, setGameEngine] = useState(null);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [currentPhase, setCurrentPhase] = useState('cornucopia');
  const [winner, setWinner] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);
  const [showVictoryButton, setShowVictoryButton] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [tributeData, setTributeData] = useState(null);
  
  // Chat integration state (to be implemented: IRC/EventSub)
  const [volunteers, setVolunteers] = useState([]);
  const [maxVolunteerSlots, setMaxVolunteerSlots] = useState(24);

  // Chat integration handlers (to be implemented with IRC/EventSub)
  const addVolunteerFromChat = (username) => {
    if (gamePhase === 'volunteer-collection') {
      addVolunteer(username);
    }
  };

  const addVolunteer = (username) => {
    console.log('addVolunteer called with:', username);
    setVolunteers(prev => {
      console.log('Current volunteers:', prev);
      
      // Check if already volunteered
      if (prev.includes(username)) {
        console.log('User already volunteered:', username);
        return prev;
      }
      
      // Check if slots full
      if (prev.length >= maxVolunteerSlots) {
        console.log('Slots full, cannot add more');
        return prev;
      }
      
      const newVolunteers = [...prev, username];
      console.log('New volunteers list:', newVolunteers);
      
      // Auto-start when full
      if (newVolunteers.length === maxVolunteerSlots) {
        // TODO: Send message to chat when IRC/EventSub is implemented
        setTimeout(() => {
          startGameWithVolunteers(newVolunteers);
        }, 2000);
      }
      
      return newVolunteers;
    });
  };

  const openVolunteerCollection = (tributeCount) => {
    setMaxVolunteerSlots(tributeCount);
    setVolunteers([]);
    setGamePhase('volunteer-collection');
    
    // TODO: Send message to chat when IRC/EventSub is implemented
  };

  const startGameWithVolunteers = (volunteerList) => {
    // Create players from volunteers
    const players = volunteerList.map((name, i) => ({
      id: `player-${i}`,
      name: name,
      district: Math.floor(i / (volunteerList.length / 12)) + 1,
      isAlive: true,
      kills: 0,
      items: [],
      diedInPhase: null,
      diedOnDay: null
    }));

    startGame(players);
    
    // Clear volunteers after game starts (privacy)
    setVolunteers([]);
  };

  const startGame = (players) => {
    const engine = new GameEngine(players);
    setGameEngine(engine);
    setGamePhase('simulation');
    
    // Expose major event configuration to console
    if (typeof window !== 'undefined') {
      window.HungryGames = {
        majorEventConfig: engine.getMajorEventConfig(),
        updateMajorEventConfig: (config) => engine.updateMajorEventConfig(config)
      };
    }
    
    // Generate first segment (Cornucopia)
    handleNext(engine);
  };

  const handleNext = (engine = gameEngine) => {
    const result = engine.nextSegment();
    setCurrentEvents(result.events);
    setCurrentPhase(result.phase);
    setEventHistory(prev => [...prev, result.events]);
    setTributeData(result.tributeData || null);
    
    if (result.winner) {
      setWinner(result.winner);
      setShowVictoryButton(true);
      // Don't immediately switch - let user see the events first
    }
  };

  const showVictory = () => {
    setGamePhase('winner');
  };

  const resetGame = () => {
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

  const cancelVolunteerCollection = () => {
    setVolunteers([]);
    setGamePhase('setup');
  };


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
        {gamePhase === 'setup' && (
          <SetupScreen 
            onStart={startGame}
            onOpenVolunteers={openVolunteerCollection}
          />
        )}
        
        {gamePhase === 'volunteer-collection' && (
          <VolunteerScreen 
            volunteers={volunteers}
            maxSlots={maxVolunteerSlots}
            onStartGame={() => startGameWithVolunteers(volunteers)}
            onCancel={cancelVolunteerCollection}
            channelName="Chat Integration Pending"
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
        
        {gamePhase === 'winner' && (
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
      />
    </div>
  );
}

export default App;
