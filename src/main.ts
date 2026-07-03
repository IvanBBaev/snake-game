import { createGame, setDirection, tick } from "./game";
import { attachInput } from "./input";
import { createRenderer } from "./renderer";
import { SKINS, DEFAULT_SKIN_ID, getSkin } from "./skins";
import type { GameConfig, GameState } from "./types";
import type { Skin } from "./skins";

// Settings shared across every board size. Width/height are chosen at runtime.
const BASE_CONFIG: Partial<GameConfig> = {
  initialSnakeLength: 3,
  tickIntervalMs: 120,
};

interface BoardSize {
  id: string;
  name: string;
  width: number;
  height: number;
}

// Square boards so cells stay square on the fixed square canvas.
const BOARD_SIZES: readonly BoardSize[] = [
  { id: "small", name: "Small · 12×12", width: 12, height: 12 },
  { id: "medium", name: "Medium · 20×20", width: 20, height: 20 },
  { id: "large", name: "Large · 30×30", width: 30, height: 30 },
];
const DEFAULT_SIZE_ID = "medium";

// Optional speed ramp: shave time off the tick every few points, down to a floor.
const SPEED_STEP_MS = 6;
const SPEED_EVERY_POINTS = 5;
const MIN_INTERVAL_MS = 60;

const BEST_SCORE_KEY = "snake.bestScore";
const SKIN_KEY = "snake.skin";
const SIZE_KEY = "snake.size";

function tickInterval(state: GameState): number {
  const base = BASE_CONFIG.tickIntervalMs ?? 120;
  const steps = Math.floor(state.score / SPEED_EVERY_POINTS);
  return Math.max(MIN_INTERVAL_MS, base - steps * SPEED_STEP_MS);
}

function getBoardSize(id: string): BoardSize {
  return BOARD_SIZES.find((s) => s.id === id) ?? BOARD_SIZES[1];
}

function configFor(size: BoardSize): Partial<GameConfig> {
  return { ...BASE_CONFIG, width: size.width, height: size.height };
}

function loadSizeId(): string {
  try {
    return localStorage.getItem(SIZE_KEY) ?? DEFAULT_SIZE_ID;
  } catch {
    return DEFAULT_SIZE_ID;
  }
}

function saveSizeId(id: string): void {
  try {
    localStorage.setItem(SIZE_KEY, id);
  } catch {
    /* ignore storage failures */
  }
}

function populateSizeSelect(select: HTMLSelectElement, currentId: string): void {
  for (const size of BOARD_SIZES) {
    const option = document.createElement("option");
    option.value = size.id;
    option.textContent = size.name;
    if (size.id === currentId) option.selected = true;
    select.appendChild(option);
  }
}

function loadBestScore(): number {
  try {
    return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBestScore(score: number): void {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    /* ignore storage failures */
  }
}

function loadSkinId(): string {
  try {
    return localStorage.getItem(SKIN_KEY) ?? DEFAULT_SKIN_ID;
  } catch {
    return DEFAULT_SKIN_ID;
  }
}

function saveSkinId(id: string): void {
  try {
    localStorage.setItem(SKIN_KEY, id);
  } catch {
    /* ignore storage failures */
  }
}

function applySkinChrome(skin: Skin): void {
  document.documentElement.style.setProperty("--accent", skin.accent);
  const canvas = document.getElementById("game");
  if (canvas) {
    canvas.style.background = skin.background;
    canvas.style.borderColor = skin.grid;
  }
}

function populateSkinSelect(select: HTMLSelectElement, currentId: string): void {
  for (const skin of SKINS) {
    const option = document.createElement("option");
    option.value = skin.id;
    option.textContent = skin.name;
    if (skin.id === currentId) option.selected = true;
    select.appendChild(option);
  }
}

function main(): void {
  const canvas = document.getElementById("game") as HTMLCanvasElement | null;
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const skinSelect = document.getElementById("skin") as HTMLSelectElement | null;
  const sizeSelect = document.getElementById("size") as HTMLSelectElement | null;
  if (!canvas) throw new Error("Canvas #game not found");

  const renderer = createRenderer(canvas);

  let boardSize = getBoardSize(loadSizeId());
  let config = configFor(boardSize);
  let state = createGame(config);
  let best = loadBestScore();
  let skin = getSkin(loadSkinId());

  applySkinChrome(skin);

  if (skinSelect) {
    populateSkinSelect(skinSelect, skin.id);
    skinSelect.addEventListener("change", () => {
      skin = getSkin(skinSelect.value);
      saveSkinId(skin.id);
      applySkinChrome(skin);
      renderer.render(state, skin);
      // Return focus to the game so arrow keys keep working.
      skinSelect.blur();
    });
  }

  function updateHud(): void {
    if (scoreEl) scoreEl.textContent = String(state.score);
    if (state.score > best) {
      best = state.score;
      saveBestScore(best);
    }
    if (bestEl) bestEl.textContent = String(best);
  }

  attachInput(window, {
    onDirection: (dir) => {
      state = setDirection(state, dir);
    },
    onRestart: () => {
      if (state.status !== "playing") {
        state = createGame(config);
      }
    },
  });

  if (sizeSelect) {
    populateSizeSelect(sizeSelect, boardSize.id);
    sizeSelect.addEventListener("change", () => {
      boardSize = getBoardSize(sizeSelect.value);
      saveSizeId(boardSize.id);
      // Changing the board size starts a fresh game on the new grid.
      config = configFor(boardSize);
      state = createGame(config);
      updateHud();
      renderer.render(state, skin);
      // Return focus to the game so arrow keys keep working.
      sizeSelect.blur();
    });
  }

  let last = performance.now();
  let accumulator = 0;

  function frame(now: number): void {
    accumulator += now - last;
    last = now;

    const interval = tickInterval(state);
    while (accumulator >= interval) {
      accumulator -= interval;
      state = tick(state);
    }

    updateHud();
    renderer.render(state, skin);
    requestAnimationFrame(frame);
  }

  updateHud();
  renderer.render(state, skin);
  requestAnimationFrame(frame);
}

main();
