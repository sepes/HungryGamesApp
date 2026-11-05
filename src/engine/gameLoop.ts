import type { Player, GameSegmentResult, GameStats, FallenTributeData, SimulationPhase } from '../types/game.types';
import { ArenaGenerator } from './arena';
import { ActionResolver } from './actionResolver';
import type { Arena, MajorEvent } from './types';

export class GameLoop {
  players: Player[];
  day: number;
  phase: SimulationPhase;
  arena: Arena;
  arenaGenerator: ArenaGenerator;
  actionResolver: ActionResolver;
  totalDays: number;
  fallenTributeData: FallenTributeData[];
  gameOver: boolean;
  winner: Player | null;
  winners: Player[];
  winnerCount: number;
  deadThisRound: Player[];
  epilogueShown: boolean;

  constructor(players: Player[]) {
    // Initialize players with extended stats
    this.players = players.map(player => ({
      ...player,
      inventory: [],
      alliances: [],
      mentalHealth: 75,
      courage: 50,
      strength: 0,
      cowardice: 0
    }));

    this.day = 0;
    this.phase = 'prologue';
    this.totalDays = 0;
    this.fallenTributeData = [];
    this.gameOver = false;
    this.winner = null;
    this.winners = [];
    this.winnerCount = 1; // Default: 1 winner
    this.deadThisRound = [];
    this.epilogueShown = false;

    // Generate arena
    this.arenaGenerator = new ArenaGenerator();
    this.arena = this.arenaGenerator.getArena();
    this.actionResolver = new ActionResolver(this.arena);
  }

  nextSegment(): GameSegmentResult {
    const alive = this.players.filter(p => p.isAlive);

    // Check victory condition immediately after any death
    if (alive.length <= this.winnerCount) {
      if (alive.length > 0) {
        this.winners = [...alive];
        this.winner = alive[0]!;
      } else {
        this.winners = [];
        this.winner = null;
      }
      this.gameOver = true;
      this.totalDays = this.day;

      return {
        phase: 'winner',  // Use 'winner' for frontend compatibility
        events: this.formatVictoryAnnouncement(),
        winner: this.winner,
        winners: this.winners,
        alive: alive.length,
        total: this.players.length
      };
    }

    // Epilogue after victory
    if (this.gameOver && !this.epilogueShown) {
      this.epilogueShown = true;
      return {
        phase: 'epilogue',
        events: this.formatEpilogue(),
        winner: this.winner,
        winners: this.winners,
        alive: alive.length,
        total: this.players.length
      };
    }

    // If game is over and epilogue already shown, don't continue
    if (this.gameOver) {
      return {
        phase: 'epilogue',
        events: ['The games have ended.'],
        winner: this.winner,
        winners: this.winners,
        alive: alive.length,
        total: this.players.length
      };
    }

    // Normal phase progression
    let events: string[] = [];
    const currentPhase = this.phase;

    switch (this.phase) {
      case 'prologue':
        events = this.arenaGenerator.generatePrologue();
        this.phase = 'cornucopia';
        break;

      case 'cornucopia':
        events = this.generateCornucopiaEvents();
        this.phase = 'day';
        this.day = 1;
        break;

      case 'day':
        // Check for major event
        const majorEvent = this.checkMajorEvent();
        if (majorEvent) {
          events = this.generateMajorEvent(majorEvent);
          this.phase = 'fallen';
        } else {
          events = this.generateDayEvents();
          this.phase = 'night';
        }
        break;

      case 'night':
        events = this.generateNightEvents();
        this.phase = 'fallen';
        break;

      case 'fallen':
        events = this.formatFallenTributes();
        this.fallenTributeData = this.getFallenTributeData();
        this.deadThisRound = [];
        
        // Reset action weights after day cycle
        this.actionResolver.resetWeights();
        
        // Move to next day
        this.day++;
        this.phase = 'day';
        break;

      default:
        events = ['Something unexpected happened...'];
        break;
    }

    // Check victory again after phase
    const aliveAfter = this.players.filter(p => p.isAlive);
    if (aliveAfter.length <= this.winnerCount && !this.gameOver) {
      if (aliveAfter.length > 0) {
        this.winners = [...aliveAfter];
        this.winner = aliveAfter[0]!;
      } else {
        this.winners = [];
        this.winner = null;
      }
      this.gameOver = true;
      this.totalDays = this.day;

      return {
        phase: 'winner',  // Use 'winner' for frontend compatibility
        events: this.formatVictoryAnnouncement(),
        winner: this.winner,
        winners: this.winners,
        alive: aliveAfter.length,
        total: this.players.length
      };
    }

    // Add phase header
    const header = this.getPhaseHeader(currentPhase);
    const result: GameSegmentResult = {
      phase: currentPhase,
      events: header ? [header, '', ...events] : events,
      winner: null,
      winners: [],
      alive: aliveAfter.length,
      total: this.players.length
    };

    // Add tribute data for fallen phase
    if (currentPhase === 'fallen') {
      result.tributeData = this.fallenTributeData || [];
    }

    return result;
  }

  private generateCornucopiaEvents(): string[] {
    // TODO: Implement cornucopia event generation
    // Structure only - actual templates added later
    return [
      "=== THE HUNGER GAMES ===",
      "",
      "The tributes stand in a circle around the Cornucopia...",
      "The gong sounds. The bloodbath begins!",
      "",
      "// TODO: Generate actual cornucopia events using action resolver"
    ];
  }

  private generateDayEvents(): string[] {
    // TODO: Implement day event generation
    return [
      `=== Day ${this.day} ===`,
      "",
      "// TODO: Generate actual day events using action resolver"
    ];
  }

  private generateNightEvents(): string[] {
    // TODO: Implement night event generation
    return [
      `=== Day ${this.day} - Night Falls ===`,
      "",
      "// TODO: Generate actual night events using action resolver"
    ];
  }

  private checkMajorEvent(): MajorEvent | null {
    // TODO: Implement major event chance logic
    // For now, return null (no major events)
    return null;
  }

  private generateMajorEvent(_event: MajorEvent): string[] {
    // TODO: Implement major event generation
    return [
      "=== MAJOR EVENT ===",
      "",
      "// TODO: Generate major event day and night templates"
    ];
  }

  private formatFallenTributes(): string[] {
    if (this.deadThisRound.length === 0) {
      return ["No cannon fires tonight. Everyone survived another day."];
    }

    const lines = [
      `${this.deadThisRound.length} cannon shot${this.deadThisRound.length > 1 ? 's' : ''} can be heard in the distance.`,
      ""
    ];
    lines.push("Fallen Tributes:");
    this.deadThisRound.forEach(p => {
      lines.push(`  • ${this.highlightPlayerName(p.name)} - District ${p.district}`);
    });

    return lines;
  }

  private getFallenTributeData(): FallenTributeData[] {
    if (this.deadThisRound.length === 0) {
      return [{ name: "No fallen", district: "", kills: 0, diedInPhase: "none", isNoFallen: true }];
    }

    const tributeData = this.deadThisRound.map(p => ({
      name: p.name,
      district: p.district,
      kills: p.kills || 0,
      diedInPhase: p.diedInPhase || 'unknown',
      isNoFallen: false,
      isEmpty: false
    }));

    return [
      { name: "", district: "", kills: 0, diedInPhase: "none", isNoFallen: false, isEmpty: true },
      ...tributeData
    ];
  }

  private formatVictoryAnnouncement(): string[] {
    // TODO: Replace with actual template structure
    // Template format: "{victor}" or "{victor1}", "{victor2}", etc.
    if (this.winners.length === 0) {
      return [
        "",
        "=== NO VICTOR ===",
        "",
        "All tributes have perished.",
        "The Hunger Games conclude with no winner.",
        ""
      ];
    }

    if (this.winners.length === 1) {
      const victor = this.winners[0]!;
      return [
        "",
        "=== VICTORY ===",
        "",
        `Ladies and gentlemen, the winner of this year's Hunger Games...`,
        "",
        `${victor.name.toUpperCase()} FROM DISTRICT ${victor.district}!`,
        "",
        `Kills: ${victor.kills}`,
        `Days Survived: ${this.totalDays || this.day}`,
        "",
        "// TODO: Replace with actual victory template using {victor} placeholder"
      ];
    }

    // Multiple victors
    return [
      "",
      "=== VICTORY ===",
      "",
      `Ladies and gentlemen, the winners of this year's Hunger Games...`,
      "",
      ...this.winners.map((v, i) => 
        `// TODO: Use {victor${i + 1}} placeholder: ${v.name.toUpperCase()} FROM DISTRICT ${v.district}!`
      ),
      "",
      "// TODO: Replace with actual victory template using {victor1}, {victor2}, etc. placeholders"
    ];
  }

  private formatEpilogue(): string[] {
    // TODO: Replace with actual epilogue template structure
    return [
      "=== EPILOGUE ===",
      "",
      "// TODO: Generate actual epilogue text",
      ""
    ];
  }

  private getPhaseHeader(phase: SimulationPhase): string {
    switch (phase) {
      case 'prologue':
        return '';
      case 'cornucopia':
        return `=== THE HUNGER GAMES ===`;
      case 'day':
        return `=== Day ${this.day} ===`;
      case 'night':
        return `=== Day ${this.day} - Night Falls ===`;
      case 'fallen':
        return `=== Fallen Tributes ===`;
      default:
        return '';
    }
  }

  private highlightPlayerName(name: string): string {
    return `<span class="player-highlight">${name}</span>`;
  }

  getGameStats(): GameStats {
    const alive = this.players.filter(p => p.isAlive);
    const dead = this.players.filter(p => !p.isAlive);

    return {
      day: this.day,
      phase: this.phase,
      aliveCount: alive.length,
      totalCount: this.players.length,
      deadCount: dead.length,
      alivePlayers: alive,
      deadPlayers: dead,
      gameOver: this.gameOver,
      winner: this.winner
    };
  }

  reset(): void {
    this.day = 0;
    this.phase = 'prologue';
    this.gameOver = false;
    this.winner = null;
    this.winners = [];
    this.deadThisRound = [];
    this.fallenTributeData = [];
    this.epilogueShown = false;
    
    // Reset players
    this.players.forEach(player => {
      player.isAlive = true;
      player.inventory = [];
      player.alliances = [];
      player.mentalHealth = 75;
      player.courage = 50;
      player.strength = 0;
      player.cowardice = 0;
      player.kills = 0;
      player.diedInPhase = null;
      player.diedOnDay = null;
    });

    // Regenerate arena and reset resolver
    this.arenaGenerator = new ArenaGenerator();
    this.arena = this.arenaGenerator.getArena();
    this.actionResolver = new ActionResolver(this.arena);
  }

  /**
   * Set winner count (for console configuration)
   */
  setWinnerCount(count: number): void {
    this.winnerCount = Math.max(1, count);
  }

  /**
   * Get game configuration
   */
  getConfig(): { winnerCount: number } {
    return {
      winnerCount: this.winnerCount
    };
  }
}
