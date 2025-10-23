import { eventTemplates, weapons, items } from './eventTemplates';

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export class EventGenerator {
    constructor(players, gameEngine) {
        this.allPlayers = players;
        this.deadThisRound = [];
        this.usedThisSegment = new Set();
        this.gameEngine = gameEngine;
        this.updateAlivePlayers();
    }

    updateAlivePlayers() {
        this.alivePlayers = this.allPlayers.filter(p => p.isAlive);
    }

    // Helper method to wrap player names in highlight spans
    highlightPlayerName(name) {
        return `<span class="player-highlight">${name}</span>`;
    }

    generateCornucopiaEvents() {
        this.usedThisSegment.clear();
        const events = [];
        const participants = shuffle([...this.alivePlayers]);

        // 30-45% should die in bloodbath
        const targetDeaths = Math.floor(participants.length * (0.3 + Math.random() * 0.15));
        let deaths = 0;

        events.push("The tributes stand in a circle around the Cornucopia...");
        events.push("The gong sounds. The bloodbath begins!");
        events.push("");

        // Process each player
        for (let player of participants) {
            if (!player.isAlive || this.usedThisSegment.has(player.id)) continue;

            const roll = Math.random();

            if (roll < 0.25 && deaths < targetDeaths) {
                // Player gets killed
                const killer = this.selectKiller(player);
                if (killer) {
                    events.push(this.generateKill(killer, player, 'cornucopia'));
                    deaths++;
                }
            } else if (roll < 0.45) {
                // Player grabs supplies
                events.push(this.generateSupplyGrab(player));
                this.usedThisSegment.add(player.id);
            } else if (roll < 0.55 && this.canFormTeam(player)) {
                // Players team up
                const partner = this.selectPartner(player);
                if (partner) {
                    events.push(this.generateTeamwork(player, partner));
                }
            } else {
                // Player escapes
                events.push(this.generateEscape(player));
                this.usedThisSegment.add(player.id);
            }
        }

        this.updateAlivePlayers();
        return events;
    }

    generateDayEvents() {
        this.usedThisSegment.clear();
        const events = [];
        const participants = shuffle([...this.alivePlayers]);

        // Occasional special event (15% chance)
        if (Math.random() < 0.15) {
            events.push(this.generateSpecialEvent());
            events.push("");
        }

        // Every player does something
        for (let player of participants) {
            if (!player.isAlive || this.usedThisSegment.has(player.id)) continue;

            const roll = Math.random();

            if (roll < 0.15 && this.canKill()) {
                // Combat death
                const victim = this.selectVictim(player);
                if (victim) {
                    events.push(this.generateKill(player, victim, 'day'));
                }
            } else if (roll < 0.25 && this.canDie()) {
                // Accidental death
                events.push(this.generateAccidentalDeath(player));
            } else if (roll < 0.50) {
                // Positive survival
                events.push(this.generateSurvival(player, 'positive'));
                this.usedThisSegment.add(player.id);
            } else if (roll < 0.65 && this.canFormTeam(player)) {
                // Alliance activity
                const partner = this.selectPartner(player);
                if (partner) {
                    events.push(this.generateAlliance(player, partner));
                } else {
                    // If no partner available, do neutral activity
                    events.push(this.generateSurvival(player, 'neutral'));
                    this.usedThisSegment.add(player.id);
                }
            } else {
                // Neutral activity
                events.push(this.generateSurvival(player, 'neutral'));
                this.usedThisSegment.add(player.id);
            }
        }

        this.updateAlivePlayers();
        return events;
    }

    generateNightEvents() {
        this.usedThisSegment.clear();
        const events = [];
        const participants = shuffle([...this.alivePlayers]);

        // Occasional special event (10% chance, less than day)
        if (Math.random() < 0.10) {
            events.push(this.generateSpecialEvent());
            events.push("");
        }

        // Every player does something
        for (let player of participants) {
            if (!player.isAlive || this.usedThisSegment.has(player.id)) continue;

            const roll = Math.random();

            if (roll < 0.12 && this.canKill()) {
                // Stealth kill
                const victim = this.selectVictim(player);
                if (victim) {
                    events.push(this.generateKill(player, victim, 'night'));
                }
            } else if (roll < 0.20 && this.canDie()) {
                // Death from exposure/mental
                const deathType = Math.random() < 0.6 ? 'exposure' : 'mental';
                events.push(this.generateNightDeath(player, deathType));
            } else if (roll < 0.40) {
                // Survival activities
                events.push(this.generateNightSurvival(player));
                this.usedThisSegment.add(player.id);
            } else if (roll < 0.55 && this.canKill()) {
                // Betrayal
                const victim = this.selectAlly(player);
                if (victim) {
                    events.push(this.generateBetrayal(player, victim));
                } else {
                    // If no victim available, do emotional moment
                    events.push(this.generateEmotional(player));
                    this.usedThisSegment.add(player.id);
                }
            } else {
                // Emotional moments
                events.push(this.generateEmotional(player));
                this.usedThisSegment.add(player.id);
            }
        }

        this.updateAlivePlayers();
        return events;
    }

    // Helper methods
    selectKiller(victim) {
        const available = this.alivePlayers.filter(p =>
            p.id !== victim.id && !this.usedThisSegment.has(p.id)
        );
        if (available.length === 0) return null;
        return available[Math.floor(Math.random() * available.length)];
    }

    selectVictim(killer) {
        const available = this.alivePlayers.filter(p =>
            p.id !== killer.id && !this.usedThisSegment.has(p.id)
        );
        if (available.length === 0) return null;
        return available[Math.floor(Math.random() * available.length)];
    }

    selectRandomPlayer() {
        const available = this.alivePlayers.filter(p => !this.usedThisSegment.has(p.id));
        if (available.length === 0) return null;
        const player = available[Math.floor(Math.random() * available.length)];
        this.usedThisSegment.add(player.id);
        return player;
    }

    selectPartner(player) {
        const available = this.alivePlayers.filter(p =>
            p.id !== player.id && !this.usedThisSegment.has(p.id)
        );
        if (available.length === 0) return null;
        const partner = available[Math.floor(Math.random() * available.length)];
        this.usedThisSegment.add(partner.id);
        return partner;
    }

    selectAlly(player) {
        return this.selectVictim(player);
    }

    canKill() {
        return this.alivePlayers.length > 2;
    }

    canDie() {
        return this.alivePlayers.length > 2;
    }

    canFormTeam(player) {
        const available = this.alivePlayers.filter(p =>
            p.id !== player.id && !this.usedThisSegment.has(p.id)
        );
        return available.length > 0;
    }

    // Event generation methods
    generateKill(killer, victim, phase) {
        const templates = eventTemplates[phase].kills || eventTemplates[phase].combat_kills || eventTemplates[phase].stealth_kills;
        const template = templates[Math.floor(Math.random() * templates.length)];
        const weapon = weapons[Math.floor(Math.random() * weapons.length)];

        victim.isAlive = false;
        victim.diedInPhase = phase;
        victim.diedOnDay = this.gameEngine.day;
        killer.kills = (killer.kills || 0) + 1;
        this.deadThisRound.push(victim);
        this.usedThisSegment.add(victim.id);
        this.usedThisSegment.add(killer.id);

        return template
            .replace(/\{killer\}/g, this.highlightPlayerName(killer.name))
            .replace(/\{victim\}/g, this.highlightPlayerName(victim.name))
            .replace(/\{weapon\}/g, weapon);
    }

    generateEscape(player) {
        const templates = eventTemplates.cornucopia.escapes;
        const template = templates[Math.floor(Math.random() * templates.length)];
        const item = items[Math.floor(Math.random() * items.length)];

        if (Math.random() < 0.4) {
            player.items = player.items || [];
            player.items.push(item);
        }

        return template
            .replace(/\{player\}/g, this.highlightPlayerName(player.name))
            .replace(/\{item\}/g, item);
    }

    generateSupplyGrab(player) {
        const templates = eventTemplates.cornucopia.supplies;
        const template = templates[Math.floor(Math.random() * templates.length)];
        const weapon = weapons[Math.floor(Math.random() * weapons.length)];

        if (Math.random() < 0.6) {
            player.items = player.items || [];
            const item = Math.random() < 0.5 ? weapon : items[Math.floor(Math.random() * items.length)];
            player.items.push(item);
        }

        return template
            .replace(/\{player\}/g, this.highlightPlayerName(player.name))
            .replace(/\{weapon\}/g, weapon);
    }

    generateTeamwork(player1, player2) {
        const templates = eventTemplates.cornucopia.teamwork;
        const template = templates[Math.floor(Math.random() * templates.length)];

        return template
            .replace(/\{player1\}/g, this.highlightPlayerName(player1.name))
            .replace(/\{player2\}/g, this.highlightPlayerName(player2.name));
    }

    generateAccidentalDeath(player) {
        const templates = eventTemplates.day.accidental_deaths;
        const template = templates[Math.floor(Math.random() * templates.length)];

        player.isAlive = false;
        player.diedInPhase = 'day';
        player.diedOnDay = this.gameEngine.day;
        this.deadThisRound.push(player);

        return template.replace(/\{player\}/g, this.highlightPlayerName(player.name));
    }

    generateSurvival(player, type) {
        const key = type === 'positive' ? 'survival_positive' : 'survival_neutral';
        const templates = eventTemplates.day[key];
        const template = templates[Math.floor(Math.random() * templates.length)];

        return template.replace(/\{player\}/g, this.highlightPlayerName(player.name));
    }

    generateAlliance(player1, player2) {
        const templates = eventTemplates.day.alliances;
        const template = templates[Math.floor(Math.random() * templates.length)];

        return template
            .replace(/\{player1\}/g, this.highlightPlayerName(player1.name))
            .replace(/\{player2\}/g, this.highlightPlayerName(player2.name));
    }

    generateNightDeath(player, type) {
        const key = type === 'exposure' ? 'exposure_deaths' : 'mental_deaths';
        const templates = eventTemplates.night[key];
        const template = templates[Math.floor(Math.random() * templates.length)];

        player.isAlive = false;
        player.diedInPhase = 'night';
        player.diedOnDay = this.gameEngine.day;
        this.deadThisRound.push(player);

        return template.replace(/\{player\}/g, this.highlightPlayerName(player.name));
    }

    generateNightSurvival(player) {
        const templates = eventTemplates.night.survival_night;
        const template = templates[Math.floor(Math.random() * templates.length)];

        return template.replace(/\{player\}/g, this.highlightPlayerName(player.name));
    }

    generateEmotional(player) {
        const templates = eventTemplates.night.emotional;
        const template = templates[Math.floor(Math.random() * templates.length)];

        return template.replace(/\{player\}/g, this.highlightPlayerName(player.name));
    }

    generateBetrayal(killer, victim) {
        const templates = eventTemplates.night.betrayals;
        const template = templates[Math.floor(Math.random() * templates.length)];

        victim.isAlive = false;
        victim.diedInPhase = 'night';
        victim.diedOnDay = this.gameEngine.day;
        killer.kills = (killer.kills || 0) + 1;
        this.deadThisRound.push(victim);
        this.usedThisSegment.add(victim.id);

        return template
            .replace(/\{killer\}/g, this.highlightPlayerName(killer.name))
            .replace(/\{victim\}/g, this.highlightPlayerName(victim.name));
    }

    generateSpecialEvent() {
        const type = Math.random() < 0.5 ? 'environmental' : 'gamemaker';
        const templates = eventTemplates.special_events[type];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    formatFallenTributes() {
        if (this.deadThisRound.length === 0) {
            return ["No cannon fires tonight. Everyone survived another day."];
        }

        const lines = [`${this.deadThisRound.length} cannon shot${this.deadThisRound.length > 1 ? 's' : ''} can be heard in the distance.`, ""];
        lines.push("Fallen Tributes:");
        this.deadThisRound.forEach(p => {
            lines.push(`  • ${p.name} - District ${p.district}`);
        });

        return lines;
    }
}