/** A visual theme for the board, snake, food and overlay. */
export interface Skin {
  readonly id: string;
  readonly name: string;
  readonly background: string;
  readonly grid: string;
  readonly food: string;
  readonly snakeHead: string;
  readonly snakeBody: string;
  /** Highlight color: title text, HUD numbers, canvas glow. */
  readonly accent: string;
  readonly text: string;
  /** Semi-transparent fill drawn over the board on game over. */
  readonly overlay: string;
}

export const SKINS: readonly Skin[] = [
  {
    id: "classic",
    name: "Classic",
    background: "#161922",
    grid: "#1f2430",
    food: "#f87171",
    snakeHead: "#4ade80",
    snakeBody: "#22c55e",
    accent: "#4ade80",
    text: "#e6e6e6",
    overlay: "rgba(15, 17, 23, 0.78)",
  },
  {
    id: "neon",
    name: "Neon",
    background: "#0a0a12",
    grid: "#1a1a2e",
    food: "#ff2e97",
    snakeHead: "#00f5d4",
    snakeBody: "#00bbf9",
    accent: "#00f5d4",
    text: "#f0f0ff",
    overlay: "rgba(5, 5, 12, 0.8)",
  },
  {
    id: "ocean",
    name: "Ocean",
    background: "#06283d",
    grid: "#0a3a52",
    food: "#ffd60a",
    snakeHead: "#48cae4",
    snakeBody: "#0096c7",
    accent: "#48cae4",
    text: "#caf0f8",
    overlay: "rgba(3, 18, 28, 0.8)",
  },
  {
    id: "desert",
    name: "Desert",
    background: "#2b2118",
    grid: "#3d2f22",
    food: "#e63946",
    snakeHead: "#f4a261",
    snakeBody: "#e76f51",
    accent: "#f4a261",
    text: "#f1e3d3",
    overlay: "rgba(20, 15, 10, 0.8)",
  },
  {
    id: "matrix",
    name: "Matrix",
    background: "#000000",
    grid: "#0d1f0d",
    food: "#ccff00",
    snakeHead: "#00ff41",
    snakeBody: "#008f11",
    accent: "#00ff41",
    text: "#c8facc",
    overlay: "rgba(0, 0, 0, 0.82)",
  },
  {
    id: "grape",
    name: "Grape",
    background: "#1a1023",
    grid: "#2a1a38",
    food: "#ffd166",
    snakeHead: "#c77dff",
    snakeBody: "#9d4edd",
    accent: "#c77dff",
    text: "#ede0f7",
    overlay: "rgba(12, 6, 18, 0.8)",
  },
];

export const DEFAULT_SKIN_ID = "classic";

export function getSkin(id: string | null | undefined): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}
