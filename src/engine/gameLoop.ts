import type { Player, GameSegmentResult, GameStats, FallenTributeData, SimulationPhase } from '../types/game.types';
import { ArenaGenerator } from './arena';
import type { Arena } from './types';
import { runCornucopiaRound, runPhaseDamageBeats } from './templateEngine';
import type { DamageBeatContext } from './templateEngine';
import { countAllianceTeams } from './allianceRules';
import { getCannonGroupText } from './actions';
import { markPlayerName } from '../utils/eventText';

export class GameLoop {
  players: Player[];
  day: number;
  phase: SimulationPhase;
  arena: Arena;
  arenaGenerator: ArenaGenerator;
  totalDays: number;
  fallenTributeData: FallenTributeData[];
  gameOver: boolean;
  winner: Player | null;
  winners: Player[];
  winnerCount: number;
  deadThisRound: Player[];
  epilogueShown: boolean;
  private deadPlaceCounter: number;
  private cornucopiaRound: number;
  private cornucopiaParticipants: Player[];
  private cornucopiaDeaths: Player[];

  constructor(players: Player[]) {
    this.players = players.map(p => this.freshPlayerState(p));

    this.day = 0;
    this.phase = 'prologue';
    this.totalDays = 0;
    this.fallenTributeData = [];
    this.gameOver = false;
    this.winner = null;
    this.winners = [];
    this.winnerCount = 1;
    this.deadThisRound = [];
    this.epilogueShown = false;
    this.deadPlaceCounter = 1;
    this.cornucopiaRound = 0;
    this.cornucopiaParticipants = [];
    this.cornucopiaDeaths = [];

    this.arenaGenerator = new ArenaGenerator();
    this.arena = this.arenaGenerator.getArena();
  }

  private freshPlayerState(player: Player): Player {
    return {
      ...player,
      inventory: [],
      alliances: [],
      damage: 0,
      deathPlace: null
    };
  }

  private nextDeathPlace(): number {
    return this.deadPlaceCounter++;
  }

  private makeBeatContext(phase: SimulationPhase): DamageBeatContext {
    return {
      phase,
      arena: this.arena,
      players: this.players,
      day: this.day,
      getNextPlace: () => this.nextDeathPlace()
    };
  }

  private victoryResult(alive: Player[]): GameSegmentResult {
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
      phase: 'winner',
      events: this.formatVictoryAnnouncement(),
      winner: this.winner,
      winners: this.winners,
      alive: alive.length,
      total: this.players.length
    };
  }

  /** Ends the game when at most `winnerCount` tributes remain. */
  private endIfFewPlayersRemain(alive: Player[]): GameSegmentResult | null {
    if (alive.length > this.winnerCount) return null;
    return this.victoryResult(alive);
  }

  nextSegment(): GameSegmentResult {
    const alive = this.players.filter(p => p.isAlive);

    const earlyWin = this.endIfFewPlayersRemain(alive);
    if (earlyWin) return earlyWin;

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

    let events: string[] = [];
    const currentPhase = this.phase;
    let customHeader: string | undefined;

    switch (this.phase) {
      case 'prologue':
        events = this.arenaGenerator.generatePrologue();
        this.phase = 'cornucopia';
        this.cornucopiaRound = 0;
        this.cornucopiaParticipants = [];
        this.cornucopiaDeaths = [];
        break;

      case 'cornucopia': {
        this.cornucopiaRound++;
        if (this.cornucopiaRound === 1) {
          this.cornucopiaParticipants = this.players.filter(p => p.isAlive);
          this.cornucopiaDeaths = [];
        } else {
          customHeader = `=== Bloodbath continues ${this.cornucopiaRound - 1} ===`;
        }

        const { lines, hasMoreRounds } = this.generateCornucopiaEvents();
        events = lines;

        if (!hasMoreRounds) {
          this.phase = 'day';
          this.day = 1;
        }
        break;
      }

      case 'day':
        events = this.generateDayEvents();
        this.phase = 'night';
        break;

      case 'night':
        events = this.generateNightEvents();
        this.phase = 'fallen';
        break;

      case 'fallen':
        events = this.formatFallenTributes();
        this.fallenTributeData = this.getFallenTributeData();
        this.deadThisRound = [];
        this.day++;
        this.phase = 'day';
        break;

      default:
        events = ['Something unexpected happened...'];
        break;
    }

    const aliveAfter = this.players.filter(p => p.isAlive);

    const header = customHeader ?? this.getPhaseHeader(currentPhase);
    const result: GameSegmentResult = {
      phase: currentPhase,
      events: header ? [header, '', ...events] : events,
      winner: null,
      winners: [],
      alive: aliveAfter.length,
      total: this.players.length
    };

    if (currentPhase === 'fallen') {
      result.tributeData = this.fallenTributeData ?? [];
    }

    return result;
  }

  private generateCornucopiaEvents(): { lines: string[]; hasMoreRounds: boolean } {
    const { lines, died, stayedInCornucopia } = runCornucopiaRound(
      this.cornucopiaParticipants,
      this.makeBeatContext('cornucopia'),
      this.winnerCount
    );

    this.deadThisRound.push(...died);
    this.cornucopiaDeaths.push(...died);
    this.cornucopiaParticipants = stayedInCornucopia;

    const aliveAll = this.players.filter(p => p.isAlive);
    const hasMoreRounds =
      aliveAll.length > this.winnerCount &&
      countAllianceTeams(this.cornucopiaParticipants) > 1;

    const outputLines: string[] =
      this.cornucopiaRound === 1
        ? [
            'The tributes stand in a circle around the Cornucopia...',
            'The gong sounds. The bloodbath begins.',
            '',
            ...lines
          ]
        : [...lines];

    if (!hasMoreRounds && this.cornucopiaDeaths.length > 0) {
      const groupCannon = getCannonGroupText(this.cornucopiaDeaths.length);
      if (groupCannon) {
        if (outputLines.length > 0) {
          outputLines.push('');
        }
        outputLines.push(groupCannon);
      }
    }

    return { lines: outputLines, hasMoreRounds };
  }

  private generateDayEvents(): string[] {
    const { lines, died } = runPhaseDamageBeats(
      this.makeBeatContext('day'),
      this.winnerCount
    );
    this.deadThisRound.push(...died);
    return lines;
  }

  private generateNightEvents(): string[] {
    const { lines, died } = runPhaseDamageBeats(
      this.makeBeatContext('night'),
      this.winnerCount
    );
    this.deadThisRound.push(...died);
    return lines;
  }

  private formatFallenTributes(): string[] {
    if (this.deadThisRound.length === 0) {
      return ['Everyone survived another day.'];
    }

    const lines = ['Fallen Tributes:'];
    this.deadThisRound.forEach(p => {
      lines.push(`  • ${markPlayerName(p.name)} - District ${p.district}`);
    });

    return lines;
  }

  private getFallenTributeData(): FallenTributeData[] {
    if (this.deadThisRound.length === 0) {
      return [{ name: 'No fallen', district: '', kills: 0, diedInPhase: 'none', isNoFallen: true }];
    }

    const tributeData = this.deadThisRound.map(p => ({
      name: p.name,
      district: p.district,
      kills: p.kills || 0,
      diedInPhase: p.diedInPhase || 'unknown',
      diedOnDay: p.diedOnDay ?? undefined,
      isNoFallen: false,
      isEmpty: false
    }));

    return [
      { name: '', district: '', kills: 0, diedInPhase: 'none', isNoFallen: false, isEmpty: true },
      ...tributeData
    ];
  }

  private formatVictoryAnnouncement(): string[] {
    if (this.winners.length === 0) {
      return [
        '',
        '=== NO VICTOR ===',
        '',
        'All tributes have perished.',
        'The Hunger Games conclude with no winner.',
        ''
      ];
    }

    if (this.winners.length === 1) {
      const victor = this.winners[0]!;
      return [
        '',
        '=== VICTORY ===',
        '',
        `Ladies and gentlemen, the winner of this year's Hunger Games...`,
        '',
        `${markPlayerName(victor.name.toUpperCase())} FROM DISTRICT ${victor.district}!`,
        '',
        `Kills: ${victor.kills}`,
        `Days Survived: ${this.totalDays || this.day}`,
        '',
        '// TODO: Replace with actual victory template using {victor} placeholder'
      ];
    }

    return [
      '',
      '=== VICTORY ===',
      '',
      `Ladies and gentlemen, the winners of this year's Hunger Games...`,
      '',
      ...this.winners.map(
        (v, i) =>
          `// TODO: Use {victor${i + 1}} placeholder: ${markPlayerName(v.name.toUpperCase())} FROM DISTRICT ${v.district}!`
      ),
      '',
      '// TODO: Replace with actual victory template using {victor1}, {victor2}, etc. placeholders'
    ];
  }

  private formatEpilogue(): string[] {
    return [
      '=== EPILOGUE ===',
      '',
      '// TODO: Generate actual epilogue text',
      ''
    ];
  }

  private getPhaseHeader(phase: SimulationPhase): string {
    switch (phase) {
      case 'prologue':
        return '';
      case 'cornucopia':
        return '=== THE HUNGER GAMES ===';
      case 'day':
        return `=== Day ${this.day} ===`;
      case 'night':
        return `=== Day ${this.day} - Night Falls ===`;
      case 'fallen':
        return '=== Fallen Tributes ===';
      default:
        return '';
    }
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
    this.cornucopiaRound = 0;
    this.cornucopiaParticipants = [];
    this.cornucopiaDeaths = [];

    this.players = this.players.map(p => ({
      ...this.freshPlayerState(p),
      id: p.id,
      name: p.name,
      district: p.district,
      isAlive: true,
      kills: 0,
      diedInPhase: null,
      diedOnDay: null
    }));

    this.deadPlaceCounter = 1;

    this.arenaGenerator = new ArenaGenerator();
    this.arena = this.arenaGenerator.getArena();
  }

  setWinnerCount(count: number): void {
    this.winnerCount = Math.max(1, count);
  }

  getConfig(): { winnerCount: number } {
    return { winnerCount: this.winnerCount };
  }
}
