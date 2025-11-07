import { EventGenerator } from './eventGenerator';
import type { Player, GameSegmentResult, GameStats, SurvivalStats, LeaderboardEntry, SimulationPhase, MajorEventConfig, FallenTributeData } from '../types/game.types';

export class GameEngine {
    players: Player[];
    day: number;
    phase: SimulationPhase;
    eventGenerator: EventGenerator;
    totalDays: number;
    fallenTributeData: FallenTributeData[];
    gameOver?: boolean;
    winner?: Player | null;

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
        this.day = 1;
        this.phase = 'cornucopia';
        this.eventGenerator = new EventGenerator(this.players, this);
        this.totalDays = 0;
        this.fallenTributeData = [];
    }

    nextSegment(): GameSegmentResult {
        let events: string[] = [];
        const currentPhase = this.phase; // Save current phase for header

        switch (this.phase) {
            case 'cornucopia':
                events = this.eventGenerator.generateCornucopiaEvents();
                this.phase = 'day';
                break;

            case 'day':
                events = this.eventGenerator.generateDayEvents();
                this.phase = 'night';
                break;

            case 'night':
                events = this.eventGenerator.generateNightEvents();
                this.phase = 'fallen';
                break;

            case 'fallen':
                events = this.eventGenerator.formatFallenTributes();
                // Get tribute data before clearing deadThisRound
                this.fallenTributeData = this.eventGenerator.getFallenTributeData();
                this.eventGenerator.deadThisRound = [];

                // Move to next day if not first fallen
                if (this.day > 0) {
                    this.day++;
                }
                this.phase = 'day';
                break;

            default:
                // This shouldn't happen, but just in case
                this.phase = 'day';
                events = ['Something unexpected happened...'];
                break;
        }

        // Check for winner
        const alive = this.players.filter(p => p.isAlive);
        if (alive.length === 1) {
            const winner = alive[0]!; // Safe: checked length === 1
            this.gameOver = true;
            this.winner = winner;
            this.totalDays = this.day;
            return {
                phase: 'winner',
                events: this.formatWinnerAnnouncement(winner),
                winner: winner,
                alive: 1,
                total: this.players.length
            };
        }

        // Prevent infinite games - if only 2 left and it's been many days, force confrontation
        if (alive.length === 2 && this.day > 10) {
            const p1 = alive[0]!; // Safe: checked length === 2
            const p2 = alive[1]!; // Safe: checked length === 2
            const winner = Math.random() < 0.5 ? p1 : p2;
            const loser = winner === p1 ? p2 : p1;
            this.gameOver = true;
            this.winner = winner;
            loser.isAlive = false;
            winner.kills = (winner.kills || 0) + 1;

            return {
                phase: 'winner',
                events: [
                    `=== FINAL CONFRONTATION ===`,
                    ``,
                    `After ${this.day} brutal days, ${p1.name} and ${p2.name} are forced together by the Gamemakers.`,
                    `They fight desperately for survival.`,
                    `${winner.name} emerges victorious, killing ${loser.name} in the final battle.`,
                    ``,
                    ...this.formatWinnerAnnouncement(winner)
                ],
                winner: winner,
                alive: 1,
                total: this.players.length
            };
        }

        // Add phase header using the CURRENT phase (before it changed)
        const header = this.getPhaseHeader(currentPhase);

        // For fallen phase, include tribute data for animation
        const result: GameSegmentResult = {
            phase: currentPhase, // Return current phase, not next phase
            events: header ? [header, '', ...events] : events,
            winner: null,
            alive: alive.length,
            total: this.players.length
        };

        // Add tribute data for fallen phase animation
        if (currentPhase === 'fallen') {
            result.tributeData = this.fallenTributeData || [];
        }

        return result;
    }

    getPhaseHeader(phase: SimulationPhase = this.phase): string {
        switch (phase) {
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

    formatWinnerAnnouncement(winner: Player): string[] {
        return [
            ``,
            `=== VICTORY ===`,
            ``,
            `Ladies and gentlemen, the winner of the this year's Hunger Games...`,
            ``,
            `${winner.name.toUpperCase()} FROM DISTRICT ${winner.district}!`,
            ``,
            `Kills: ${winner.kills}`,
            `Days Survived: ${this.totalDays || this.day}`,
            ``
        ];
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
        this.day = 1;
        this.phase = 'cornucopia';
        this.gameOver = false;
        this.winner = null;
        this.eventGenerator = new EventGenerator(this.players, this);
    }

    // Force end game (for testing or emergency)
    forceEndGame(): void {
        const alive = this.players.filter(p => p.isAlive);
        if (alive.length > 0) {
            this.gameOver = true;
            this.winner = alive[0];
        }
    }

    // Get leaderboard of top killers
    getLeaderboard(): LeaderboardEntry[] {
        return this.players
            .filter(p => p.kills > 0)
            .sort((a, b) => b.kills - a.kills)
            .slice(0, 5)
            .map(p => ({
                name: p.name,
                district: p.district,
                kills: p.kills,
                isAlive: p.isAlive
            }));
    }

    // Get survival statistics
    getSurvivalStats(): SurvivalStats {
        const alive = this.players.filter(p => p.isAlive);
        const dead = this.players.filter(p => !p.isAlive);

        const districtStats: { [key: number]: { alive: number; dead: number; total: number } } = {};
        this.players.forEach(player => {
            if (!districtStats[player.district]) {
                districtStats[player.district] = { alive: 0, dead: 0, total: 0 };
            }
            const stats = districtStats[player.district];
            if (stats) {
                stats.total++;
                if (player.isAlive) {
                    stats.alive++;
                } else {
                    stats.dead++;
                }
            }
        });

        return {
            totalAlive: alive.length,
            totalDead: dead.length,
            totalPlayers: this.players.length,
            districtStats: districtStats,
            averageKills: this.players.reduce((sum, p) => sum + p.kills, 0) / this.players.length
        };
    }

    // Get major event configuration for console access
    getMajorEventConfig(): MajorEventConfig {
        return EventGenerator.majorEventConfig;
    }

    // Update major event configuration
    updateMajorEventConfig(config: Partial<MajorEventConfig>): void {
        Object.assign(EventGenerator.majorEventConfig, config);
    }
}

