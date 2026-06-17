import { describe, it, expect } from "vitest";
import { createGame, setDirection, tick, spawnFood } from "../src/game";
import type { GameState, Point, RandomFn } from "../src/types";

/** Deterministic random returning a fixed value. */
function constant(value: number): RandomFn {
  return () => value;
}

/** Build a fully specified state for precise scenarios. */
function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    width: 20,
    height: 20,
    snake: [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ],
    direction: "right",
    nextDirection: "right",
    food: { x: 0, y: 0 },
    score: 0,
    status: "playing",
    random: constant(0),
    ...overrides,
  };
}

describe("createGame", () => {
  it("starts with the configured length, centered, moving right", () => {
    const state = createGame({ width: 20, height: 20, initialSnakeLength: 3 });
    expect(state.snake).toHaveLength(3);
    expect(state.snake[0]).toEqual({ x: 10, y: 10 });
    expect(state.direction).toBe("right");
    expect(state.status).toBe("playing");
    expect(state.score).toBe(0);
  });

  it("never spawns food on the snake", () => {
    const state = createGame({ width: 20, height: 20, random: constant(0) });
    expect(state.snake.some((s) => s.x === state.food!.x && s.y === state.food!.y)).toBe(
      false,
    );
  });
});

describe("tick", () => {
  it("moves the snake in the current direction", () => {
    const state = makeState();
    const next = tick(state);
    expect(next.snake[0]).toEqual({ x: 6, y: 5 });
    expect(next.snake).toHaveLength(3);
    expect(next.score).toBe(0);
  });

  it("grows by one and scores when eating food", () => {
    const state = makeState({ food: { x: 6, y: 5 } });
    const next = tick(state);
    expect(next.snake).toHaveLength(4);
    expect(next.score).toBe(1);
    expect(next.snake[0]).toEqual({ x: 6, y: 5 });
  });

  it("ends the game on wall collision", () => {
    const state = makeState({
      snake: [
        { x: 19, y: 5 },
        { x: 18, y: 5 },
        { x: 17, y: 5 },
      ],
      food: { x: 0, y: 0 },
    });
    const next = tick(state);
    expect(next.status).toBe("gameover");
  });

  it("ends the game on self collision", () => {
    // Head about to move up into its own body.
    const state = makeState({
      snake: [
        { x: 2, y: 2 },
        { x: 1, y: 2 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
      ],
      direction: "up",
      nextDirection: "up",
      food: { x: 10, y: 10 },
    });
    const next = tick(state);
    expect(next.status).toBe("gameover");
  });

  it("allows moving into the cell the tail is vacating", () => {
    // A 4-cell square: head follows the tail's old position, which is legal.
    const state = makeState({
      snake: [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 1, y: 2 },
      ],
      direction: "down",
      nextDirection: "down",
      food: { x: 10, y: 10 },
    });
    const next = tick(state);
    expect(next.status).toBe("playing");
    expect(next.snake[0]).toEqual({ x: 1, y: 2 });
  });

  it("is a no-op once the game is over", () => {
    const state = makeState({ status: "gameover" });
    expect(tick(state)).toBe(state);
  });
});

describe("setDirection", () => {
  it("ignores a 180° reversal", () => {
    const state = makeState({ direction: "right", nextDirection: "right" });
    const next = setDirection(state, "left");
    expect(next.nextDirection).toBe("right");
  });

  it("does not reverse even across a tick", () => {
    const state = makeState({ direction: "right", nextDirection: "right" });
    const afterInput = setDirection(state, "left");
    const next = tick(afterInput);
    // Still moving right, not folded back onto itself.
    expect(next.snake[0]).toEqual({ x: 6, y: 5 });
    expect(next.status).toBe("playing");
  });

  it("queues a valid turn applied on the next tick", () => {
    const state = makeState();
    const turned = setDirection(state, "down");
    // Not applied immediately.
    expect(turned.direction).toBe("right");
    expect(turned.nextDirection).toBe("down");
    const next = tick(turned);
    expect(next.direction).toBe("down");
    expect(next.snake[0]).toEqual({ x: 5, y: 6 });
  });
});

describe("spawnFood", () => {
  it("never lands on the snake for any random value", () => {
    const snake: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ];
    for (let r = 0; r < 1; r += 0.017) {
      const food = spawnFood(4, 4, snake, constant(r));
      expect(food).not.toBeNull();
      expect(snake.some((s) => s.x === food!.x && s.y === food!.y)).toBe(false);
    }
  });

  it("returns null when the board is full", () => {
    const snake: Point[] = [];
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) snake.push({ x, y });
    }
    expect(spawnFood(2, 2, snake, constant(0))).toBeNull();
  });
});
