import type { Direction } from "./types";

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

const RESTART_KEYS = new Set([" ", "Spacebar", "Enter"]);

/** Pure mapping from a KeyboardEvent.key to a Direction (or null). */
export function keyToDirection(key: string): Direction | null {
  return KEY_TO_DIRECTION[key] ?? null;
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
 * Returns a disposer that removes the listener.
 */
export function attachInput(
  target: Window | HTMLElement,
  handlers: InputHandlers,
): () => void {
  const listener = (event: Event) => {
    const key = (event as KeyboardEvent).key;
    const dir = keyToDirection(key);
    if (dir) {
      event.preventDefault();
      handlers.onDirection(dir);
      return;
    }
    if (isRestartKey(key)) {
      event.preventDefault();
      handlers.onRestart();
    }
  };
  target.addEventListener("keydown", listener);
  return () => target.removeEventListener("keydown", listener);
}
