import type {
  RaceConfig,
  RaceState,
  TypedCharacter,
} from "@/types/game";

const INITIAL_ENEMY_PROGRESS = -0.08;

/**
 * The small overlap/gap at which the chaser is considered
 * to have caught the player.
 *
 * 0.03 = roughly 3% of the track.
 */
const CATCH_DISTANCE = 0.03;

/**
 * Creates a brand-new race.
 */
export function createRace(text: string): RaceState {
  const characters: TypedCharacter[] = text
    .split("")
    .map((character) => ({
      character,
      status: "pending",
    }));

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

/**
 * Returns the player's current progress as a value from 0 to 1.
 */
export function getPlayerProgress(state: RaceState): number {
  if (state.characters.length === 0) {
    return 1;
  }

  return Math.min(
    state.currentIndex / state.characters.length,
    1,
  );
}

/**
 * Processes a single keyboard input.
 */
export function processKey(
  state: RaceState,
  key: string,
  config: RaceConfig,
  now: number,
): RaceState {
  if (state.status === "won" || state.status === "lost") {
    return state;
  }

  if (key === "Backspace") {
    return handleBackspace(state);
  }

  if (key.length !== 1) {
    return state;
  }

  const currentCharacter = state.characters[state.currentIndex];

  if (!currentCharacter) {
    return state;
  }

  const isStarting = state.status === "idle";
  const isCorrect = key === currentCharacter.character;

  const characters: TypedCharacter[] = state.characters.map(
    (character, index) => {
      if (index !== state.currentIndex) {
        return character;
      }

      return {
        ...character,
        status: isCorrect ? "correct" : "wrong",
      };
    },
  );

  const nextIndex = state.currentIndex + 1;

  let enemyProgress = state.enemyProgress;

  if (!isCorrect) {
    enemyProgress += config.wrongKeyPenalty;
  }

  const nextState: RaceState = {
    ...state,
    status: isStarting ? "running" : state.status,
    characters,
    currentIndex: nextIndex,
    correctCount: state.correctCount + (isCorrect ? 1 : 0),
    errorCount: state.errorCount + (isCorrect ? 0 : 1),
    enemyProgress,
    startedAt: isStarting ? now : state.startedAt,
  };

  /*
   * Finishing the text means the player crossed the finish line.
   */
  if (getPlayerProgress(nextState) >= 1) {
    return {
      ...nextState,
      status: "won",
    };
  }

  /*
   * A wrong key may have allowed the chaser to catch the player.
   */
  if (hasChaserCaughtPlayer(nextState)) {
    return {
      ...nextState,
      status: "lost",
    };
  }

  return nextState;
}

/**
 * Advances the chaser according to elapsed time.
 */
export function advanceEnemy(
  state: RaceState,
  config: RaceConfig,
  deltaMs: number,
): RaceState {
  if (state.status !== "running") {
    return state;
  }

  if (deltaMs <= 0) {
    return state;
  }

  const deltaSeconds = deltaMs / 1000;

  const enemyProgress =
    state.enemyProgress +
    config.enemySpeed * deltaSeconds;

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

/**
 * Determines whether the chaser has reached the player.
 */
export function hasChaserCaughtPlayer(
  state: RaceState,
): boolean {
  const playerProgress = getPlayerProgress(state);

  return (
    state.enemyProgress + CATCH_DISTANCE >=
    playerProgress
  );
}

/**
 * Handles Backspace.
 *
 * An error that has already happened remains counted as an error.
 * Backspace only moves the typing cursor back and resets the
 * character's visual status.
 */
function handleBackspace(state: RaceState): RaceState {
  if (state.currentIndex === 0) {
    return state;
  }

  const previousIndex = state.currentIndex - 1;

  const characters: TypedCharacter[] = state.characters.map(
    (character, index) => {
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