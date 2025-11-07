import type { GamePhase, Player, FallenTributeData, SimulationPhase } from './game.types';
import type { GameEngine } from '../engine/gameEngine';

// App Component Props
export interface AppProps {}

// Setup Screen Props
export interface SetupScreenProps {
  onStart: (players: Player[]) => void;
  onOpenVolunteers: (tributeCount: number) => void;
  seConnected?: boolean;
  seChannelName?: string;
  onTributeConfigUpdate?: boolean;
}

// Volunteer Screen Props
export interface VolunteerScreenProps {
  volunteers: string[];
  maxSlots: number;
  onStartGame: () => void;
  onCancel: () => void;
  channelName: string;
}

// Simulation Screen Props
export interface SimulationScreenProps {
  events: string[];
  onNext: () => void;
  gameEngine: GameEngine | null;
  currentPhase: SimulationPhase;
  showVictoryButton: boolean;
  onShowVictory: () => void;
  onResetGame: () => void;
  tributeData: FallenTributeData[] | null;
}

// Winner Screen Props
export interface WinnerScreenProps {
  winner: Player;
  eventHistory: string[][];
  gameEngine: GameEngine | null;
  onReset: () => void;
}

// Settings Panel Props
export interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onResetGame: () => void;
  gameEngine: GameEngine | null;
  gamePhase: GamePhase;
  onNext: () => void;
  onShowVictory: () => void;
  showVictoryButton: boolean;
  seConnected?: boolean;
  seChannelName?: string;
  seUserId?: string;
  onRevokeStreamElements?: () => Promise<void>;
  onReconfigureStreamElements?: () => void;
  enableTributeConfig?: boolean;
}

// Tributes Panel Props
export interface TributesPanelProps {
  gameEngine: GameEngine | null;
  currentPhase: SimulationPhase;
}

// Tribute List Props
export interface TributeListProps {
  tributes: Player[];
  title: string;
  emptyMessage?: string;
  showKills?: boolean;
  sortByKills?: boolean;
}

// Debug Terminal Props
export interface DebugTerminalProps {
  isVisible: boolean;
  onClose: () => void;
}

// History Modal Props
export interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventHistory: string[][];
  gameEngine: GameEngine | null;
}

// StreamElements Setup Props
export interface StreamElementsSetupProps {
  onComplete?: (userId: string, channelName: string) => void;
  isModal?: boolean;
  onClose?: () => void;
}

// Terminal Context Types
export interface TerminalMessage {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: Date;
}

export interface TerminalContextValue {
  terminalOutput: TerminalMessage[];
  isTerminalVisible: boolean;
  addTerminalMessage: (type: TerminalMessage['type'], message: string, timestamp?: Date) => void;
  logError: (message: string) => void;
  logWarning: (message: string) => void;
  logInfo: (message: string) => void;
  clearTerminal: () => void;
  toggleTerminal: () => void;
}

