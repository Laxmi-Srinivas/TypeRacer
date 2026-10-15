import type {
  RaceConfig,
  RaceState,
  TypedCharacter,
} from "@/types/game";

const INITIAL_ENEMY_PROGRESS = -0.08;
const CATCH_DISTANCE = 0.03;
const MAX_PROGRESS = 1;

export function createRace(text: string): RaceState {
  const characters: TypedCharacter[] = Array.from(text).map(
    (character) => ({
      character,
      status: "pending",
    }),
  );

  return {
    status: "idle",
    text,
    characters,
    currentIndex: 0,
    correctCount: 0,
    errorCount: 0,
    enemyProgress: INITIAL_ENEMY_PROGRESS,
    startedAt: null,
  };
}

export function getPlayerProgress(state: RaceState): number {
  if (state.text.length === 0) {
    return 0;
  }

  return Math.min(
    MAX_PROGRESS,
    Math.max(0, state.currentIndex / state.text.length),
  );
}

export function processKey(
  state: RaceState,
  key: string,
  config: RaceConfig,
  now: number = Date.now(),
): RaceState {
  if (state.status === "won" || state.status === "lost") {
    return state;
  }

  if (key === "Backspace") {
    return handleBackspace(state);
  }

  if (key.length !== 1 || state.text.length === 0) {
    return state;
  }

  const startedAt = state.startedAt ?? now;
  const status = "running" as const;

  if (state.currentIndex >= state.text.length) {
    return {
      ...state,
      status,
      startedAt,
    };
  }

  const expectedCharacter = state.text[state.currentIndex];
  const isCorrect = key === expectedCharacter;

  const characters: TypedCharacter[] = state.characters.map(
    (character, index): TypedCharacter => {
      if (index !== state.currentIndex) {
        return character;
      }

      return {
        ...character,
        status: isCorrect ? "correct" : "wrong",
      };
    },
  );

  if (!isCorrect) {
    const enemyProgress = Math.min(
      MAX_PROGRESS,
      state.enemyProgress + Math.max(0, config.wrongKeyPenalty),
    );

    const nextState: RaceState = {
      ...state,
      status,
      characters,
      errorCount: state.errorCount + 1,
      enemyProgress,
      startedAt,
    };

    if (hasChaserCaughtPlayer(nextState)) {
      return {
        ...nextState,
        status: "lost",
      };
    }

    return nextState;
  }

  const currentIndex = state.currentIndex + 1;

  const nextState: RaceState = {
    ...state,
    status:
      currentIndex === state.text.length ? "won" : status,
    characters,
    currentIndex,
    correctCount: state.correctCount + 1,
    startedAt,
  };

  if (
    nextState.status !== "won" &&
    hasChaserCaughtPlayer(nextState)
  ) {
    return {
      ...nextState,
      status: "lost",
    };
  }

  return nextState;
}

export function advanceEnemy(
  state: RaceState,
  config: RaceConfig,
  deltaMs: number,
): RaceState {
  if (state.status !== "running" || deltaMs <= 0) {
    return state;
  }

  const enemyProgress = Math.min(
    MAX_PROGRESS,
    state.enemyProgress +
      (Math.max(0, config.enemySpeed) * deltaMs) / 1000,
  );

  const nextState: RaceState = {
    ...state,
    enemyProgress,
  };

  if (hasChaserCaughtPlayer(nextState)) {
    return {
      ...nextState,
      status: "lost",
    };
  }

  return nextState;
}

export function hasChaserCaughtPlayer(
  state: RaceState,
): boolean {
  if (state.text.length === 0) {
    return false;
  }

  return (
    state.enemyProgress >=
    getPlayerProgress(state) + CATCH_DISTANCE
  );
}

export function handleBackspace(state: RaceState): RaceState {
  if (state.status !== "running") {
    return state;
  }

  const currentCharacter = state.characters[state.currentIndex];

  
  if (currentCharacter?.status === "wrong") {
    const characters = state.characters.map(
      (character, index): TypedCharacter => {
        if (index !== state.currentIndex) {
          return character;
        }

        return {
          ...character,
          status: "pending",
        };
      },
    );

    return {
      ...state,
      characters,
    };
  }

  
  if (state.currentIndex > 0) {
    const previousIndex = state.currentIndex - 1;

    const characters = state.characters.map(
      (character, index): TypedCharacter => {
        if (index !== previousIndex) {
          return character;
        }

        return {
          ...character,
          status: "pending",
        };
      },
    );

    return {
      ...state,
      characters,
      currentIndex: previousIndex,
    };
  }

  return state;
}
