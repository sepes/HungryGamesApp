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
    static majorEventConfig = {
        enabled: true,
        dayChance: 0.08, // 8% chance per day phase
        nightChance: 0.05 // 5% chance per night phase
    };

    constructor(players, gameEngine) {
        this.allPlayers = players;
        this.deadThisRound = [];
        this.usedThisSegment = new Set();
        this.gameEngine = gameEngine;
        this.updateAlivePlayers();
    }

    // Helper functions for stat management
    getPlayerKillProbability(player) {
        let baseChance = 1.0;

        // Weapon bonus
        if (this.hasWeapon(player)) baseChance += 0.5;

        // Night vision glasses bonus (improves kill rate)
        if (this.hasGear(player, 'night_vision')) baseChance += 0.3;

        // Courage bonus
        baseChance += (player.courage / 100) * 0.3;

        // Kill experience bonus
        baseChance += (player.kills || 0) * 0.1;

        // Cowardice penalty
        baseChance -= (player.cowardice / 100) * 0.2;

        return Math.max(0.1, baseChance);
    }

    getPlayerSurvivalProbability(player) {
        let baseChance = 1.0;

        // Gear bonus
        if (this.hasGear(player, 'shelter')) baseChance += 0.3;
        if (this.hasGear(player, 'medicine')) baseChance += 0.2;

        // Night vision glasses bonus (reduces chance to die at night)
        if (this.hasGear(player, 'night_vision')) baseChance += 0.25;

        // Mental health affects survival
        baseChance += (player.mentalHealth / 100) * 0.2;

        // Courage helps in dangerous situations
        baseChance += (player.courage / 100) * 0.1;

        return Math.max(0.1, baseChance);
    }

    hasWeapon(player) {
        return player.inventory.some(item => ['sword', 'knife', 'spear', 'bow', 'axe', 'mace', 'trident', 'dagger', 'sickle', 'machete', 'club'].includes(item.name));
    }

    hasGear(player, type) {
        const gearTypes = {
            'shelter': ['backpack', 'sleeping bag'],
            'medicine': ['medicine', 'bandages', 'iodine'],
            'fire': ['matches'],
            'survival': ['food', 'water', 'rope'],
            'night_vision': ['night-vision glasses']
        };

        const items = gearTypes[type] || [];
        return player.inventory.some(item => items.includes(item.name));
    }

    hasAnyTools(player) {
        const allTools = ['sword', 'knife', 'spear', 'bow', 'axe', 'mace', 'trident', 'dagger', 'sickle', 'machete', 'club', 'rope', 'matches', 'medicine', 'bandages', 'iodine', 'backpack', 'sleeping bag', 'night-vision glasses'];
        return player.inventory.some(item => allTools.includes(item.name));
    }

    getPlayerTools(player) {
        const allTools = ['sword', 'knife', 'spear', 'bow', 'axe', 'mace', 'trident', 'dagger', 'sickle', 'machete', 'club', 'rope', 'matches', 'medicine', 'bandages', 'iodine', 'backpack', 'sleeping bag', 'night-vision glasses'];
        return player.inventory
            .filter(item => allTools.includes(item.name))
            .map(item => item.name);
    }

    consumeItem(player, itemName) {
        const itemIndex = player.inventory.findIndex(item => item.name === itemName);
        if (itemIndex === -1) return false;

        const item = player.inventory[itemIndex];

        // Weapons have infinite uses (100), so don't consume them
        const weapons = ['sword', 'knife', 'spear', 'bow', 'axe', 'mace', 'trident', 'dagger', 'sickle', 'machete', 'club'];
        if (weapons.includes(itemName)) {
            return true; // Weapon used but not consumed
        }

        item.uses--;

        if (item.uses <= 0) {
            player.inventory.splice(itemIndex, 1);
        }

        return true;
    }

    addItemToInventory(player, itemName, uses = 1) {
        // Check inventory limits first
        const tempItem = { name: itemName, uses: uses };
        if (!this.canAddItem(player, tempItem)) {
            return false; // Cannot add item due to limits
        }

        // Check if item already exists
        const existingItem = player.inventory.find(item => item.name === itemName);
        if (existingItem) {
            existingItem.uses = Math.min(existingItem.uses + uses, existingItem.maxUses);
            return true;
        }

        // Determine max uses based on item type
        let maxUses = 1;
        const weapons = ['sword', 'knife', 'spear', 'bow', 'axe', 'mace', 'trident', 'dagger', 'sickle', 'machete', 'club'];
        if (weapons.includes(itemName)) maxUses = 100; // Infinite for all weapons
        else if (['rope', 'matches'].includes(itemName)) maxUses = 5;
        else if (['medicine', 'bandages'].includes(itemName)) maxUses = 3;
        else if (['backpack', 'sleeping bag'].includes(itemName)) maxUses = 100;
        else if (['food', 'water'].includes(itemName)) maxUses = 1;

        player.inventory.push({
            name: itemName,
            uses: Math.min(uses, maxUses),
            maxUses: maxUses
        });
        return true;
    }

    isAlliedWith(player1, player2) {
        return player1.alliances.includes(player2.id) && player2.alliances.includes(player1.id);
    }

    breakAlliance(player1, player2) {
        player1.alliances = player1.alliances.filter(id => id !== player2.id);
        player2.alliances = player2.alliances.filter(id => id !== player1.id);

        // Betrayal mental health penalty
        this.updateMentalHealth(player1, -25, 'betrayal');
        this.updateMentalHealth(player2, -15, 'betrayed');
    }

    updateMentalHealth(player, delta, reason) {
        const oldHealth = player.mentalHealth;
        player.mentalHealth = Math.max(0, Math.min(100, player.mentalHealth + delta));

        // Log significant changes for debugging
        if (Math.abs(delta) >= 10) {
            console.log(`${player.name} mental health: ${oldHealth} -> ${player.mentalHealth} (${reason})`);
        }
    }

    updateCourage(player, delta, reason) {
        const oldCourage = player.courage;
        player.courage = Math.max(0, Math.min(100, player.courage + delta));

        // Courage and cowardice are inversely related
        if (delta > 0) {
            player.cowardice = Math.max(0, player.cowardice - delta * 0.5);
        } else {
            player.cowardice = Math.min(100, player.cowardice - delta * 0.5);
        }

        if (Math.abs(delta) >= 10) {
            console.log(`${player.name} courage: ${oldCourage} -> ${player.courage} (${reason})`);
        }
    }

    // Looting system
    lootPlayer(killer, victim) {
        if (!victim.inventory || victim.inventory.length === 0) return [];

        const victimItems = [...victim.inventory];
        const lootedItems = [];

        for (const item of victimItems) {
            if (this.canAddItem(killer, item)) {
                this.addItemToInventory(killer, item.name, item.uses);
                lootedItems.push(item.name);
            }
        }

        if (lootedItems.length > 0) {
            console.log(`${killer.name} looted: ${lootedItems.join(', ')} from ${victim.name}`);
        }

        return lootedItems;
    }

    // Inventory management with limits
    canAddItem(player, item) {
        const weapons = ['sword', 'knife', 'spear', 'bow', 'axe', 'mace', 'trident', 'dagger', 'sickle', 'machete', 'club'];
        const tools = ['rope', 'matches', 'medicine', 'bandages', 'iodine', 'night-vision glasses'];
        const hasBackpack = player.inventory.some(invItem => invItem.name === 'backpack');

        if (weapons.includes(item.name)) {
            // Max 2 weapons
            const currentWeapons = player.inventory.filter(invItem => weapons.includes(invItem.name));
            return currentWeapons.length < 2;
        } else if (tools.includes(item.name)) {
            if (hasBackpack) {
                // Backpack can hold unlimited tools
                return true;
            } else {
                // Max 1 tool without backpack
                const currentTools = player.inventory.filter(invItem => tools.includes(invItem.name));
                return currentTools.length < 1;
            }
        } else {
            // Other items (food, water, etc.) - unlimited
            return true;
        }
    }

    // Enhanced alliance mechanics
    checkAllianceEndgame() {
        const alivePlayers = this.alivePlayers;

        // Check each player's alliances
        alivePlayers.forEach(player => {
            if (player.alliances && player.alliances.length > 0) {
                const alliedAlive = player.alliances.filter(allyId =>
                    alivePlayers.some(alive => alive.id === allyId)
                );

                // If all alive players are in this alliance, end it
                if (alliedAlive.length === alivePlayers.length - 1) {
                    console.log(`Alliance ended for ${player.name} - only allies remain`);
                    player.alliances = [];
                }
            }
        });
    }

    // Prevent multiple alliances
    formAlliance(player1, player2) {
        // Clear existing alliances first
        player1.alliances = [];
        player2.alliances = [];

        // Form new alliance
        player1.alliances.push(player2.id);
        player2.alliances.push(player1.id);

        // Alliance comfort bonus
        this.updateMentalHealth(player1, 5, 'alliance comfort');
        this.updateMentalHealth(player2, 5, 'alliance comfort');
    }

    // Find all active alliances
    getActiveAlliances() {
        const alliances = [];
        const processed = new Set();

        this.alivePlayers.forEach(player => {
            if (player.alliances && player.alliances.length > 0 && !processed.has(player.id)) {
                const allianceMembers = [player];
                processed.add(player.id);

                // Find all members of this alliance
                player.alliances.forEach(allyId => {
                    const ally = this.alivePlayers.find(p => p.id === allyId);
                    if (ally && !processed.has(ally.id)) {
                        allianceMembers.push(ally);
                        processed.add(ally.id);
                    }
                });

                if (allianceMembers.length > 1) {
                    alliances.push(allianceMembers);
                }
            }
        });

        return alliances;
    }

    updateAlivePlayers() {
        this.alivePlayers = this.allPlayers.filter(p => p.isAlive);
    }

    // Generate bell curve death count for cornucopia: 8-12 deaths out of 24 tributes
    generateCornucopiaDeathCount(totalTributes) {
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

        // Scale to 8-12 deaths range
        // Mean at 10 deaths (middle of 8-12 range)
        // Standard deviation to give good spread within the range
        const mean = 10;
        const stdDev = 1.2; // Smaller std dev for tighter distribution

        let deathCount = mean + (z0 * stdDev);

        // Clamp to 8-12 range
        deathCount = Math.max(8, Math.min(12, Math.round(deathCount)));

        // Ensure we don't exceed the number of alive tributes
        return Math.min(deathCount, totalTributes);
    }

    // Helper method to wrap player names in highlight spans
    highlightPlayerName(name) {
        return `<span class="player-highlight">${name}</span>`;
    }

    generateCornucopiaEvents() {
        this.usedThisSegment.clear();
        const events = [];
        const participants = shuffle([...this.alivePlayers]);

        // Generate bell curve death count between 8-12 out of 24 tributes
        const targetDeaths = this.generateCornucopiaDeathCount(participants.length);
        let deaths = 0;

        events.push("The tributes stand in a circle around the Cornucopia...");
        events.push("The gong sounds. The bloodbath begins!");
        events.push("");

        // First pass: Handle supply grabs and escapes (non-combat actions)
        const combatParticipants = [];
        for (let player of participants) {
            if (!player.isAlive || this.usedThisSegment.has(player.id)) continue;

            const roll = Math.random();

            if (roll < 0.20) {
                // Player grabs supplies
                events.push(this.generateSupplyGrab(player));
                this.usedThisSegment.add(player.id);
            } else if (roll < 0.35) {
                // Player grabs weapon and immediately kills someone
                const victim = this.selectVictim(player);
                if (victim) {
                    events.push(this.generateWeaponGrabKill(player, victim));
                    deaths++;
                } else {
                    // No victim available, just grab supplies
                    events.push(this.generateSupplyGrab(player));
                }
                this.usedThisSegment.add(player.id);
            } else if (roll < 0.45 && this.canFormTeam(player)) {
                // Players team up
                const partner = this.selectPartner(player);
                if (partner) {
                    events.push(this.generateTeamwork(player, partner));
                }
            } else if (roll < 0.55) {
                // Player escapes
                events.push(this.generateEscape(player));
                this.usedThisSegment.add(player.id);
            } else {
                // Player stays for combat
                combatParticipants.push(player);
            }
        }

        // Second pass: Handle combat with updated inventories
        for (let player of combatParticipants) {
            if (!player.isAlive || this.usedThisSegment.has(player.id)) continue;

            if (deaths < targetDeaths) {
                // Player gets killed in combat - prioritize weapon grab kills
                const killer = this.selectKiller(player);
                if (killer) {
                    // Use weapon grab kill instead of regular kill for more dynamic events
                    events.push(this.generateWeaponGrabKill(killer, player));
                    deaths++;
                } else {
                    // If no killer available, find any available player to be the killer
                    const availableKillers = this.alivePlayers.filter(p =>
                        p.id !== player.id && p.isAlive && !this.usedThisSegment.has(p.id)
                    );
                    if (availableKillers.length > 0) {
                        const forcedKiller = availableKillers[Math.floor(Math.random() * availableKillers.length)];
                        events.push(this.generateWeaponGrabKill(forcedKiller, player));
                        deaths++;
                    }
                }
            } else {
                // No more deaths needed, player escapes
                events.push(this.generateEscape(player));
                this.usedThisSegment.add(player.id);
            }
        }

        // Fallback: If we haven't reached target deaths, force more weapon grab kills
        if (deaths < targetDeaths) {
            const remainingParticipants = this.alivePlayers.filter(p =>
                p.isAlive && !this.usedThisSegment.has(p.id)
            );

            const neededDeaths = targetDeaths - deaths;
            const deathsToForce = Math.min(neededDeaths, remainingParticipants.length);

            for (let i = 0; i < deathsToForce; i++) {
                const victim = remainingParticipants[i];
                const killer = this.selectKiller(victim);
                if (killer) {
                    // Force weapon grab kill - prioritize weapon kills over improvised
                    events.push(this.generateWeaponGrabKill(killer, victim));
                    deaths++;
                } else {
                    // If no killer available, find any available player to be the killer
                    const availableKillers = this.alivePlayers.filter(p =>
                        p.id !== victim.id && p.isAlive
                    );
                    if (availableKillers.length > 0) {
                        const forcedKiller = availableKillers[Math.floor(Math.random() * availableKillers.length)];
                        events.push(this.generateWeaponGrabKill(forcedKiller, victim));
                        deaths++;
                    }
                }
            }
        }

        this.updateAlivePlayers();
        this.checkAllianceEndgame();
        return events;
    }

    generateDayEvents() {
        this.usedThisSegment.clear();
        const events = [];
        const participants = shuffle([...this.alivePlayers]);

        // Check for major day event (8% chance)
        if (EventGenerator.majorEventConfig.enabled && Math.random() < EventGenerator.majorEventConfig.dayChance) {
            return this.generateMajorDayEvent();
        }


        // Alliance group events (20% chance if alliances exist)
        const activeAlliances = this.getActiveAlliances();
        if (activeAlliances.length > 0 && Math.random() < 0.20) {
            const alliance = activeAlliances[Math.floor(Math.random() * activeAlliances.length)];
            const eventType = Math.random();

            if (eventType < 0.4) {
                // Alliance hunting
                events.push(this.generateAllianceHunting(alliance));
                events.push("");
            } else if (eventType < 0.7 && activeAlliances.length > 1) {
                // Alliance vs Alliance combat
                const otherAlliances = activeAlliances.filter(a => a !== alliance);
                const targetAlliance = otherAlliances[Math.floor(Math.random() * otherAlliances.length)];
                events.push(this.generateAllianceCombat(alliance, targetAlliance));
                events.push("");
            } else {
                // Alliance victory/consolidation
                events.push(this.generateAllianceVictory(alliance));
                events.push("");
            }
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
                // Positive survival or stat-based events
                if (player.mentalHealth < 20 && Math.random() < 0.3) {
                    events.push(this.generateStatEvent(player, 'mental_breakdown'));
                } else if (player.courage > 70 && Math.random() < 0.2) {
                    events.push(this.generateStatEvent(player, 'courage_events'));
                } else if (player.cowardice > 70 && Math.random() < 0.2) {
                    events.push(this.generateStatEvent(player, 'cowardice_events'));
                } else if (this.hasAnyTools(player) && Math.random() < 0.3) {
                    // Tool usage events for players with tools
                    events.push(this.generateToolUsageEvent(player));
                } else if (!this.hasAnyTools(player) && Math.random() < 0.4) {
                    // Desperation events for players without tools
                    events.push(this.generateDesperationNoTools(player));
                } else {
                    events.push(this.generateSurvival(player, 'positive'));
                }
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
        this.checkAllianceEndgame();
        return events;
    }

    generateNightEvents() {
        this.usedThisSegment.clear();
        const events = [];
        const participants = shuffle([...this.alivePlayers]);

        // Check for major night event (5% chance)
        if (EventGenerator.majorEventConfig.enabled && Math.random() < EventGenerator.majorEventConfig.nightChance) {
            return this.generateMajorNightEvent();
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
                // Survival activities or gear-based events
                if (player.mentalHealth < 20 && Math.random() < 0.4) {
                    events.push(this.generateStatEvent(player, 'suicide_attempts'));
                } else if (this.hasGear(player, 'shelter') && Math.random() < 0.3) {
                    events.push(this.generateStatEvent(player, 'gear_survival'));
                } else if (!this.hasGear(player, 'shelter') && Math.random() < 0.3) {
                    events.push(this.generateStatEvent(player, 'gear_failure'));
                } else if (this.hasAnyTools(player) && Math.random() < 0.25) {
                    // Tool usage events for players with tools
                    events.push(this.generateToolUsageEvent(player));
                } else if (!this.hasAnyTools(player) && Math.random() < 0.35) {
                    // Desperation events for players without tools
                    events.push(this.generateDesperationNoTools(player));
                } else {
                    events.push(this.generateNightSurvival(player));
                }
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
        this.checkAllianceEndgame();
        return events;
    }

    // Helper methods
    selectKiller(victim) {
        const available = this.alivePlayers.filter(p =>
            p.id !== victim.id && !this.usedThisSegment.has(p.id)
        );
        if (available.length === 0) return null;

        // Use weighted selection based on kill probability
        const weights = available.map(player => this.getPlayerKillProbability(player));
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

        if (totalWeight === 0) return available[Math.floor(Math.random() * available.length)];

        let random = Math.random() * totalWeight;
        for (let i = 0; i < available.length; i++) {
            random -= weights[i];
            if (random <= 0) return available[i];
        }

        return available[available.length - 1];
    }

    selectVictim(killer) {
        // Filter out allies unless it's a betrayal scenario
        const available = this.alivePlayers.filter(p => {
            if (p.id === killer.id || this.usedThisSegment.has(p.id)) return false;

            // Check if they're allies - if so, only allow if it's a betrayal
            if (this.isAlliedWith(killer, p)) {
                // Betrayal chance increases with low mental health and desperation
                const betrayalChance = (100 - killer.mentalHealth) / 100 * 0.3;
                return Math.random() < betrayalChance;
            }

            return true;
        });

        if (available.length === 0) return null;

        // Use weighted selection based on survival probability (inverse) and alliance protection
        const weights = available.map(player => {
            let weight = 1.0 / this.getPlayerSurvivalProbability(player);

            // Alliance protection: reduce kill chance against non-allies if killer has allies
            if (killer.alliances && killer.alliances.length > 0 && !this.isAlliedWith(killer, player)) {
                weight *= 0.7; // 30% protection from allies
            }

            return weight;
        });

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

        if (totalWeight === 0) return available[Math.floor(Math.random() * available.length)];

        let random = Math.random() * totalWeight;
        for (let i = 0; i < available.length; i++) {
            random -= weights[i];
            if (random <= 0) return available[i];
        }

        return available[available.length - 1];
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

        // Weight selection based on district - same district has higher chance
        const weights = available.map(partner => {
            let weight = 1.0;
            if (partner.district === player.district) {
                weight = 3.0; // 3x higher chance for same district
            }
            return weight;
        });

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < available.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                const partner = available[i];
                this.usedThisSegment.add(partner.id);
                return partner;
            }
        }

        // Fallback
        const partner = available[available.length - 1];
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
        // Get killer's weapons
        const killerWeapons = killer.inventory.filter(item => ['sword', 'knife', 'spear', 'bow', 'axe', 'mace', 'trident', 'dagger', 'sickle', 'machete', 'club'].includes(item.name));

        let templates, weapon = 'bare hands';

        // Select weapon-specific templates based on killer's inventory
        if (killerWeapons.length > 0) {
            const usedWeapon = killerWeapons[Math.floor(Math.random() * killerWeapons.length)];
            weapon = usedWeapon.name;

            // Map weapon names to template categories
            const weaponTemplateMap = {
                'sword': `${phase}_kills` || 'sword_kills',
                'knife': `${phase}_kills` || 'knife_kills',
                'bow': `${phase}_kills` || 'bow_kills',
                'spear': `${phase}_kills` || 'spear_kills',
                'axe': `${phase}_kills` || 'axe_kills',
                'mace': `${phase}_kills` || 'axe_kills', // Use axe templates for mace
                'trident': `${phase}_kills` || 'spear_kills', // Use spear templates for trident
                'dagger': `${phase}_kills` || 'knife_kills', // Use knife templates for dagger
                'sickle': `${phase}_kills` || 'knife_kills', // Use knife templates for sickle
                'machete': `${phase}_kills` || 'sword_kills', // Use sword templates for machete
                'club': `${phase}_kills` || 'axe_kills' // Use axe templates for club
            };

            const templateKey = weaponTemplateMap[weapon];
            templates = eventTemplates[phase][templateKey];

            // Fallback to generic weapon templates if specific ones don't exist
            if (!templates) {
                // Try multiple weapon-specific variations before falling back to generic
                const weaponVariations = [
                    `${weapon}_${phase}_kills`,
                    `${weapon}_kills`,
                    `${weapon}_combat_kills`,
                    `${weapon}_stealth_kills`
                ];

                for (const variation of weaponVariations) {
                    if (eventTemplates[phase][variation]) {
                        templates = eventTemplates[phase][variation];
                        break;
                    }
                }

                // Only use generic fallback as absolute last resort
                if (!templates) {
                    templates = eventTemplates[phase].kills ||
                        eventTemplates[phase].combat_kills ||
                        eventTemplates[phase].stealth_kills;
                }
            }

            this.consumeItem(killer, weapon);
        } else {
            // No weapons - use bare hands or improvised templates
            if (Math.random() < 0.7) {
                templates = eventTemplates[phase].bare_hands_kills ||
                    eventTemplates[phase][`bare_hands_${phase}_kills`] ||
                    eventTemplates[phase].kills ||
                    eventTemplates[phase].combat_kills ||
                    eventTemplates[phase].stealth_kills;
            } else {
                templates = eventTemplates[phase].improvised_kills ||
                    eventTemplates[phase][`improvised_${phase}_kills`] ||
                    eventTemplates[phase].kills ||
                    eventTemplates[phase].combat_kills ||
                    eventTemplates[phase].stealth_kills;
            }
        }

        const template = templates[Math.floor(Math.random() * templates.length)];

        victim.isAlive = false;
        victim.diedInPhase = phase;
        victim.diedOnDay = this.gameEngine.day;
        killer.kills = (killer.kills || 0) + 1;

        // Loot victim's items
        const lootedItems = this.lootPlayer(killer, victim);

        // Update stats
        this.updateCourage(killer, 10, 'successful kill');
        this.updateMentalHealth(killer, -15, 'killing');
        this.updateMentalHealth(victim, -20, 'death');

        // Check if this was a betrayal
        if (this.isAlliedWith(killer, victim)) {
            this.breakAlliance(killer, victim);
        }

        // Only add to deadThisRound if not already there
        if (!this.deadThisRound.includes(victim)) {
            this.deadThisRound.push(victim);
        }

        this.usedThisSegment.add(victim.id);
        this.usedThisSegment.add(killer.id);

        let result = template
            .replace(/\{killer\}/g, this.highlightPlayerName(killer.name))
            .replace(/\{victim\}/g, this.highlightPlayerName(victim.name))
            .replace(/\{weapon\}/g, weapon);

        // Add looting event if items were looted
        if (lootedItems && lootedItems.length > 0) {
            const lootingTemplates = eventTemplates.cornucopia.looting || eventTemplates.day.looting || eventTemplates.night.looting;
            if (lootingTemplates) {
                const lootingTemplate = lootingTemplates[Math.floor(Math.random() * lootingTemplates.length)];
                result += '\n' + lootingTemplate
                    .replace(/\{killer\}/g, this.highlightPlayerName(killer.name))
                    .replace(/\{victim\}/g, this.highlightPlayerName(victim.name));
            }
        }

        return result;
    }

    generateEscape(player) {
        const templates = eventTemplates.cornucopia.escapes;
        const template = templates[Math.floor(Math.random() * templates.length)];
        const item = items[Math.floor(Math.random() * items.length)];

        if (Math.random() < 0.4) {
            this.addItemToInventory(player, item);
        }

        // Update cowardice for running away
        this.updateCourage(player, -5, 'fleeing');

        return template
            .replace(/\{player\}/g, this.highlightPlayerName(player.name))
            .replace(/\{item\}/g, item);
    }

    generateSupplyGrab(player) {
        const templates = eventTemplates.cornucopia.supplies;
        const template = templates[Math.floor(Math.random() * templates.length)];
        const weapon = weapons[Math.floor(Math.random() * weapons.length)];

        if (Math.random() < 0.6) {
            const item = Math.random() < 0.5 ? weapon : items[Math.floor(Math.random() * items.length)];
            this.addItemToInventory(player, item);
        }

        return template
            .replace(/\{player\}/g, this.highlightPlayerName(player.name))
            .replace(/\{weapon\}/g, weapon);
    }

    generateWeaponGrabKill(killer, victim) {
        // Get a random weapon for the killer
        const weapon = weapons[Math.floor(Math.random() * weapons.length)];

        // Add weapon to killer's inventory
        this.addItemToInventory(killer, weapon);

        // Kill the victim
        victim.isAlive = false;
        victim.diedInPhase = 'cornucopia';
        victim.diedOnDay = this.gameEngine.day;
        killer.kills = (killer.kills || 0) + 1;

        // Loot victim's items
        const lootedItems = this.lootPlayer(killer, victim);

        // Update stats
        this.updateCourage(killer, 10, 'successful kill');
        this.updateMentalHealth(killer, -15, 'killing');
        this.updateMentalHealth(victim, -20, 'death');

        // Check if this was a betrayal
        if (this.isAlliedWith(killer, victim)) {
            this.breakAlliance(killer, victim);
        }

        // Add to deadThisRound if not already there
        if (!this.deadThisRound.includes(victim)) {
            this.deadThisRound.push(victim);
        }

        this.usedThisSegment.add(victim.id);
        this.usedThisSegment.add(killer.id);

        // Generate weapon grab kill event
        const templates = eventTemplates.cornucopia.weapon_grab_kills || eventTemplates.cornucopia.kills;
        const template = templates[Math.floor(Math.random() * templates.length)];

        let result = template
            .replace(/\{killer\}/g, this.highlightPlayerName(killer.name))
            .replace(/\{victim\}/g, this.highlightPlayerName(victim.name))
            .replace(/\{weapon\}/g, weapon);

        // Add looting event if items were looted
        if (lootedItems && lootedItems.length > 0) {
            const lootingTemplates = eventTemplates.cornucopia.looting || eventTemplates.day.looting || eventTemplates.night.looting;
            if (lootingTemplates) {
                const lootingTemplate = lootingTemplates[Math.floor(Math.random() * lootingTemplates.length)];
                result += '\n' + lootingTemplate
                    .replace(/\{killer\}/g, this.highlightPlayerName(killer.name))
                    .replace(/\{victim\}/g, this.highlightPlayerName(victim.name));
            }
        }

        return result;
    }

    generateTeamwork(player1, player2) {
        const templates = eventTemplates.cornucopia.teamwork;
        const template = templates[Math.floor(Math.random() * templates.length)];

        // Form alliance
        this.formAlliance(player1, player2);

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

        // Only add to deadThisRound if not already there
        if (!this.deadThisRound.includes(player)) {
            this.deadThisRound.push(player);
        }

        return template.replace(/\{player\}/g, this.highlightPlayerName(player.name));
    }

    generateSurvival(player, type) {
        const hasTools = this.hasAnyTools(player);
        let key, templates, template;

        if (type === 'positive') {
            key = hasTools ? 'survival_positive_with_tools' : 'survival_positive_without_tools';
            templates = eventTemplates.day[key];
            template = templates[Math.floor(Math.random() * templates.length)];

            // For tool-based events, replace {item} with a random tool from inventory
            if (hasTools && template.includes('{item}')) {
                const playerTools = this.getPlayerTools(player);
                const randomTool = playerTools[Math.floor(Math.random() * playerTools.length)];
                template = template.replace(/\{item\}/g, randomTool);
            }
        } else {
            // Neutral events - now split by tool availability
            key = hasTools ? 'survival_with_tools' : 'survival_without_tools';
            templates = eventTemplates.day[key];
            template = templates[Math.floor(Math.random() * templates.length)];

            // For tool-based events, replace {item} with a random tool from inventory
            if (hasTools && template.includes('{item}')) {
                const playerTools = this.getPlayerTools(player);
                const randomTool = playerTools[Math.floor(Math.random() * playerTools.length)];
                template = template.replace(/\{item\}/g, randomTool);
            }
        }

        // Apply mental health effects based on tool availability
        if (!hasTools) {
            this.updateMentalHealth(player, -2, 'helpless action');
        } else if (type === 'positive') {
            this.updateMentalHealth(player, 1, 'successful tool usage');
        }

        return template.replace(/\{player\}/g, this.highlightPlayerName(player.name));
    }

    generateAlliance(player1, player2) {
        let templates, template;

        // Use district-specific templates if same district
        if (player1.district === player2.district) {
            templates = eventTemplates.day.district_alliances;
            template = templates[Math.floor(Math.random() * templates.length)];
        } else {
            templates = eventTemplates.day.alliances;
            template = templates[Math.floor(Math.random() * templates.length)];
        }

        // Form alliance
        this.formAlliance(player1, player2);

        // Check if this is a food/water sharing event and apply stat effects
        if (template.includes('shares their food') || template.includes('shares food')) {
            // Both players gain strength from sharing food
            player1.strength = Math.min(100, (player1.strength || 0) + 5);
            player2.strength = Math.min(100, (player2.strength || 0) + 5);
            // Mental health boost from sharing
            this.updateMentalHealth(player1, 3, 'sharing food');
            this.updateMentalHealth(player2, 3, 'receiving food');
        } else if ((template.includes('gives') && template.includes('water')) || (template.includes('offers') && template.includes('water'))) {
            // Both players gain strength from sharing water
            player1.strength = Math.min(100, (player1.strength || 0) + 3);
            player2.strength = Math.min(100, (player2.strength || 0) + 3);
            // Mental health boost from sharing
            this.updateMentalHealth(player1, 2, 'sharing water');
            this.updateMentalHealth(player2, 2, 'receiving water');
        } else if (template.includes('tends to') && template.includes('wounds')) {
            // Healing wounds - receiver gains strength, healer gains mental health
            player2.strength = Math.min(100, (player2.strength || 0) + 8);
            this.updateMentalHealth(player1, 4, 'helping ally');
            this.updateMentalHealth(player2, 5, 'being cared for');
        }

        // Replace placeholders
        let result = template
            .replace(/\{player1\}/g, this.highlightPlayerName(player1.name))
            .replace(/\{player2\}/g, this.highlightPlayerName(player2.name));

        // Replace district placeholder if present
        if (template.includes('{district}')) {
            result = result.replace(/\{district\}/g, player1.district);
        }

        return result;
    }

    // Alliance group events
    generateAllianceHunting(allianceMembers) {
        const templates = eventTemplates.day.alliance_hunting;
        const template = templates[Math.floor(Math.random() * templates.length)];

        // Create alliance member names string
        const memberNames = allianceMembers.map(member => this.highlightPlayerName(member.name)).join(', ');

        // Alliance hunting bonus to mental health
        allianceMembers.forEach(member => {
            this.updateMentalHealth(member, 3, 'alliance hunting');
            this.updateCourage(member, 2, 'group activity');
        });

        return template.replace(/\{alliance_members\}/g, memberNames);
    }

    generateAllianceCombat(allianceMembers, targetAlliance) {
        const templates = eventTemplates.day.alliance_combat;
        const template = templates[Math.floor(Math.random() * templates.length)];

        // Create alliance member names string
        const memberNames = allianceMembers.map(member => this.highlightPlayerName(member.name)).join(', ');

        // Combat affects all participants
        [...allianceMembers, ...targetAlliance].forEach(member => {
            this.updateMentalHealth(member, -5, 'alliance combat');
            this.updateCourage(member, 5, 'group combat');
        });

        return template.replace(/\{alliance_members\}/g, memberNames);
    }

    generateAllianceVictory(allianceMembers) {
        const templates = eventTemplates.day.alliance_victory;
        const template = templates[Math.floor(Math.random() * templates.length)];

        // Create alliance member names string
        const memberNames = allianceMembers.map(member => this.highlightPlayerName(member.name)).join(', ');

        // Victory bonus for all alliance members
        allianceMembers.forEach(member => {
            this.updateMentalHealth(member, 8, 'alliance victory');
            this.updateCourage(member, 10, 'victory');
        });

        return template.replace(/\{alliance_members\}/g, memberNames);
    }

    generateNightDeath(player, type) {
        // Night vision glasses reduce chance of night deaths
        if (this.hasGear(player, 'night_vision') && Math.random() < 0.4) {
            // 40% chance to avoid night death with night vision glasses
            return this.generateNightSurvival(player);
        }

        const key = type === 'exposure' ? 'exposure_deaths' : 'mental_deaths';
        const templates = eventTemplates.night[key];
        const template = templates[Math.floor(Math.random() * templates.length)];

        player.isAlive = false;
        player.diedInPhase = 'night';
        player.diedOnDay = this.gameEngine.day;

        // Only add to deadThisRound if not already there
        if (!this.deadThisRound.includes(player)) {
            this.deadThisRound.push(player);
        }

        return template.replace(/\{player\}/g, this.highlightPlayerName(player.name));
    }

    generateNightSurvival(player) {
        const hasTools = this.hasAnyTools(player);
        const key = hasTools ? 'survival_night_with_tools' : 'survival_night_without_tools';
        const templates = eventTemplates.night[key];
        let template = templates[Math.floor(Math.random() * templates.length)];

        // For tool-based events, replace {item} with a random tool from inventory
        if (hasTools && template.includes('{item}')) {
            const playerTools = this.getPlayerTools(player);
            const randomTool = playerTools[Math.floor(Math.random() * playerTools.length)];
            template = template.replace(/\{item\}/g, randomTool);
        }

        // Check if player has proper gear for night survival
        if (this.hasGear(player, 'shelter')) {
            this.updateMentalHealth(player, 2, 'shelter comfort');
        } else {
            this.updateMentalHealth(player, -3, 'exposure');
        }

        // Night vision glasses provide additional benefits at night
        if (this.hasGear(player, 'night_vision')) {
            this.updateMentalHealth(player, 3, 'night vision advantage');
            this.updateCourage(player, 2, 'night vision confidence');
        }

        // Additional mental health penalty for no tools
        if (!hasTools) {
            this.updateMentalHealth(player, -2, 'helpless night survival');
        }

        return template.replace(/\{player\}/g, this.highlightPlayerName(player.name));
    }

    generateEmotional(player) {
        const hasTools = this.hasAnyTools(player);
        const key = hasTools ? 'emotional_with_agency' : 'emotional_without_agency';
        const templates = eventTemplates.night[key];
        let template = templates[Math.floor(Math.random() * templates.length)];

        // For tool-based events, replace {item} with a random tool from inventory
        if (hasTools && template.includes('{item}')) {
            const playerTools = this.getPlayerTools(player);
            const randomTool = playerTools[Math.floor(Math.random() * playerTools.length)];
            template = template.replace(/\{item\}/g, randomTool);
        }

        // Emotional moments affect mental health
        if (player.mentalHealth < 30) {
            this.updateMentalHealth(player, -2, 'emotional breakdown');
        } else {
            this.updateMentalHealth(player, 1, 'emotional release');
        }

        // Additional penalty for no tools
        if (!hasTools) {
            this.updateMentalHealth(player, -1, 'helpless emotional state');
        }

        return template.replace(/\{player\}/g, this.highlightPlayerName(player.name));
    }

    generateBetrayal(killer, victim) {
        const templates = eventTemplates.night.betrayals;
        const template = templates[Math.floor(Math.random() * templates.length)];

        victim.isAlive = false;
        victim.diedInPhase = 'night';
        victim.diedOnDay = this.gameEngine.day;
        killer.kills = (killer.kills || 0) + 1;

        // Betrayal affects stats
        this.breakAlliance(killer, victim);
        this.updateCourage(killer, 5, 'betrayal success');
        this.updateMentalHealth(killer, -20, 'betrayal guilt');

        // Only add to deadThisRound if not already there
        if (!this.deadThisRound.includes(victim)) {
            this.deadThisRound.push(victim);
        }

        this.usedThisSegment.add(victim.id);

        return template
            .replace(/\{killer\}/g, this.highlightPlayerName(killer.name))
            .replace(/\{victim\}/g, this.highlightPlayerName(victim.name));
    }

    generateStatEvent(player, eventType) {
        const hasTools = this.hasAnyTools(player);
        let templates, template;

        // Handle tool-dependent events
        if (eventType === 'mental_breakdown') {
            const key = hasTools ? 'mental_breakdown_with_tools' : 'mental_breakdown_without_tools';
            templates = eventTemplates.day[key];
            template = templates[Math.floor(Math.random() * templates.length)];

            // For tool-based events, replace {item} with a random tool from inventory
            if (hasTools && template.includes('{item}')) {
                const playerTools = this.getPlayerTools(player);
                const randomTool = playerTools[Math.floor(Math.random() * playerTools.length)];
                template = template.replace(/\{item\}/g, randomTool);
            }
        } else if (eventType === 'desperation_events') {
            const key = hasTools ? 'desperation_events' : 'desperation_no_tools';
            templates = eventTemplates.day[key];
            template = templates[Math.floor(Math.random() * templates.length)];

            // For tool-based events, replace {item} with a random tool from inventory
            if (hasTools && template.includes('{item}')) {
                const playerTools = this.getPlayerTools(player);
                const randomTool = playerTools[Math.floor(Math.random() * playerTools.length)];
                template = template.replace(/\{item\}/g, randomTool);
            }
        } else if (eventType === 'courage_events' || eventType === 'cowardice_events') {
            templates = eventTemplates.day[eventType];
            template = templates[Math.floor(Math.random() * templates.length)];

            // For tool-based events, replace {item} with a random tool from inventory
            if (template.includes('{item}')) {
                const playerTools = this.getPlayerTools(player);
                const randomTool = playerTools[Math.floor(Math.random() * playerTools.length)];
                template = template.replace(/\{item\}/g, randomTool);
            }
        } else {
            templates = eventTemplates.day[eventType] || eventTemplates.night[eventType];
            template = templates[Math.floor(Math.random() * templates.length)];
        }

        // Update stats based on event type
        if (eventType === 'mental_breakdown') {
            this.updateMentalHealth(player, -5, 'breakdown');
        } else if (eventType === 'courage_events') {
            this.updateCourage(player, 5, 'bold action');
        } else if (eventType === 'cowardice_events') {
            this.updateCourage(player, -5, 'cowardly behavior');
        } else if (eventType === 'suicide_attempts') {
            this.updateMentalHealth(player, 3, 'fighting suicidal thoughts');
        } else if (eventType === 'gear_survival') {
            this.updateMentalHealth(player, 2, 'gear comfort');
        } else if (eventType === 'gear_failure') {
            this.updateMentalHealth(player, -3, 'gear failure');
        } else if (eventType === 'desperation_events') {
            this.updateMentalHealth(player, -2, 'desperation');
        }

        return template.replace(/\{player\}/g, this.highlightPlayerName(player.name));
    }

    // Generate item-specific events
    generateItemEvent(player, itemName) {
        const itemEventMap = {
            'rope': 'rope_usage',
            'matches': 'matches_usage',
            'medicine': 'medicine_usage',
            'food': 'food_usage',
            'water': 'water_usage',
            'backpack': 'backpack_usage',
            'sleeping bag': 'sleeping_bag_usage'
        };

        const eventType = itemEventMap[itemName];
        if (!eventType) return null;

        const templates = eventTemplates.cornucopia[eventType] || eventTemplates.day[eventType] || eventTemplates.night[eventType];
        if (!templates) return null;

        const template = templates[Math.floor(Math.random() * templates.length)];

        // Consume the item
        this.consumeItem(player, itemName);

        return template.replace(/\{player\}/g, this.highlightPlayerName(player.name));
    }

    // Generate tool usage events
    generateToolUsageEvent(player) {
        let templates, template;

        // Check if player has night vision glasses for special events
        if (this.hasGear(player, 'night_vision') && Math.random() < 0.3) {
            templates = eventTemplates.night.night_vision_events;
            template = templates[Math.floor(Math.random() * templates.length)];

            // Night vision events don't consume the glasses
            this.updateMentalHealth(player, 3, 'night vision advantage');
            this.updateCourage(player, 2, 'night vision confidence');

            return template.replace(/\{player\}/g, this.highlightPlayerName(player.name));
        } else {
            templates = eventTemplates.day.tool_usage_events;
            template = templates[Math.floor(Math.random() * templates.length)];

            // Get a random tool from player's inventory
            const playerTools = this.getPlayerTools(player);
            const randomTool = playerTools[Math.floor(Math.random() * playerTools.length)];

            // Consume the tool (if it's not a weapon)
            const weapons = ['sword', 'knife', 'spear', 'bow', 'axe', 'mace', 'trident', 'dagger', 'sickle', 'machete', 'club'];
            if (!weapons.includes(randomTool)) {
                this.consumeItem(player, randomTool);
            }

            // Mental health bonus for using tools effectively
            this.updateMentalHealth(player, 2, 'effective tool usage');

            return template
                .replace(/\{player\}/g, this.highlightPlayerName(player.name))
                .replace(/\{item\}/g, randomTool);
        }
    }

    // Generate desperation events for players without tools
    generateDesperationNoTools(player) {
        const templates = eventTemplates.day.desperation_no_tools;
        const template = templates[Math.floor(Math.random() * templates.length)];

        // Mental health penalty for desperate actions
        this.updateMentalHealth(player, -3, 'desperate no-tool action');

        return template.replace(/\{player\}/g, this.highlightPlayerName(player.name));
    }


    // Major event generation methods
    generateMajorDayEvent() {
        this.usedThisSegment.clear();
        const events = [];

        // Get available day events from templates
        const availableEvents = eventTemplates.major_day_events;

        if (availableEvents.length === 0) {
            // Fallback to regular day events if no major events configured
            return this.generateDayEvents();
        }

        const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];

        // Add announcement
        if (event.announcement && Array.isArray(event.announcement)) {
            events.push(...event.announcement);
        } else if (event.announcement) {
            events.push(event.announcement);
        }
        events.push("");

        // Use existing target death system (same as cornucopia)
        const targetDeaths = this.generateCornucopiaDeathCount(this.alivePlayers.length);

        // Select victims and generate death events
        const victims = this.selectEventVictims(targetDeaths);
        for (const victim of victims) {
            events.push(this.generateEventDeath(victim, event));
        }

        // Generate survivor actions
        const survivors = this.alivePlayers.filter(p => p.isAlive && !this.usedThisSegment.has(p.id));
        for (const survivor of survivors) {
            events.push(this.generateEventSurvivalAction(survivor, event));
        }

        this.updateAlivePlayers();
        this.checkAllianceEndgame();
        return events;
    }

    generateMajorNightEvent() {
        this.usedThisSegment.clear();
        const events = [];

        // Get available night events from templates
        const availableEvents = eventTemplates.major_night_events;

        if (availableEvents.length === 0) {
            // Fallback to regular night events if no major events configured
            return this.generateNightEvents();
        }

        const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];

        // Add announcement
        if (event.announcement && Array.isArray(event.announcement)) {
            events.push(...event.announcement);
        } else if (event.announcement) {
            events.push(event.announcement);
        }
        events.push("");

        // Use existing target death system (same as cornucopia)
        const targetDeaths = this.generateCornucopiaDeathCount(this.alivePlayers.length);

        // Select victims and generate death events
        const victims = this.selectEventVictims(targetDeaths);
        for (const victim of victims) {
            events.push(this.generateEventDeath(victim, event));
        }

        // Generate survivor actions
        const survivors = this.alivePlayers.filter(p => p.isAlive && !this.usedThisSegment.has(p.id));
        for (const survivor of survivors) {
            events.push(this.generateEventSurvivalAction(survivor, event));
        }

        this.updateAlivePlayers();
        this.checkAllianceEndgame();
        return events;
    }

    selectEventVictims(count) {
        const available = this.alivePlayers.filter(p => !this.usedThisSegment.has(p.id));
        if (available.length === 0 || count <= 0) return [];

        // Use weighted selection based on survival probability (inverse)
        const weights = available.map(player => 1.0 / this.getPlayerSurvivalProbability(player));
        let totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

        const victims = [];
        for (let i = 0; i < count && available.length > 0; i++) {
            let random = Math.random() * totalWeight;
            let selectedIndex = 0;

            for (let j = 0; j < available.length; j++) {
                random -= weights[j];
                if (random <= 0) {
                    selectedIndex = j;
                    break;
                }
            }

            const victim = available[selectedIndex];
            victims.push(victim);
            this.usedThisSegment.add(victim.id);

            // Remove from available and recalculate weights
            available.splice(selectedIndex, 1);
            weights.splice(selectedIndex, 1);
            totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        }

        return victims;
    }

    generateEventDeath(victim, event) {
        victim.isAlive = false;
        victim.diedInPhase = event.name || 'major_event';
        victim.diedOnDay = this.gameEngine.day;

        // Add to deadThisRound if not already there
        if (!this.deadThisRound.includes(victim)) {
            this.deadThisRound.push(victim);
        }

        // Generate death text based on event type
        const deathTemplates = event.deathTemplates || [
            "{player} falls victim to the {event_name}",
            "{player} is overwhelmed by the {event_name}",
            "{player} cannot survive the {event_name}"
        ];

        const template = deathTemplates[Math.floor(Math.random() * deathTemplates.length)];
        return template
            .replace(/\{player\}/g, this.highlightPlayerName(victim.name))
            .replace(/\{event_name\}/g, event.name || 'major event');
    }

    generateEventSurvivalAction(survivor, event) {
        this.usedThisSegment.add(survivor.id);

        // Apply event effects to survivor
        this.applyEventEffects(survivor, event);

        // Generate survival action text
        const actionTemplates = event.survivorActions || [
            "{player} manages to survive the {event_name}",
            "{player} finds a way to endure the {event_name}",
            "{player} escapes the worst of the {event_name}"
        ];

        const template = actionTemplates[Math.floor(Math.random() * actionTemplates.length)];
        return template
            .replace(/\{player\}/g, this.highlightPlayerName(survivor.name))
            .replace(/\{event_name\}/g, event.name || 'major event');
    }

    applyEventEffects(player, event) {
        if (!event.effects) return;

        for (const effect of event.effects) {
            switch (effect.type) {
                case 'mental_health':
                    this.updateMentalHealth(player, effect.value || 0, effect.reason || 'major event');
                    break;
                case 'courage':
                    this.updateCourage(player, effect.value || 0, effect.reason || 'major event');
                    break;
                case 'strength':
                    player.strength = Math.max(0, Math.min(100, (player.strength || 0) + (effect.value || 0)));
                    break;
                case 'item_gain':
                    if (effect.item) {
                        this.addItemToInventory(player, effect.item, effect.uses || 1);
                    }
                    break;
                case 'item_loss':
                    if (effect.item) {
                        this.consumeItem(player, effect.item);
                    }
                    break;
                default:
                    // Unknown effect type, ignore
                    break;
            }
        }
    }

    formatFallenTributes() {
        if (this.deadThisRound.length === 0) {
            return ["No cannon fires tonight. Everyone survived another day."];
        }

        const lines = [`${this.deadThisRound.length} cannon shot${this.deadThisRound.length > 1 ? 's' : ''} can be heard in the distance.`, ""];
        lines.push("Fallen Tributes:");
        this.deadThisRound.forEach(p => {
            lines.push(`  • ${this.highlightPlayerName(p.name)} - District ${p.district}`);
        });

        return lines;
    }

    getFallenTributeData() {
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

        // Add empty first item
        return [
            { name: "", district: "", kills: 0, diedInPhase: "none", isNoFallen: false, isEmpty: true },
            ...tributeData
        ];
    }
}