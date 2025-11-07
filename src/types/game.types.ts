// Game Phase Types
export type GamePhase = 'setup' | 'volunteer-collection' | 'simulation' | 'winner';
export type SimulationPhase = 'cornucopia' | 'day' | 'night' | 'fallen';

// Player/Tribute Types
export interface Player {
  id: string;
  name: string;
  district: number;
  isAlive: boolean;
  kills: number;
  items: Item[];
  diedInPhase: SimulationPhase | null;
  diedOnDay: number | null;
  inventory?: Item[];
  alliances?: string[];
  mentalHealth?: number;
  courage?: number;
  strength?: number;
  cowardice?: number;
}

// Item Types
export interface Item {
  name: string;
  type?: 'weapon' | 'tool' | 'consumable';
  category?: string;
  uses?: number;
  maxUses?: number;
}

// Event Types
export interface GameEvent {
  text: string;
  type?: 'kill' | 'survival' | 'alliance' | 'betrayal' | 'major' | 'item' | 'stat';
  participants?: string[];
  killer?: string;
  victims?: string[];
}

// Tribute Data for Fallen Screen
export interface FallenTributeData {
  name: string;
  district: number | string;
  kills: number;
  diedOnDay?: number;
  diedInPhase: SimulationPhase | 'none' | string;
  isNoFallen?: boolean;
  isEmpty?: boolean;
}

// Game Engine Result Types
export interface GameSegmentResult {
  phase: SimulationPhase | 'winner';
  events: string[];
  winner: Player | null;
  alive: number;
  total: number;
  tributeData?: FallenTributeData[];
}

// Game Statistics
export interface GameStats {
  day: number;
  phase: SimulationPhase;
  aliveCount: number;
  totalCount: number;
  deadCount: number;
  alivePlayers: Player[];
  deadPlayers: Player[];
  gameOver?: boolean;
  winner?: Player | null;
}

export interface SurvivalStats {
  totalAlive: number;
  totalDead: number;
  totalPlayers: number;
  districtStats: {
    [key: number]: {
      alive: number;
      dead: number;
      total: number;
    };
  };
  averageKills: number;
}

export interface LeaderboardEntry {
  name: string;
  district: number;
  kills: number;
  isAlive: boolean;
}

// Major Event Configuration
export interface MajorEventConfig {
  enabled: boolean;
  dayChance: number;
  nightChance: number;
}

// Event Template Types
export interface EventTemplate {
  [key: string]: string[];
}

export interface EffectDefinition {
  type: 'mental_health' | 'courage' | 'strength' | 'cowardice' | 'item_gain' | 'item_loss';
  value?: number;
  reason?: string;
  item?: string;
  uses?: number;
}

export interface MajorEvent {
  name: string;
  announcement: string[];
  effects?: EffectDefinition[];
  survivorActions?: string[];
  deathTemplates?: string[];
  weapon_usage_events?: string[];
  matches_usage?: string[];
  sleeping_bag_usage?: string[];
  backpack_usage?: string[];
  rope_usage?: string[];
  medicine_usage?: string[];
  water_usage?: string[];
  night_vision_usage?: string[];
  ally_killTemplates?: string[];
  player_killTemplates?: string[];
  successful_feast?: string[];
  successful_sponsor?: string[];
}

export interface EventTemplates {
  cornucopia: EventTemplate;
  day: EventTemplate;
  night: EventTemplate;
  special: EventTemplate;
  major_day_events: MajorEvent[];
  major_night_events: MajorEvent[];
}

// Alliance Types
export interface Alliance {
  members: string[];
  formed: number;
  phase: SimulationPhase;
}

