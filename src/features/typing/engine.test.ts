import { describe, expect, it } from "vitest";

import {
  advanceEnemy,
  createRace,
  getPlayerProgress,
  hasChaserCaughtPlayer,
  processKey,
} from "./engine";

const config = {
  enemySpeed: 0.1,
  wrongKeyPenalty: 0.02,
};

describe("typing engine", () => {
  it("creates an idle race", () => {
    const state = createRace("cat");

    expect(state.status).toBe("idle");
    expect(state.currentIndex).toBe(0);
    expect(state.correctCount).toBe(0);
    expect(state.errorCount).toBe(0);
    expect(state.enemyProgress).toBe(-0.08);
    expect(state.startedAt).toBeNull();
  });

  it("starts the race on the first valid key", () => {
    const state = createRace("cat");

    const next = processKey(
      state,
      "c",
      config,
      1000,
    );

    expect(next.status).toBe("running");
    expect(next.currentIndex).toBe(1);
    expect(next.correctCount).toBe(1);
    expect(next.errorCount).toBe(0);
    expect(next.startedAt).toBe(1000);
  });

  it("records an incorrect character", () => {
    const state = createRace("cat");

    const next = processKey(
      state,
      "x",
      config,
      1000,
    );

    expect(next.errorCount).toBe(1);
    expect(next.currentIndex).toBe(1);
    expect(next.characters[0].status).toBe("wrong");
  });

  it("applies a chaser penalty for a wrong key", () => {
    const state = createRace("cat");

    const next = processKey(
      state,
      "x",
      config,
      1000,
    );

    expect(next.enemyProgress).toBeCloseTo(-0.06);
  });

  it("calculates player progress from the current index", () => {
    let state = createRace("cat");

    state = processKey(
      state,
      "c",
      config,
      1000,
    );

    expect(getPlayerProgress(state)).toBeCloseTo(
      1 / 3,
    );
  });

  it("advances the chaser over time", () => {
    let state = createRace("cat");

    state = processKey(
      state,
      "c",
      config,
      1000,
    );

    const next = advanceEnemy(
      state,
      config,
      1000,
    );

    expect(next.enemyProgress).toBeCloseTo(
      0.02,
    );
  });

  it("can detect when the chaser catches the player", () => {
    let state = createRace("ab");

    state = processKey(
      state,
      "a",
      config,
      1000,
    );

    /*
     * Player is at 50%.
     * Move the chaser beyond the player's position.
     */
    const next = {
      ...state,
      enemyProgress: 0.5,
    };

    expect(
      hasChaserCaughtPlayer(next),
    ).toBe(true);
  });

  it("loses when the chaser catches the player", () => {
    let state = createRace("abc");

    state = processKey(
      state,
      "a",
      config,
      1000,
    );

    /*
     * Player = 33%.
     * Chaser is placed close enough to catch.
     */
    state = {
      ...state,
      enemyProgress: 0.32,
    };

    const next = advanceEnemy(
      state,
      config,
      100,
    );

    expect(next.status).toBe("lost");
  });

  it("wins when the player finishes the text", () => {
    let state = createRace("cat");

    state = processKey(
      state,
      "c",
      config,
      1000,
    );

    state = processKey(
      state,
      "a",
      config,
      1100,
    );

    state = processKey(
      state,
      "t",
      config,
      1200,
    );

    expect(state.status).toBe("won");
    expect(getPlayerProgress(state)).toBe(1);
  });

  it("undoes the cursor position with backspace", () => {
    let state = createRace("cat");

    state = processKey(
      state,
      "c",
      config,
      1000,
    );

    state = processKey(
      state,
      "x",
      config,
      1100,
    );

    expect(state.errorCount).toBe(1);
    expect(state.currentIndex).toBe(2);

    state = processKey(
      state,
      "Backspace",
      config,
      1200,
    );

    expect(state.currentIndex).toBe(1);
    expect(state.errorCount).toBe(1);
    expect(state.characters[1].status).toBe(
      "pending",
    );
  });

  it("ignores input after the race is over", () => {
    let state = createRace("a");

    state = processKey(
      state,
      "a",
      config,
      1000,
    );

    expect(state.status).toBe("won");

    const next = processKey(
      state,
      "x",
      config,
      2000,
    );

    expect(next).toEqual(state);
  });
});