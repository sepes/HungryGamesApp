import type { Player } from '../types/game.types';

// Terrain Types
export type TerrainType = 
  | 'forest' 
  | 'forest_oak' 
  | 'forest_pine' 
  | 'forest_rainforest' 
  | 'forest_mixed'
  | 'river' 
  | 'lake' 
  | 'lake_islands'
  | 'mountain' 
  | 'desert' 
  | 'plains' 
  | 'hills';

// Arena State
export interface Arena {
  terrains: Set<TerrainType>;
  forestType?: 'oak' | 'pine' | 'rainforest' | 'mixed';
  hasIslands: boolean;
}

// Action Types
export type ActionType = 'solo' | 'versus' | 'group';
export type ActionPhase = 'prologue' | 'cornucopia' | 'day' | 'night' | 'any';

// Action Definition
export interface Action {
  id: string;
  type: ActionType;
  phase: ActionPhase;
  terrainRequired?: TerrainType[];  // Arena must have ALL listed terrains
  deathChance: number;              // 0-1, chance this action kills
  templates: string[];              // Narrative variations with placeholders
  // Example templates:
  // "{player} climbs a tree for the night"
  // "{killer} ambushes {victim} from the treetops"
  // "{player1} and {player2} make a bonfire together"
}

// Major Event Definition
export interface MajorEvent {
  id: string;
  terrainRequired?: TerrainType[];  // Arena must have ALL listed terrains
  dayTemplates: string[];           // Templates for day portion
  nightTemplates: string[];         // Templates for night portion
  // Example: "{player} survives the flood by climbing to higher ground"
}

// Resolved Action (action selected and participants assigned)
export interface ResolvedAction {
  action: Action;
  participants: Player[];
  killers?: Player[];
  victims?: Player[];
}

// Game Configuration
export interface GameConfig {
  winnerCount: number;  // Default: 1
}
