# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000 (auto-opens browser)
npm run build    # Build to build/ directory (esnext target)
```

No test runner is configured. No linting config is present; TypeScript type-checking is available via the build.

## Architecture

Single-page React 18 + TypeScript app built with Vite + SWC. The entire game logic lives in `src/App.tsx`.

**Game logic (`src/App.tsx`):** Three treasure boxes are randomly assigned treasure or skeleton on each new game. Clicking a box flips it with a 3D CSS animation (via `motion/react`). Treasure awards +$100, skeleton deducts -$50. Game ends when all boxes are opened; score resets on replay. A Win/Tie/Loss badge appears next to the score after the first box is opened (score > 0 = Win, = 0 = Tie, < 0 = Loss). Hovering a closed box overlays `key.png` on it.

**Audio:** `chest_open.mp3` plays when a treasure box is opened; `chest_open_with_evil_laugh.mp3` plays when a skeleton box is opened. Both are triggered via `new Audio(...).play()` inside the `openBox` handler.

**UI components:** `src/components/ui/` contains 40+ pre-built Radix UI wrappers (shadcn-style). `src/components/figma/ImageWithFallback.tsx` is a Figma-generated image component. The game itself only uses a custom `Button` component.

**Styling:** Tailwind CSS v4 (configured via `src/index.css` with `@import "tailwindcss"`). Global styles also in `src/styles/globals.css`.

**Path alias:** `@` resolves to `./src`. The `vite.config.ts` also contains aliases for specific Radix UI package versions to avoid duplicate installs.

**Assets:** Game images (closed/opened chest, skeleton, key) are in `src/assets/`. A hover-state key image lives in `src/results/`.
