import type {
  Direction,
  GameConfig,
  GameState,
  Point,
  RandomFn,
} from "./types";

const DEFAULT_CONFIG: GameConfig = {
  width: 20,
  height: 20,
  initialSnakeLength: 3,
  tickIntervalMs: 120,
  random: Math.random,
};

const DELTAS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function occupies(snake: readonly Point[], p: Point): boolean {
  return snake.some((s) => samePoint(s, p));
}

/**
 * Pick a food cell uniformly from the free cells, using the provided random
 * function. Never lands on the snake. Returns null when the board is full.
 */
export function spawnFood(
  width: number,
  height: number,
  snake: readonly Point[],
  random: RandomFn,
): Point | null {
  const free: Point[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = { x, y };
      if (!occupies(snake, cell)) free.push(cell);
    }
  }
  if (free.length === 0) return null;
  const index = Math.floor(random() * free.length);
  return free[index];
}

export function createGame(config: Partial<GameConfig> = {}): GameState {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const { width, height, initialSnakeLength, random } = cfg;

  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);

  // Head first, body trailing to the left; moving right.
  const snake: Point[] = [];
  for (let i = 0; i < initialSnakeLength; i++) {
    snake.push({ x: cx - i, y: cy });
  }

  const food = spawnFood(width, height, snake, random);

  return {
    width,
    height,
    snake,
    direction: "right",
    nextDirection: "right",
    food,
    score: 0,
    status: food === null ? "won" : "playing",
    random,
  };
}

/**
 * Queue a direction change for the next tick. A 180° reversal of the committed
 * direction is ignored so the snake can't instantly fold onto itself. The
 * change is queued (not applied now) so two quick turns in one frame can't
 * combine into a reversal.
 */
export function setDirection(state: GameState, dir: Direction): GameState {
  if (state.status !== "playing") return state;
  if (dir === OPPOSITE[state.direction]) return state;
  if (dir === state.nextDirection) return state;
  return { ...state, nextDirection: dir };
}

/** Advance the game by one step. Pure: returns a new state. */
export function tick(state: GameState): GameState {
  if (state.status !== "playing") return state;

  const direction = state.nextDirection;
  const head = state.snake[0];
  const delta = DELTAS[direction];
  const newHead: Point = { x: head.x + delta.x, y: head.y + delta.y };

  // Wall collision.
  if (
    newHead.x < 0 ||
    newHead.y < 0 ||
    newHead.x >= state.width ||
    newHead.y >= state.height
  ) {
    return { ...state, direction, status: "gameover" };
  }

  const eating = state.food !== null && samePoint(newHead, state.food);

  // When not eating, the tail vacates its cell this step, so moving into it is
  // allowed. When eating, the whole body stays put.
  const body = eating ? state.snake : state.snake.slice(0, -1);
  if (occupies(body, newHead)) {
    return { ...state, direction, status: "gameover" };
  }

  const newSnake: Point[] = eating
    ? [newHead, ...state.snake]
    : [newHead, ...state.snake.slice(0, -1)];

  if (!eating) {
    return { ...state, snake: newSnake, direction };
  }

  const food = spawnFood(state.width, state.height, newSnake, state.random);
  return {
    ...state,
    snake: newSnake,
    direction,
    food,
    score: state.score + 1,
    status: food === null ? "won" : "playing",
  };
}
