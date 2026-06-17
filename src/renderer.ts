import type { GameState } from "./types";
import type { Skin } from "./skins";

export interface Renderer {
  render: (state: GameState, skin: Skin) => void;
}

/**
 * Build a renderer bound to a canvas. Reads GameState + Skin and draws them;
 * never mutates the state.
 */
export function createRenderer(canvas: HTMLCanvasElement): Renderer {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context is not available");

  function drawCell(cellPx: number, x: number, y: number, inset = 1): void {
    ctx!.fillRect(
      x * cellPx + inset,
      y * cellPx + inset,
      cellPx - inset * 2,
      cellPx - inset * 2,
    );
  }

  function render(state: GameState, skin: Skin): void {
    const cellW = canvas.width / state.width;
    const cellH = canvas.height / state.height;
    const cellPx = Math.min(cellW, cellH);

    // Background.
    ctx!.fillStyle = skin.background;
    ctx!.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines.
    ctx!.strokeStyle = skin.grid;
    ctx!.lineWidth = 1;
    ctx!.beginPath();
    for (let x = 0; x <= state.width; x++) {
      ctx!.moveTo(x * cellPx, 0);
      ctx!.lineTo(x * cellPx, state.height * cellPx);
    }
    for (let y = 0; y <= state.height; y++) {
      ctx!.moveTo(0, y * cellPx);
      ctx!.lineTo(state.width * cellPx, y * cellPx);
    }
    ctx!.stroke();

    // Food.
    if (state.food) {
      ctx!.fillStyle = skin.food;
      drawCell(cellPx, state.food.x, state.food.y, 3);
    }

    // Snake.
    state.snake.forEach((segment, i) => {
      ctx!.fillStyle = i === 0 ? skin.snakeHead : skin.snakeBody;
      drawCell(cellPx, segment.x, segment.y);
    });

    if (state.status !== "playing") {
      drawOverlay(state, skin);
    }
  }

  function drawOverlay(state: GameState, skin: Skin): void {
    ctx!.fillStyle = skin.overlay;
    ctx!.fillRect(0, 0, canvas.width, canvas.height);

    ctx!.textAlign = "center";
    ctx!.fillStyle = skin.accent;
    ctx!.font = "bold 32px system-ui, sans-serif";
    const title = state.status === "won" ? "You win!" : "Game over";
    ctx!.fillText(title, canvas.width / 2, canvas.height / 2 - 16);

    ctx!.fillStyle = skin.text;
    ctx!.font = "16px system-ui, sans-serif";
    ctx!.fillText(
      `Score: ${state.score}`,
      canvas.width / 2,
      canvas.height / 2 + 14,
    );
    ctx!.fillText(
      "Press Space or Enter to restart",
      canvas.width / 2,
      canvas.height / 2 + 40,
    );
  }

  return { render };
}
