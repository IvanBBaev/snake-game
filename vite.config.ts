import { defineConfig } from "vite";

// Served from https://ivanbbaev.github.io/snake-game/ on GitHub Pages, so the
// production base path must match the repo name. Dev server ignores `base`.
export default defineConfig({
  base: "/snake-game/",
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
