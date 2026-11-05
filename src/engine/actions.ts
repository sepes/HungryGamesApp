import type { Action, MajorEvent } from './types';

/**
 * Action Pool
 * 
 * This file defines the structure for actions. Actual action definitions
 * with templates will be added separately later.
 * 
 * Action format:
 * {
 *   id: string,                    // Unique identifier
 *   type: 'solo' | 'versus' | 'group',
 *   phase: 'prologue' | 'cornucopia' | 'day' | 'night' | 'any',
 *   terrainRequired?: TerrainType[], // Arena must have ALL listed terrains
 *   deathChance: number,            // 0-1, chance this action kills
 *   templates: string[]             // Narrative variations
 * }
 * 
 * Template placeholders:
 * - {player} - Solo action participant
 * - {player1}, {player2}, {player3} - Group action participants
 * - {killer} - Single attacker
 * - {killer1}, {killer2}, {killer3} - Multiple attackers
 * - {victim} - Single target
 * - {victim1}, {victim2}, {victim3} - Multiple targets
 * 
 * Example actions (structure only):
 * 
 * {
 *   id: 'climb_tree',
 *   type: 'solo',
 *   phase: 'night',
 *   terrainRequired: ['forest'],
 *   deathChance: 0.0,
 *   templates: [
 *     "{player} climbs a tree for the night",
 *     "{player} finds shelter in the branches"
 *   ]
 * },
 * {
 *   id: 'make_bonfire',
 *   type: 'solo',
 *   phase: 'night',
 *   terrainRequired: ['forest'],
 *   deathChance: 0.0,
 *   templates: [
 *     "{player} makes a bonfire to stay warm",
 *     "{player} lights a fire for comfort"
 *   ]
 * },
 * {
 *   id: 'fish_river',
 *   type: 'solo',
 *   phase: 'day',
 *   terrainRequired: ['river'],
 *   deathChance: 0.0,
 *   templates: [
 *     "{player} fishes in the river",
 *     "{player} catches fish from the stream"
 *   ]
 * },
 * {
 *   id: 'ambush_waterfall',
 *   type: 'versus',
 *   phase: 'day',
 *   terrainRequired: ['mountain', 'river'],
 *   deathChance: 0.3,
 *   templates: [
 *     "{killer} ambushes {victim} at the waterfall",
 *     "{killer} strikes {victim} near the cascading water"
 *   ]
 * }
 */

// Action pool - empty for now, will be populated later
export const actionPool: Action[] = [
  // TODO: Add actual action definitions with templates
];

/**
 * Get actions available for a specific phase
 */
export function getActionsForPhase(phase: string): Action[] {
  return actionPool.filter(action => 
    action.phase === phase || action.phase === 'any'
  );
}

/**
 * Major Events Pool
 * 
 * Major events can replace a full Day/Night loop.
 * Structure only - no templates generated yet.
 * 
 * Example structure:
 * {
 *   id: 'flood',
 *   terrainRequired: ['river', 'plains'],
 *   dayTemplates: [
 *     "The river overflows its banks...",
 *     "{player} struggles against the rising water"
 *   ],
 *   nightTemplates: [
 *     "The floodwaters recede...",
 *     "{player} finds higher ground"
 *   ]
 * }
 */

// Major events pool - empty for now
export const majorEventPool: MajorEvent[] = [
  // TODO: Add actual major event definitions with templates
];
