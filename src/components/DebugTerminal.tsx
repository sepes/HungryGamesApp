import React, { useState, useRef, useEffect } from 'react';
import styles from './DebugTerminal/DebugTerminal.module.scss';
import { GameEngine } from '../engine/gameEngine';
import { EventGenerator } from '../engine/eventGenerator';
import type { GamePhase } from '../types/game.types';

interface TerminalOutput {
  type: 'system' | 'error' | 'success' | 'info' | 'command' | 'warning';
  text: string;
}

interface DebugTerminalProps {
  gameEngine: GameEngine | null;
  gamePhase: GamePhase;
  onNext: () => void;
  onShowVictory: () => void;
  showVictoryButton: boolean;
  enableTributeConfig?: boolean;
}

const DebugTerminal: React.FC<DebugTerminalProps> = ({ gameEngine, gamePhase, onNext, onShowVictory: _onShowVictory, showVictoryButton: _showVictoryButton, enableTributeConfig }) => {
  const [output, setOutput] = useState<TerminalOutput[]>([
    { type: 'system', text: 'Debug Terminal initialized. Type "help" for available commands.' }
  ]);
  const [input, setInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isAutoplaying, setIsAutoplaying] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

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

  const addOutput = (type: TerminalOutput['type'], text: string) => {
    setOutput(prev => [...prev, { type, text }]);
  };

  const autoplayGame = async (devMode = false) => {
    if (gamePhase !== 'simulation') {
      addOutput('error', 'Autoplay is only available during simulation phase.');
      return;
    }

    if (isAutoplaying) {
      addOutput('error', 'Autoplay is already running.');
      return;
    }

    setIsAutoplaying(true);
    if (devMode) {
      addOutput('info', 'Starting autoplay (DEV MODE - fast forward)... Game will advance rapidly until a winner is found.');
    } else {
      addOutput('info', 'Starting autoplay... Game will advance automatically until a winner is found.');
    }
    
    const autoplayStep = () => {
      // Check if game engine exists and phase is valid
      if (!gameEngine || gamePhase !== 'simulation') {
        setIsAutoplaying(false);
        return;
      }
      
      // Check if game is already over (game engine detected winner at start of phase)
      if (gameEngine.gameOver) {
        setIsAutoplaying(false);
        addOutput('info', 'Autoplay complete! Winner found.');
        return;
      }
      
      // Calculate delay before advancing
      const alivePlayers = gameEngine.players.filter(p => p.isAlive);
      let delay: number;
      
      if (devMode) {
        // Dev mode: minimal delay for rapid testing
        delay = 50;
      } else {
        // Normal mode: Calculate dynamic delay: 5000ms base + 3000ms per alive player
        delay = 5000 + (3000 * alivePlayers.length);
        
        // Add extra delay for fallen phase to allow animation to complete
        if (gameEngine.phase === 'fallen') {
          const fallenCount = gameEngine.fallenTributeData?.length || 0;
          // Each tribute animation takes 4000ms (1s fade in + 2s display + 1s fade out)
          delay += fallenCount * 4000;
        }
      }
      
      // Advance the game
      onNext();
      
      // Schedule next step with calculated delay
      setTimeout(autoplayStep, delay);
    };
    
    // Start the autoplay loop
    autoplayStep();
  };

  const handleTributesCommand = (args: string[], calculateOnly = false) => {
    if (!enableTributeConfig) {
      addOutput('error', 'Tributes command is only available during setup phase.');
      return;
    }

    // Check for "null" or "0" as first argument (calculate tributes from districts and per-district)
    const isNullFirst = args[0] && (args[0].toLowerCase() === 'null' || args[0] === '0');
    
    // Parse arguments
    const numArgs = args.filter(arg => !isNaN(parseInt(arg)));
    
    if (isNullFirst) {
      // Handle: tributes null/0 [districts] [per-district]
      const requiredArgs = args[0] === '0' ? 2 : 2; // Need 2 more args (districts and per-district)
      const availableArgs = args[0] === '0' ? numArgs.length - 1 : numArgs.length; // Subtract 1 if first is "0" since it's in numArgs
      
      if (availableArgs !== requiredArgs) {
        addOutput('error', 'When using "null" or "0", you must provide exactly 2 numbers: [districts] [tributes-per-district]');
        return;
      }
    } else {
      if (numArgs.length === 0 || numArgs.length > 3) {
        addOutput('error', 'Invalid number of arguments. Use "tributes --help" for usage information.');
        return;
      }
    }

    let tributes: number, districts: number | null, tributesPerDistrict: number | null;
    
    if (isNullFirst) {
      // Calculate tributes from districts and per-district
      if (args[0] === '0') {
        // If first arg is "0", it's already in numArgs, so districts is at index 1, per-district at index 2
        districts = parseInt(numArgs[1]!);
        tributesPerDistrict = parseInt(numArgs[2]!);
      } else {
        // If first arg is "null", it's not in numArgs, so districts is at index 0, per-district at index 1
        districts = parseInt(numArgs[0]!);
        tributesPerDistrict = parseInt(numArgs[1]!);
      }
      tributes = districts * tributesPerDistrict;
    } else {
      tributes = parseInt(numArgs[0]!);
      districts = numArgs.length >= 2 ? parseInt(numArgs[1]!) : null;
      tributesPerDistrict = numArgs.length >= 3 ? parseInt(numArgs[2]!) : null;
    }

    // Validation: Check for 0 or negative values
    if (tributes <= 0) {
      addOutput('error', 'Tributes cannot be 0 or less.');
      return;
    }
    if (districts !== null && districts <= 0) {
      addOutput('error', 'Districts cannot be 0 or less.');
      return;
    }
    if (tributesPerDistrict !== null && tributesPerDistrict <= 0) {
      addOutput('error', 'Tributes per district cannot be 0 or less.');
      return;
    }

    // Validation: Check for max values
    if (tributes > 1024) {
      addOutput('error', 'Maximum number of tributes is 1024.');
      return;
    }
    if (districts !== null && districts > 1024) {
      addOutput('error', 'Maximum number of districts is 1024.');
      return;
    }
    if (tributesPerDistrict !== null && tributesPerDistrict > 1024) {
      addOutput('error', 'Maximum tributes per district is 1024.');
      return;
    }

    // Calculate based on provided parameters
    const warnings: string[] = [];

    if (isNullFirst) {
      // Tributes calculated from districts and per-district
      warnings.push(`WARNING: ${districts} districts filled with ${tributes} tributes (${tributesPerDistrict} per district).`);
    } else if (numArgs.length === 1) {
      // Only tributes provided - auto-calculate districts
      districts = Math.min(12, tributes);
      if (tributes < 12) {
        warnings.push(`WARNING: Tributes (${tributes}) is less than default districts (12). Setting districts to ${districts}.`);
      }
      tributesPerDistrict = Math.floor(tributes / districts);
      if (tributes % districts !== 0) {
        const remainder = tributes % districts;
        const higherCount = tributesPerDistrict + 1;
        const lowerCount = tributesPerDistrict;
        warnings.push(`WARNING: ${tributes} tributes cannot be evenly distributed across ${districts} districts. Districts 1-${remainder} will have ${higherCount} tributes, districts ${remainder + 1}-${districts} will have ${lowerCount} tributes.`);
      }
    } else if (numArgs.length === 2) {
      // Tributes and districts provided - calculate per district
      if (tributes < districts!) {
        const oldDistricts = districts;
        districts = tributes;
        warnings.push(`WARNING: Tributes (${tributes}) is less than districts (${oldDistricts}). Setting districts to ${districts}.`);
      }
      tributesPerDistrict = Math.floor(tributes / districts!);
      if (tributes % districts! !== 0) {
        const remainder = tributes % districts!;
        const higherCount = tributesPerDistrict + 1;
        const lowerCount = tributesPerDistrict;
        warnings.push(`WARNING: ${tributes} tributes cannot be evenly distributed across ${districts} districts. Districts 1-${remainder} will have ${higherCount} tributes, districts ${remainder + 1}-${districts} will have ${lowerCount} tributes.`);
      }
    } else if (numArgs.length === 3) {
      // All three provided
      const expectedTotal = districts! * tributesPerDistrict!;
      if (tributes !== expectedTotal) {
        if (tributes < districts!) {
          const oldDistricts = districts;
          districts = tributes;
          tributesPerDistrict = 1;
          warnings.push(`WARNING: Tributes (${tributes}) is less than districts (${oldDistricts}). Setting districts to ${districts}.`);
        }
        const lastDistrictCount = tributes - (tributesPerDistrict! * (districts! - 1));
        warnings.push(`WARNING: Total tributes (${tributes}) does not match districts (${districts}) × tributes per district (${tributesPerDistrict}). Last district will have ${lastDistrictCount} tributes.`);
      }
    }

    // Output results
    addOutput('info', `Configuration: ${tributes} tributes, ${districts} districts, ${tributesPerDistrict} per district`);
    
    // Show warnings
    warnings.forEach(warning => addOutput('warning', warning));

    if (calculateOnly) {
      addOutput('system', 'Calculation complete (--calculate mode, no changes applied).');
    } else {
      // Apply the configuration
      if (typeof window !== 'undefined' && (window as any).updateTributeConfig) {
        (window as any).updateTributeConfig({ tributes, districts, tributesPerDistrict });
        addOutput('system', 'Tribute configuration updated successfully!');
      } else {
        addOutput('error', 'Failed to update configuration. Make sure you are on the setup screen.');
      }
    }
  };


  const executeCommand = (command: string) => {
    const trimmedCommand = command.trim();
    
    // Add command to output
    addOutput('command', `> ${command}`);
    
    // Add to history
    setCommandHistory(prev => [command, ...prev.filter(cmd => cmd !== command)]);
    setHistoryIndex(-1);
    
    // Parse command with arguments
    const parts = trimmedCommand.split(/\s+/);
    const cmd = parts[0]?.toLowerCase() ?? '';
    const args = parts.slice(1);
    
    // Execute command
    if (cmd === 'tributes' || cmd === 'tbs') {
      // Handle tributes command
      if (args.includes('--help')) {
        addOutput('system', 'TRIBUTES COMMAND USAGE:');
        addOutput('system', '');
        addOutput('system', '  tributes [number-of-tributes]');
        addOutput('system', '    Set custom number of tributes. Districts auto-calculated.');
        addOutput('system', '');
        addOutput('system', '  tributes [number-of-tributes] [number-of-districts]');
        addOutput('system', '    Set tributes and districts. Tributes per district auto-calculated.');
        addOutput('system', '');
        addOutput('system', '  tributes [number-of-tributes] [number-of-districts] [tributes-per-district]');
        addOutput('system', '    Set all three parameters. Last district adjusts for remainder.');
        addOutput('system', '');
        addOutput('system', '  tributes null [number-of-districts] [tributes-per-district]');
        addOutput('system', '  tributes 0 [number-of-districts] [tributes-per-district]');
        addOutput('system', '    Calculate total tributes from districts and per-district count.');
        addOutput('system', '');
        addOutput('system', 'FLAGS:');
        addOutput('system', '  --help      Show this help message');
        addOutput('system', '  --calculate, --calc  Calculate distribution without applying changes');
        addOutput('system', '');
        addOutput('system', 'RULES:');
        addOutput('system', '  - All numbers must be greater than 0');
        addOutput('system', '  - Maximum value for any parameter is 1024');
        addOutput('system', '  - If tributes < districts, districts will be adjusted');
        addOutput('system', '  - If uneven distribution, remainders are distributed from district 1 onwards');
        return;
      }
      
      const calculateOnly = args.includes('--calculate') || args.includes('--calc');
      const numericArgs = args.filter(arg => arg !== '--calculate' && arg !== '--calc');
      handleTributesCommand(numericArgs, calculateOnly);
      return;
    }
    
    // Regular commands
    switch (cmd) {
      case 'help':
        addOutput('system', 'Available commands:');
        addOutput('system', '  help     - Show this help message');
        addOutput('system', '  clear    - Clear the terminal output');
        addOutput('system', '  test     - Test color coding (info/warning/error)');
        addOutput('system', '  autoplay [--dev] - Automatically advance game until winner is found');
        addOutput('system', '             Use --dev flag for rapid testing (50ms delay)');
        addOutput('system', '  stats    - Show detailed player statistics');
        addOutput('system', '  tributes, tbs - Configure custom tribute counts (use "tributes --help")');
        addOutput('system', '');
        addOutput('system', 'More commands will be added in future updates. PS: there is no cheats to have your name win the game.');
        break;
        
      case 'clear':
        setOutput([]);
        break;
        
      case 'test':
        addOutput('info', 'This is an info message (blue)');
        addOutput('warning', 'This is a warning message (yellow)');
        addOutput('error', 'This is an error message (red)');
        break;
        
      case 'autoplay':
        // Check for --dev flag
        autoplayGame(args.includes('--dev'));
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
        const mostEquipped = alivePlayers.length > 0 ? alivePlayers.reduce((best, player) => {
          const currentItems = (player.inventory || []).length;
          const bestItems = ((best?.inventory) || []).length;
          return currentItems > bestItems ? player : best;
        }, alivePlayers[0]) : null;
        const mostDangerous = alivePlayers.length > 0 ? alivePlayers.reduce((best, player) => {
          const currentScore = (player.kills || 0) + (player.inventory || []).filter(item => 
            EventGenerator.WEAPONS.includes(item.name)
          ).length;
          const bestScore = ((best?.kills) || 0) + ((best?.inventory) || []).filter(item => 
            EventGenerator.WEAPONS.includes(item.name)
          ).length;
          return currentScore > bestScore ? player : best;
        }, alivePlayers[0]) : null;
        
        addOutput('system', '=== SUMMARY STATISTICS ===');
        addOutput('system', `Average Mental Health: ${alivePlayers.length > 0 ? Math.round(avgMentalHealth) : 0}/100`);
        addOutput('system', `Most Well-Equipped: ${mostEquipped ? mostEquipped.name : 'N/A'} (${mostEquipped ? (mostEquipped.inventory || []).length : 0} items)`);
        addOutput('system', `Most Dangerous: ${mostDangerous ? mostDangerous.name : 'N/A'} (${mostDangerous ? (mostDangerous.kills || 0) : 0} kills, ${mostDangerous ? (mostDangerous.inventory || []).filter(item => 
          EventGenerator.WEAPONS.includes(item.name)
        ).length : 0} weapons)`);
        break;
        
      case '':
        // Empty command, just show prompt
        break;
        
      default:
        addOutput('error', `Unknown command: "${command}"`);
        addOutput('system', 'Type "help" for available commands.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex] ?? '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex] ?? '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const getOutputClass = (type: TerminalOutput['type']) => {
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
