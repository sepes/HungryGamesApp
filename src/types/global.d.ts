declare global {
  interface Window {
    HungryGames?: {
      getConfig: () => { winnerCount: number };
      setWinnerCount: (count: number) => void;
    };
  }
}

export {};

