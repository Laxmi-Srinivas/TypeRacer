import type { Difficulty, RaceConfig } from "@/types/game";

export const DIFFICULTY_CONFIG: Record<
  Exclude<Difficulty, "custom">,
  RaceConfig
> = {
  easy: {
    enemySpeed: 0.06,
    wrongKeyPenalty: 0.02,
  },

  normal: {
    enemySpeed: 0.075,
    wrongKeyPenalty: 0.025,
  },

  hard: {
    enemySpeed: 0.09,
    wrongKeyPenalty: 0.03,
  },

  expert: {
    enemySpeed: 0.105,
    wrongKeyPenalty: 0.035,
  },
};