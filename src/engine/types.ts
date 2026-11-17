// Terrain Types
export type TerrainType =
  | 'forest'
  | 'river'
  | 'lake'
  | 'islands'
  | 'mountain'
  | 'desert'
  | 'plains'
  | 'hills'
  | 'no_terrain';

// Arena State
export interface Arena {
  terrains: Set<TerrainType>;
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
  terrainRequired?: TerrainType[];
  /** Added to each target's tracked damage (integer 0–100; death at >= 100). May be negative. */
  damageDelta: number;
  /** Relative selection weight multiplier (default: 1). */
  chanceMultiplier?: number;
  templates: string[];
  /** If set, participant(s) must have this item in inventory to trigger the action. */
  requiredItem?: string;
  /** Group only: if true, at least one participant must have requiredItem. */
  groupGateAnyParticipant?: boolean;
  /** If set, give this item to participants (solo/group) or killer (versus) when action resolves. */
  giveItem?: string;
}

// Major Event Definition
export interface MajorEvent {
  id: string;
  terrainRequired?: TerrainType[];
  dayTemplates: string[];
  nightTemplates: string[];
}

// Game Configuration
export interface GameConfig {
  winnerCount: number;
}
