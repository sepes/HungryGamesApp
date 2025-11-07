import { MajorEventConfig } from './game.types';

declare global {
  interface Window {
    HungryGames?: {
      majorEventConfig: MajorEventConfig;
      updateMajorEventConfig: (config: Partial<MajorEventConfig>) => void;
    };
  }
}

export {};

