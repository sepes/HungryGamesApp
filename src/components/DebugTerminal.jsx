import React, { useState, useRef, useEffect } from 'react';
import styles from './DebugTerminal/DebugTerminal.module.scss';

const DebugTerminal = ({ gameEngine, gamePhase, onNext, onShowVictory, showVictoryButton }) => {
  const [output, setOutput] = useState([
    { type: 'system', text: 'Debug Terminal initialized. Type "help" for available commands.' }
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const addOutput = (type, text) => {
    setOutput(prev => [...prev, { type, text }]);
  };

  const autoplayGame = async () => {
    if (gamePhase !== 'simulation') {
      addOutput('error', 'Autoplay is only available during simulation phase.');
      return;
    }

    if (isAutoplaying) {
      addOutput('error', 'Autoplay is already running.');
      return;
    }

    setIsAutoplaying(true);
    addOutput('info', 'Starting autoplay... Game will advance automatically until a winner is found.');
    
    const autoplayInterval = setInterval(() => {
      // Check if game has a winner by counting alive players
      if (gameEngine) {
        const alivePlayers = gameEngine.players.filter(p => p.isAlive);
        if (alivePlayers.length === 1) {
          clearInterval(autoplayInterval);
          setIsAutoplaying(false);
          addOutput('info', 'Autoplay complete! Winner found.');
          return;
        }
      }
      
      if (gamePhase === 'simulation' && onNext) {
        onNext();
      }
    }, 100); // Advance every 100ms
  };


  const executeCommand = (command) => {
    const trimmedCommand = command.trim().toLowerCase();
    
    // Add command to output
    addOutput('command', `> ${command}`);
    
    // Add to history
    setCommandHistory(prev => [command, ...prev.filter(cmd => cmd !== command)]);
    setHistoryIndex(-1);
    
    // Execute command
    switch (trimmedCommand) {
      case 'help':
        addOutput('system', 'Available commands:');
        addOutput('system', '  help     - Show this help message');
        addOutput('system', '  clear    - Clear the terminal output');
        addOutput('system', '  version  - Show terminal version');
        addOutput('system', '  test     - Test color coding (info/warning/error)');
        addOutput('system', '  autoplay - Automatically advance game until winner is found');
        addOutput('system', '  stats    - Show detailed player statistics');
        addOutput('system', '');
        addOutput('system', 'More commands will be added in future updates. PS: there is no cheats to have your name win the game.');
        break;
        
      case 'clear':
        setOutput([]);
        break;
        
      case 'version':
        addOutput('system', 'Debug Terminal v1.0.0');
        addOutput('system', 'Built for Hunger Games Simulator');
        break;
        
      case 'test':
        addOutput('info', 'This is an info message (blue)');
        addOutput('warning', 'This is a warning message (yellow)');
        addOutput('error', 'This is an error message (red)');
        break;
        
      case 'autoplay':
        autoplayGame();
        break;
        
      case 'stats':
        if (!gameEngine) {
          addOutput('error', 'No game engine available. Start a game first.');
          break;
        }
        
        addOutput('system', '=== DETAILED PLAYER STATISTICS ===');
        addOutput('system', '');
        
        // Per-player stats
        gameEngine.players.forEach(player => {
          const status = player.isAlive ? 'ALIVE' : 'DEAD';
          const inventory = player.inventory ? player.inventory.map(item => `${item.name}(${item.uses})`).join(', ') : 'None';
          const alliances = player.alliances ? player.alliances.map(allyId => {
            const ally = gameEngine.players.find(p => p.id === allyId);
            return ally ? ally.name : 'Unknown';
          }).join(', ') : 'None';
          
          addOutput('info', `${player.name} (District ${player.district}) - ${status}`);
          addOutput('system', `  Kills: ${player.kills || 0}`);
          addOutput('system', `  Mental Health: ${Math.round(player.mentalHealth || 75)}/100`);
          addOutput('system', `  Courage: ${Math.round(player.courage || 50)}/100`);
          addOutput('system', `  Cowardice: ${Math.round(player.cowardice || 0)}/100`);
          addOutput('system', `  Inventory: ${inventory}`);
          addOutput('system', `  Alliances: ${alliances}`);
          addOutput('system', '');
        });
        
        // Summary statistics
        const alivePlayers = gameEngine.players.filter(p => p.isAlive);
        const avgMentalHealth = alivePlayers.reduce((sum, p) => sum + (p.mentalHealth || 75), 0) / alivePlayers.length;
        const mostEquipped = alivePlayers.reduce((best, player) => {
          const currentItems = (player.inventory || []).length;
          const bestItems = (best.inventory || []).length;
          return currentItems > bestItems ? player : best;
        }, alivePlayers[0]);
        const mostDangerous = alivePlayers.reduce((best, player) => {
          const currentScore = (player.kills || 0) + (player.inventory || []).filter(item => 
            ['sword', 'knife', 'spear', 'bow', 'axe', 'mace', 'trident', 'dagger', 'sickle', 'machete', 'club'].includes(item.name)
          ).length;
          const bestScore = (best.kills || 0) + (best.inventory || []).filter(item => 
            ['sword', 'knife', 'spear', 'bow', 'axe', 'mace', 'trident', 'dagger', 'sickle', 'machete', 'club'].includes(item.name)
          ).length;
          return currentScore > bestScore ? player : best;
        }, alivePlayers[0]);
        
        addOutput('system', '=== SUMMARY STATISTICS ===');
        addOutput('system', `Average Mental Health: ${Math.round(avgMentalHealth)}/100`);
        addOutput('system', `Most Well-Equipped: ${mostEquipped ? mostEquipped.name : 'N/A'} (${(mostEquipped?.inventory || []).length} items)`);
        addOutput('system', `Most Dangerous: ${mostDangerous ? mostDangerous.name : 'N/A'} (${mostDangerous?.kills || 0} kills, ${(mostDangerous?.inventory || []).filter(item => 
          ['sword', 'knife', 'spear', 'bow', 'axe', 'mace', 'trident', 'dagger', 'sickle', 'machete', 'club'].includes(item.name)
        ).length} weapons)`);
        break;
        
      case '':
        // Empty command, just show prompt
        break;
        
      default:
        addOutput('error', `Unknown command: "${command}"`);
        addOutput('system', 'Type "help" for available commands.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const getOutputClass = (type) => {
    switch (type) {
      case 'command': return styles.terminalCommand;
      case 'system': return styles.terminalSystem;
      case 'error': return styles.terminalError;
      case 'warning': return styles.terminalWarning;
      case 'info': return styles.terminalInfo;
      default: return styles.terminalOutputLine;
    }
  };

  return (
    <div className={styles.debugTerminal} role="log" aria-label="Debug terminal">
      <div 
        className={styles.terminalOutput} 
        ref={outputRef}
        aria-live="polite"
      >
        {output.map((line, index) => (
          <div key={index} className={getOutputClass(line.type)}>
            {line.text}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className={styles.terminalInputForm}>
        <div className={styles.terminalInputLine}>
          <span className={styles.terminalPrompt}>&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.terminalInput}
            placeholder="Enter command..."
            aria-label="Terminal command input"
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </form>
    </div>
  );
};

export default DebugTerminal;
