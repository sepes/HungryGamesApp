import { EventGenerator } from './eventGenerator.js';

export class GameEngine {
    constructor(players) {
        this.players = players;
        this.day = 1;
        this.phase = 'cornucopia';
        this.eventGenerator = new EventGenerator(players);
        this.totalDays = 0;
    }

    nextSegment() {
        let events = [];
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
            this.totalDays = this.day;
            return {
                phase: 'winner',
                events: this.formatWinnerAnnouncement(alive[0]),
                winner: alive[0],
                alive: 1,
                total: this.players.length
            };
        }

        // Prevent infinite games - if only 2 left and it's been many days, force confrontation
        if (alive.length === 2 && this.day > 10) {
            const [p1, p2] = alive;
            const winner = Math.random() < 0.5 ? p1 : p2;
            const loser = winner === p1 ? p2 : p1;
            loser.isAlive = false;
            winner.kills++;

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
        return {
            phase: currentPhase, // Return current phase, not next phase
            events: header ? [header, '', ...events] : events,
            winner: null,
            alive: alive.length,
            total: this.players.length
        };
    }

    getPhaseHeader(phase = this.phase) {
        const alive = this.players.filter(p => p.isAlive).length;
        const total = this.players.length;

        switch (phase) {
            case 'cornucopia':
                return `=== THE 74TH HUNGER GAMES ===\n\nThe gong sounds. Let the games begin!\n\nTributes: ${alive}/${total}`;
            case 'day':
                return `=== Day ${this.day} ===\n\nThe sun rises over the arena.\n\nTributes remaining: ${alive}/${total}`;
            case 'night':
                return `=== Day ${this.day} - Night Falls ===\n\nDarkness blankets the arena.\n\nTributes remaining: ${alive}/${total}`;
            case 'fallen':
                return `=== Fallen Tributes ===`;
            default:
                return '';
        }
    }

    formatWinnerAnnouncement(winner) {
        return [
            ``,
            `=== VICTORY ===`,
            ``,
            `Ladies and gentlemen, the winner of the 74th Hunger Games...`,
            ``,
            `${winner.name.toUpperCase()} FROM DISTRICT ${winner.district}!`,
            ``,
            `Kills: ${winner.kills}`,
            `Days Survived: ${this.totalDays || this.day}`,
            ``
        ];
    }

    getGameStats() {
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

    reset() {
        this.day = 1;
        this.phase = 'cornucopia';
        this.gameOver = false;
        this.winner = null;
        this.eventGenerator = new EventGenerator(this.players);
    }

    // Force end game (for testing or emergency)
    forceEndGame() {
        const alive = this.players.filter(p => p.isAlive);
        if (alive.length > 0) {
            this.gameOver = true;
            this.winner = alive[0];
        }
    }

    // Get leaderboard of top killers
    getLeaderboard() {
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
    getSurvivalStats() {
        const alive = this.players.filter(p => p.isAlive);
        const dead = this.players.filter(p => !p.isAlive);

        const districtStats = {};
        this.players.forEach(player => {
            if (!districtStats[player.district]) {
                districtStats[player.district] = { alive: 0, dead: 0, total: 0 };
            }
            districtStats[player.district].total++;
            if (player.isAlive) {
                districtStats[player.district].alive++;
            } else {
                districtStats[player.district].dead++;
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
}