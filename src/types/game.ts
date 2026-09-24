export type GameStatus = "idle" | "running" | "won" | "lost";

export type Difficulty =
  | "easy"
  | "normal"
  | "hard"
  | "expert"
  | "custom";

export type CharacterStatus = "pending" | "correct" | "wrong";

export interface TypedCharacter {
  character: string;
  status: CharacterStatus;
}

export interface RaceConfig {
  enemySpeed: number;
  playerStep: number;
  wrongKeyPenalty: number;
}

export interface RaceState {
  status: GameStatus;

  text: string;
  characters: TypedCharacter[];
  currentIndex: number;

  correctCount: number;
  errorCount: number;

  playerDistance: number;
  enemyDistance: number;

  startedAt: number | null;
}