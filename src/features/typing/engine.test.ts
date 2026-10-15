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
    const next = processKey(state, "c", config, 1000);

    expect(next.status).toBe("running");
    expect(next.currentIndex).toBe(1);
    expect(next.correctCount).toBe(1);
    expect(next.errorCount).toBe(0);
    expect(next.startedAt).toBe(1000);
  });

  it("records an incorrect character without advancing the cursor", () => {
    const state = createRace("cat");
    const next = processKey(state, "x", config, 1000);

    expect(next.errorCount).toBe(1);
    expect(next.currentIndex).toBe(0);
    expect(next.characters[0].status).toBe("wrong");
  });

  it("applies a chaser penalty for a wrong key", () => {
    const state = createRace("cat");
    const next = processKey(state, "x", config, 1000);

    expect(next.enemyProgress).toBeCloseTo(-0.06);
  });

  it("calculates player progress from the current index", () => {
    const state = processKey(
      createRace("cat"),
      "c",
      config,
      1000,
    );

    expect(getPlayerProgress(state)).toBeCloseTo(1 / 3);
  });

  it("advances the chaser over time", () => {
    const state = processKey(
      createRace("cat"),
      "c",
      config,
      1000,
    );

    const next = advanceEnemy(state, config, 1000);

    expect(next.enemyProgress).toBeCloseTo(0.02);
  });

it("can detect when the chaser catches the player", () => {
  const state = processKey(
    createRace("ab"),
    "a",
    config,
    1000,
  );

  const next = {
    ...state,
    enemyProgress: 0.9,
  };

  expect(hasChaserCaughtPlayer(next)).toBe(true);
});

it("loses when the chaser catches the player", () => {
  let state = processKey(
    createRace("abc"),
    "a",
    config,
    1000,
  );

  state = {
    ...state,
    enemyProgress: 0.9,
  };

  const next = advanceEnemy(state, config, 100);

  expect(next.status).toBe("lost");
});

  it("wins when the player finishes the text", () => {
    let state = createRace("cat");

    state = processKey(state, "c", config, 1000);
    state = processKey(state, "a", config, 1100);
    state = processKey(state, "t", config, 1200);

    expect(state.status).toBe("won");
    expect(getPlayerProgress(state)).toBe(1);
  });

  it("clears a wrong marker with Backspace without refunding penalties", () => {
    const initial = createRace("ab");
    const wrong = processKey(initial, "x", config, 1000);
    const cleared = processKey(
      wrong,
      "Backspace",
      config,
      1100,
    );

    expect(cleared.currentIndex).toBe(0);
    expect(cleared.characters[0].status).toBe("pending");
    expect(cleared.errorCount).toBe(1);
    expect(cleared.enemyProgress).toBe(wrong.enemyProgress);
  });

  it("moves back over a correct character without erasing history", () => {
    const initial = createRace("ab");
    const first = processKey(initial, "a", config, 1000);
    const backedUp = processKey(
      first,
      "Backspace",
      config,
      1100,
    );

    expect(backedUp.currentIndex).toBe(0);
    expect(backedUp.characters[0].status).toBe("pending");
    expect(backedUp.correctCount).toBe(1);
    expect(backedUp.errorCount).toBe(0);
  });

  it("advances when the correct character is typed after an error", () => {
    const initial = createRace("cat");
    const wrong = processKey(initial, "x", config, 1000);
    const corrected = processKey(
      wrong,
      "c",
      config,
      1100,
    );

    expect(corrected.currentIndex).toBe(1);
    expect(corrected.errorCount).toBe(1);
    expect(corrected.correctCount).toBe(1);
    expect(corrected.characters[0].status).toBe("correct");
  });

  it("counts each wrong attempt and applies each penalty", () => {
    const initial = createRace("a");
    const first = processKey(initial, "x", config, 1000);
    const second = processKey(first, "y", config, 1100);

    expect(second.currentIndex).toBe(0);
    expect(second.errorCount).toBe(2);
    expect(second.enemyProgress).toBeCloseTo(
      initial.enemyProgress + config.wrongKeyPenalty * 2,
    );
  });

  it("reports zero progress for an empty passage", () => {
    expect(getPlayerProgress(createRace(""))).toBe(0);
  });

  it("caps enemy progress at the finish line", () => {
    const initial = {
      ...createRace("abcdef"),
      status: "running" as const,
      currentIndex: 2,
      enemyProgress: 0.98,
    };

    const next = advanceEnemy(
      initial,
      {
        enemySpeed: 0.5,
        wrongKeyPenalty: 0.02,
      },
      1000,
    );

    expect(next.enemyProgress).toBe(1);
    expect(next.status).toBe("lost");
  });

  it("ignores input after the race is over", () => {
    const state = processKey(
      createRace("a"),
      "a",
      config,
      1000,
    );

    expect(state.status).toBe("won");

    const next = processKey(state, "x", config, 2000);

    expect(next).toEqual(state);
  });
});
