import React, { useState, useRef, useEffect } from 'react';

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
      if (showVictoryButton) {
        clearInterval(autoplayInterval);
        setIsAutoplaying(false);
        addOutput('info', 'Autoplay complete! Winner found.');
        return;
      }
      
      if (gamePhase === 'winner' && onNext) {
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
      case 'command': return 'terminal-command';
      case 'system': return 'terminal-system';
      case 'error': return 'terminal-error';
      case 'warning': return 'terminal-warning';
      case 'info': return 'terminal-info';
      default: return 'terminal-output-line';
    }
  };

  return (
    <div className="debug-terminal" role="log" aria-label="Debug terminal">
      <div 
        className="terminal-output" 
        ref={outputRef}
        aria-live="polite"
      >
        {output.map((line, index) => (
          <div key={index} className={getOutputClass(line.type)}>
            {line.text}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="terminal-input-form">
        <div className="terminal-input-line">
          <span className="terminal-prompt">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
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
