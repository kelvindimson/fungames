export type GameStatus =
  | "lobby"
  | "countdown"
  | "playing"
  | "roundEnd"
  | "gameOver";

export interface GameState {
  code: string;
  gmId: string;
  status: GameStatus;
  currentRound: number;
  words: string[]; // obfuscated
  roundTime: number;
  roundStartTime: number | null;
}

export interface Player {
  id: string;
  gameCode: string;
  name: string;
  totalScore: number;
}

export interface RoundResult {
  results: Record<string, { score: number; guesses: number }>;
}
