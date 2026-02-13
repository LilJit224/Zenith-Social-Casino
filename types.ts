
export enum GameMode {
  FREE = 'FREE',
  CHALLENGE = 'CHALLENGE'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface User {
  id: string;
  email: string;
  password?: string;
  balances: {
    [GameMode.FREE]: number;
    [GameMode.CHALLENGE]: number;
  };
  highestPayouts: {
    plinko: number;
    mines: number;
  };
}

export interface LeaderboardEntry {
  email: string;
  score: number;
}

export interface GameState {
  balance: number;
  gameMode: GameMode;
  difficulty: Difficulty;
}

export interface PlinkoPeg {
  x: number;
  y: number;
}

export interface PlinkoBall {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  row: number;
  history: {x: number, y: number}[];
}

export interface MinesCell {
  id: number;
  isMine: boolean;
  isRevealed: boolean;
}
