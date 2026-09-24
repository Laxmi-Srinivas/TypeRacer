import type { Difficulty, RaceConfig } from "@/types/game";

export const DIFFICULTY_CONFIG: Record<
  Exclude<Difficulty, "custom">,
  RaceConfig
> = {
  easy: {
    enemySpeed: 0.12,
    playerStep: 2.4,
    wrongKeyPenalty: 0.5,
  },

  normal: {
    enemySpeed: 0.2,
    playerStep: 2,
    wrongKeyPenalty: 1,
  },

  hard: {
    enemySpeed: 0.35,
    playerStep: 1.7,
    wrongKeyPenalty: 1.5,
  },

  expert: {
    enemySpeed: 0.55,
    playerStep: 1.4,
    wrongKeyPenalty: 2,
  },
};