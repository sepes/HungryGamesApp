// Game Phase Types
export type GamePhase = 'setup' | 'simulation' | 'winner';
export type SimulationPhase = 'prologue' | 'cornucopia' | 'day' | 'night' | 'fallen' | 'victory' | 'epilogue';

// Item Types
export interface Item {
  name: string;
}

// Player/Tribute Types
export interface Player {
  id: string;
  name: string;
  district: number;
  isAlive: boolean;
  kills: number;
  diedInPhase: SimulationPhase | null;
  diedOnDay: number | null;
  /** Order of elimination within this game (1 = first death). */
  deathPlace?: number | null;
  inventory?: Item[];
  alliances?: string[];
  /** Cumulative damage (0–100). Death when total reaches 100. */
  damage?: number;
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
  winners: Player[];
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
