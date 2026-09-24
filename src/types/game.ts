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
  /**
   * Chaser progress gained per second.
   * Progress is represented from 0 to 1.
   */
  enemySpeed: number;

  /**
   * Additional chaser progress gained from a wrong key.
   */
  wrongKeyPenalty: number;
}

export interface RaceState {
  status: GameStatus;

  text: string;
  characters: TypedCharacter[];
  currentIndex: number;

  correctCount: number;
  errorCount: number;

  /**
   * Chaser position on the race track.
   *
   * 0 = starting line
   * 1 = finish line
   */
  enemyProgress: number;

  /**
   * Timestamp when the first character was typed.
   */
  startedAt: number | null;
}