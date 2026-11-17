import React, { useState, useRef, useEffect } from 'react';
import styles from './DebugTerminal/DebugTerminal.module.scss';
import { GameLoop } from '../engine/gameLoop';
import type { GamePhase, SimulationPhase } from '../types/game.types';

interface TerminalOutput {
  type: 'system' | 'error' | 'success' | 'info' | 'command' | 'warning';
  text: string;
}

interface DebugTerminalProps {
  gameEngine: GameLoop | null;
  gamePhase: GamePhase;
  currentPhase: SimulationPhase;
  stepCount: number;
  isFallenAnimating: boolean;
  onNext: () => void;
  onShowVictory: () => void;
  showVictoryButton: boolean;
  enableTributeConfig?: boolean;
  onMockVolunteers?: (count: number) => { added: number; slotLimit: number };
  onToggleDamage: (mode?: 'on' | 'off') => boolean;
  skipFallen: boolean;
  onToggleSkipFallen: (mode?: 'on' | 'off') => boolean;
}

const DebugTerminal: React.FC<DebugTerminalProps> = ({ gameEngine, gamePhase, currentPhase, stepCount, isFallenAnimating, onNext, onShowVictory: _onShowVictory, showVictoryButton, enableTributeConfig, onMockVolunteers, onToggleDamage, skipFallen, onToggleSkipFallen }) => {
  const [output, setOutput] = useState<TerminalOutput[]>([
    { type: 'system', text: 'Debug Terminal initialized. Type "help" for available commands.' }
  ]);
  const [input, setInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [autoplayMode, setAutoplayMode] = useState<'off' | 'normal' | 'dev'>('off');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;
  const onToggleSkipFallenRef = useRef(onToggleSkipFallen);
  onToggleSkipFallenRef.current = onToggleSkipFallen;
  // skipfallen value to restore when autoplay ends; null when there is nothing to restore
  const skipFallenBeforeAutoplayRef = useRef<boolean | null>(null);

  const restoreSkipFallen = () => {
    if (skipFallenBeforeAutoplayRef.current === false) {
      onToggleSkipFallenRef.current('off');
    }
    skipFallenBeforeAutoplayRef.current = null;
  };

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

  useEffect(() => {
    if (autoplayMode === 'off') {
      restoreSkipFallen();
    }
  }, [autoplayMode]);

  useEffect(() => () => restoreSkipFallen(), []);

  // Drive autoplay reactively so phase changes, manual clicks, skipfallen, and resets stay in sync
  useEffect(() => {
    if (autoplayMode === 'off') return;

    if (!gameEngine || gamePhase !== 'simulation') {
      setAutoplayMode('off');
      return;
    }

    if (gameEngine.gameOver || showVictoryButton) {
      setAutoplayMode('off');
      addOutput('info', gameEngine.winner ? 'Autoplay complete! Winner found.' : 'Autoplay complete! Game ended.');
      return;
    }

    if (autoplayMode === 'normal' && currentPhase === 'fallen' && isFallenAnimating && !skipFallen) {
      return;
    }

    const delay = autoplayMode === 'dev' ? 50 : 333;

    const timer = setTimeout(() => {
      onNextRef.current();
    }, delay);

    return () => clearTimeout(timer);
  }, [autoplayMode, gameEngine, gamePhase, showVictoryButton, currentPhase, stepCount, isFallenAnimating, skipFallen]);

  const handleAutoplayCommand = (args: string[]) => {
    const validFlags = new Set(['--dev', '-on', '-off', '--stop', 'stop']);
    const invalidArg = args.find(arg => !validFlags.has(arg.toLowerCase()));
    const normalizedArgs = args.map(arg => arg.toLowerCase());
    const wantsStop = normalizedArgs.some(arg => arg === '-off' || arg === '--stop' || arg === 'stop');
    const wantsDev = normalizedArgs.includes('--dev');
    const wantsOn = normalizedArgs.includes('-on');

    if (invalidArg || (wantsStop && (wantsDev || wantsOn)) || args.length > 2) {
      addOutput('error', 'Usage: autoplay [--dev | -off]');
      return;
    }

    if (wantsStop) {
      if (autoplayMode === 'off') {
        addOutput('info', 'Autoplay is not currently running.');
      } else {
        setAutoplayMode('off');
        addOutput('info', 'Autoplay stopped.');
      }
      return;
    }

    if (autoplayMode !== 'off') {
      if (wantsDev && autoplayMode === 'normal') {
        setAutoplayMode('dev');
        addOutput('info', 'Switched autoplay to DEV MODE (fast forward).');
        return;
      }
      if (!wantsDev && !wantsOn) {
        setAutoplayMode('off');
        addOutput('info', 'Autoplay stopped.');
        return;
      }
      addOutput('info', 'Autoplay is already running. Use "autoplay -off" to stop.');
      return;
    }

    if (gamePhase !== 'simulation' || !gameEngine) {
      addOutput('error', 'Autoplay is only available during simulation phase.');
      return;
    }

    if (gameEngine.gameOver || showVictoryButton) {
      addOutput('info', 'Game is already over! Winner has already been found.');
      return;
    }

    skipFallenBeforeAutoplayRef.current = skipFallen;
    if (!skipFallen) {
      onToggleSkipFallen('on');
    }

    const nextMode = wantsDev ? 'dev' : 'normal';
    setAutoplayMode(nextMode);
    if (wantsDev) {
      addOutput('info', 'Starting autoplay (DEV MODE - fast forward)... Game will advance rapidly until a winner is found.');
    } else {
      addOutput('info', 'Starting autoplay... Game will advance automatically until a winner is found.');
    }
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

    if (cmd === 'mock') {
      if (gamePhase !== 'setup') {
        addOutput('error', 'Mock command is only available during setup phase.');
        return;
      }
      if (!onMockVolunteers) {
        addOutput('error', 'Mock volunteers is not available.');
        return;
      }
      if (args.length !== 1) {
        addOutput('error', 'Usage: mock [number-of-volunteers]');
        return;
      }
      const count = parseInt(args[0]!, 10);
      if (Number.isNaN(count) || count <= 0) {
        addOutput('error', 'Number of volunteers must be a positive integer.');
        return;
      }
      if (count > 1024) {
        addOutput('error', 'Maximum number of volunteers is 1024.');
        return;
      }
      const result = onMockVolunteers(count);
      addOutput(
        'system',
        `Mocked ${result.added} volunteer${result.added === 1 ? '' : 's'} using random name generator (${result.added} / ${result.slotLimit} slots).`
      );
      if (count > result.slotLimit) {
        addOutput('warning', `Requested ${count} volunteers but tribute count allows ${result.slotLimit}.`);
      }
      return;
    }
    
    // Regular commands
    switch (cmd) {
      case 'help':
        addOutput('system', 'Available commands:');
        addOutput('system', '');
        
        // Format commands with aligned columns (30 char width for command/flags)
        const formatHelpLine = (command: string, description: string) => {
          const commandWidth = 30;
          const paddedCommand = command.padEnd(commandWidth);
          return `  ${paddedCommand}${description}`;
        };
        
        addOutput('system', formatHelpLine('help', 'Show this help message'));
        addOutput('system', formatHelpLine('clear', 'Clear the terminal output'));
        addOutput('system', formatHelpLine('test', 'Test color coding (info/warning/error)'));
        addOutput('system', formatHelpLine('autoplay [--dev|-off]', 'Automatically advance game until winner is found'));
        addOutput('system', formatHelpLine('', 'Use --dev flag for rapid testing (50ms delay)'));
        addOutput('system', formatHelpLine('stats', 'Show detailed player statistics'));
        addOutput('system', formatHelpLine('tributes, tbs', 'Configure custom tribute counts (use "tributes --help")'));
        addOutput('system', formatHelpLine('mock [number]', 'Add mock volunteers (does not change tribute count)'));
        addOutput('system', formatHelpLine('dmg [-on|-off]', 'Toggle damage visibility in tributes panel'));
        addOutput('system', formatHelpLine('skipfallen [-on|-off]', 'Toggle skipping fallen tribute animations'));
        addOutput('system', formatHelpLine('askagain', 'Reset all "don\'t ask again" preferences'));
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
        handleAutoplayCommand(args);
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
          const inventory = player.inventory && player.inventory.length > 0
            ? player.inventory.map(item => item.name).join(', ')
            : 'None';
          const alliances = player.alliances && player.alliances.length > 0
            ? player.alliances.map(allyId => {
                const ally = gameEngine.players.find(p => p.id === allyId);
                return ally ? ally.name : 'Unknown';
              }).join(', ')
            : 'None';
          
          addOutput('info', `${player.name} (District ${player.district}) - ${status}`);
          addOutput('system', `  Kills: ${player.kills || 0}`);
          addOutput('system', `  Damage: ${player.damage ?? 0}/100`);
          addOutput('system', `  Inventory: ${inventory}`);
          addOutput('system', `  Alliances: ${alliances}`);
          addOutput('system', '');
        });
        
        // Summary statistics
        const alivePlayers = gameEngine.players.filter(p => p.isAlive);
        const avgDamage = alivePlayers.length > 0
          ? alivePlayers.reduce((sum, p) => sum + (p.damage ?? 0), 0) / alivePlayers.length
          : 0;
        const mostEquipped = alivePlayers.length > 0 ? alivePlayers.reduce((best, player) => {
          const currentItems = (player.inventory || []).length;
          const bestItems = ((best?.inventory) || []).length;
          return currentItems > bestItems ? player : best;
        }, alivePlayers[0]) : null;
        const mostDangerous = alivePlayers.length > 0 ? alivePlayers.reduce((best, player) => {
          const currentScore = (player.kills || 0) + (player.inventory || []).length;
          const bestScore = ((best?.kills) || 0) + ((best?.inventory) || []).length;
          return currentScore > bestScore ? player : best;
        }, alivePlayers[0]) : null;
        
        addOutput('system', '=== SUMMARY STATISTICS ===');
        addOutput('system', `Average Damage (Alive): ${Math.round(avgDamage)}/100`);
        addOutput('system', `Most Well-Equipped: ${mostEquipped ? mostEquipped.name : 'N/A'} (${mostEquipped ? (mostEquipped.inventory || []).length : 0} items)`);
        addOutput('system', `Most Dangerous: ${mostDangerous ? mostDangerous.name : 'N/A'} (${mostDangerous ? (mostDangerous.kills || 0) : 0} kills, ${mostDangerous ? (mostDangerous.inventory || []).length : 0} items)`);
        break;
        
      case 'dmg': {
        const flag = args[0]?.toLowerCase();
        if (args.length > 1 || (flag && flag !== '-on' && flag !== '-off')) {
          addOutput('error', 'Usage: dmg [-on | -off]');
          break;
        }
        const mode = flag === '-on' ? 'on' : flag === '-off' ? 'off' : undefined;
        const isVisible = onToggleDamage(mode);
        addOutput('info', `Tribute damage visibility: ${isVisible ? 'ON' : 'OFF'}`);
        break;
      }

      case 'skipfallen': {
        const flag = args[0]?.toLowerCase();
        if (args.length > 1 || (flag && flag !== '-on' && flag !== '-off')) {
          addOutput('error', 'Usage: skipfallen [-on | -off]');
          break;
        }
        const mode = flag === '-on' ? 'on' : flag === '-off' ? 'off' : undefined;
        skipFallenBeforeAutoplayRef.current = null;
        const isSkipped = onToggleSkipFallen(mode);
        addOutput('info', `Skip fallen animations: ${isSkipped ? 'ON' : 'OFF'}`);
        break;
      }

      case 'askagain':
        if (typeof window !== 'undefined' && window.localStorage) {
          const hadResetPreference = localStorage.getItem('skipResetConfirm') === 'true';
          const hadDisconnectPreference = localStorage.getItem('skipTwitchDisconnectConfirm') === 'true';
          localStorage.removeItem('skipResetConfirm');
          localStorage.removeItem('skipTwitchDisconnectConfirm');
          if (hadResetPreference || hadDisconnectPreference) {
            addOutput('info', 'All "don\'t ask again" preferences have been reset.');
            addOutput('system', 'Confirmation dialogs will now appear again when resetting the game or disconnecting from Twitch.');
          } else {
            addOutput('info', 'No "don\'t ask again" preferences were found. All confirmation dialogs are already enabled.');
          }
        } else {
          addOutput('error', 'Unable to access localStorage. Preferences may not be saved.');
        }
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
