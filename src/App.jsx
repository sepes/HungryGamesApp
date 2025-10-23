import React, { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import SimulationScreen from './components/SimulationScreen';
import WinnerScreen from './components/WinnerScreen';
import SettingsPanel from './components/SettingsPanel';
import { GameEngine } from './engine/gameEngine';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup' | 'simulation' | 'winner'
  const [gameEngine, setGameEngine] = useState(null);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [currentPhase, setCurrentPhase] = useState('cornucopia');
  const [winner, setWinner] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);
  const [showVictoryButton, setShowVictoryButton] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const startGame = (players) => {
    const engine = new GameEngine(players);
    setGameEngine(engine);
    setGamePhase('simulation');
    // Generate first segment (Cornucopia)
    handleNext(engine);
  };

  const handleNext = (engine = gameEngine) => {
    const result = engine.nextSegment();
    setCurrentEvents(result.events);
    setCurrentPhase(result.phase);
    setEventHistory(prev => [...prev, result.events]);
    
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
          <SetupScreen onStart={startGame} />
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
      />
    </div>
  );
}

export default App;
