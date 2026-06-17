# Snake

Classic Snake game built with **TypeScript**, **HTML5 Canvas** and **Vite**.
Game logic is fully decoupled from rendering, so it is unit-testable without a DOM.

**▶ Play:** https://leasstatt.github.io/snake-game/

## Getting started

Requires **Node 18+** (`.nvmrc` pins 22 — run `nvm use` if you use nvm).

```bash
npm install
npm run dev      # start the Vite dev server (open the printed URL)
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
npm test         # run the Vitest suite
```

## How to play

- **Move:** Arrow keys or **WASD**.
- **Restart:** **Space** or **Enter** after game over.
- Eat the food to grow and score; avoid the walls and your own tail.
- A 180° reverse turn is ignored, so you can't instantly fold onto yourself.
- Pick a **skin** from the dropdown — 6 color themes; your choice and best score
  are kept in `localStorage`.

## Deployment

Pushing to `main` triggers [the Pages workflow](.github/workflows/deploy.yml),
which type-checks, tests, builds, and publishes `dist/` to GitHub Pages. The Vite
`base` is set to `/snake-game/` to match the repo name.

## Project structure

```
src/
  main.ts      # entry point: wires logic + renderer + input, runs the loop
  game.ts      # pure, deterministic game logic (no DOM)
  renderer.ts  # draws GameState to the canvas (never mutates state)
  input.ts     # keyboard events -> direction / restart commands
  skins.ts     # selectable color themes
  types.ts     # shared types
tests/
  game.test.ts # unit tests for the pure logic
```

## Architecture

`game.ts` exposes a pure, deterministic core:

- `createGame(config)` → initial `GameState`
- `tick(state)` → next `GameState` (immutable; returns a new object)
- `setDirection(state, dir)` → `GameState` with the turn queued for the next tick
- `spawnFood(width, height, snake, random)` → a free cell, never on the snake

Randomness is injected (a `RandomFn` passed via config), so food spawns are
reproducible in tests. The renderer and input layer never own game state.
