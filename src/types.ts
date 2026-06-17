export type Direction = "up" | "down" | "left" | "right";

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** Returns a float in [0, 1), same contract as Math.random. */
export type RandomFn = () => number;

export type GameStatus = "playing" | "gameover" | "won";

export interface GameConfig {
  /** Grid width in cells. Default 20. */
  width: number;
  /** Grid height in cells. Default 20. */
  height: number;
  /** Starting snake length in segments. Default 3. */
  initialSnakeLength: number;
  /** Base tick interval in ms. Default 120. */
  tickIntervalMs: number;
  /** Source of randomness for food spawns. Default Math.random. */
  random: RandomFn;
}

export interface GameState {
  readonly width: number;
  readonly height: number;
  /** Snake segments, head first. */
  readonly snake: readonly Point[];
  /** Direction applied on the last tick (committed). */
  readonly direction: Direction;
  /** Direction queued for the next tick. */
  readonly nextDirection: Direction;
  /** Current food cell, or null when the board is full (won). */
  readonly food: Point | null;
  readonly score: number;
  readonly status: GameStatus;
  /** Carried so tick() stays pure: same random => same spawns. */
  readonly random: RandomFn;
}
