import type { Direction } from "./types";

/**
 * Primary mapping on KeyboardEvent.code — the *physical* key, independent of
 * the active keyboard layout. KeyW/A/S/D fire for the WASD keys even when the
 * OS layout is Cyrillic, AZERTY, Dvorak, etc. (where event.key would be в/а/с/д
 * or z/q/s/d and the letter-based map below would miss).
 */
const CODE_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
};

/**
 * Fallback mapping on KeyboardEvent.key, for environments that don't provide a
 * code (older browsers, synthetic events). Latin letters only, so it is
 * layout-dependent — hence secondary to CODE_TO_DIRECTION.
 */
const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  W: "up",
  S: "down",
  A: "left",
  D: "right",
};

const RESTART_CODES = new Set(["Space", "Enter", "NumpadEnter"]);
const RESTART_KEYS = new Set([" ", "Spacebar", "Enter"]);

/** Map a physical key code (event.code) to a Direction, or null. */
export function codeToDirection(code: string): Direction | null {
  return CODE_TO_DIRECTION[code] ?? null;
}

/** Pure mapping from a KeyboardEvent.key to a Direction (or null). Fallback. */
export function keyToDirection(key: string): Direction | null {
  return KEY_TO_DIRECTION[key] ?? null;
}

export function isRestartCode(code: string): boolean {
  return RESTART_CODES.has(code);
}

export function isRestartKey(key: string): boolean {
  return RESTART_KEYS.has(key);
}

export interface InputHandlers {
  onDirection: (dir: Direction) => void;
  onRestart: () => void;
}

/**
 * Attach keyboard listeners that translate key events into game commands.
 * Prefers event.code (layout-independent) and falls back to event.key.
 * Returns a disposer that removes the listener.
 */
export function attachInput(
  target: Window | HTMLElement,
  handlers: InputHandlers,
): () => void {
  const listener = (event: Event) => {
    const ke = event as KeyboardEvent;
    const dir = codeToDirection(ke.code) ?? keyToDirection(ke.key);
    if (dir) {
      event.preventDefault();
      handlers.onDirection(dir);
      return;
    }
    if (isRestartCode(ke.code) || isRestartKey(ke.key)) {
      event.preventDefault();
      handlers.onRestart();
    }
  };
  target.addEventListener("keydown", listener);
  return () => target.removeEventListener("keydown", listener);
}
