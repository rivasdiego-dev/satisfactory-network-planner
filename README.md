# Satisfactory Network Planner

**Plan your conveyor and pipeline networks before you build.**

A client-side React tool for [Satisfactory](https://www.satisfactorygame.com/) players. Upload a screenshot of your map, place connection points, and get an optimal rectilinear network drawn on top — the same horizontal/vertical routing the game expects from belts, pipes, and power lines.

Open source and free forever. [Star the repo on GitHub](https://github.com/rivasdiego-dev/satisfactory-network-planner) if it helps your factory planning.

---

## The problem

Routing networks between resource nodes, factories, and power across uneven terrain is hard to plan in your head. Satisfactory has no in-game overlay to preview optimal paths before you spend materials building them.

This tool fills that gap: drop a map screenshot, mark your endpoints, and see the shortest rectilinear tree instantly.

---

## Features

| Feature | Description |
| --- | --- |
| **Map upload** | Drag-and-drop, file picker, or paste from clipboard. Supports PNG, JPG, and WebP at any zoom or map region. |
| **Nodes** | Terminal points the network must connect (extractors, factory inputs/outputs, power taps). |
| **Waypoints** | Optional Steiner points that force the route through a corridor, gap, or floor level without pretending to be a terminal. |
| **RSMT routing** | Computes a Rectilinear Steiner Minimum Tree using Manhattan distance — only horizontal and vertical segments, like in-game belts. |
| **Live stats** | Total network length (pixels), node count, and Steiner point count update as you edit. |
| **Interactive ruler** | Snip & Sketch–style guide to snap new points onto a rotated axis. Not included in exports. |
| **Undo / redo** | `Ctrl+Z` / `Ctrl+Y` for point edits. |
| **Export** | Download the map + overlay as PNG, or copy it to the clipboard. |
| **100% client-side** | No backend, no accounts, no uploads to a server. Your map stays in the browser. |

---

## Quick start

### Use the app

1. Upload a Satisfactory map screenshot.
2. Select **Node** or **Waypoint** from the dock, then click the map to place points.
3. Right-click a point to remove it; drag to reposition.
4. Toggle the **Ruler** to align points along a rotated guide.
5. Export your plan when you're ready to build.

### Run locally

**Requirements:** Node.js 20+ and npm.

```bash
git clone https://github.com/rivasdiego-dev/satisfactory-network-planner.git
cd satisfactory-network-planner
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format TypeScript with Prettier |
| `npm run typecheck` | Run TypeScript without emitting |

---

## Controls

| Action | Input |
| --- | --- |
| Add point | Click on the map (uses the active mode: Node or Waypoint) |
| Move point | Drag an existing point |
| Delete point | Right-click a point |
| Undo / redo | `Ctrl+Z` / `Ctrl+Y` |
| Ruler snap | Place points near the ruler line (within ~12 px) to project onto it |
| Rotate ruler | Drag the handle at one end of the ruler |
| Move ruler | Drag the ruler body |

---

## How the algorithm works

The planner solves a **Rectilinear Steiner Minimum Tree (RSMT)** — the shortest tree connecting your points using only axis-aligned segments and Manhattan distance.

1. **Separate inputs** — Terminal nodes and manual waypoints are kept; automatic junctions are generated separately.
2. **Candidate junctions** — The engine builds a Hanan grid from all input coordinates and treats unused intersections as optional Steiner candidates.
3. **Subset search** — For small grids (≤ 12 candidates), it searches subsets of up to 6 auto-junctions to minimize total length. Larger layouts switch to **fast mode** (MST over terminals + manual waypoints only).
4. **Prim's MST** — Runs over the best point configuration using Manhattan distance.
5. **Prune & rectify** — Removes unused auto-junctions and splits any diagonal MST edges into L-shaped horizontal/vertical segments.

Core logic lives in `src/lib/algorithmEngine.ts`. State and recomputation are handled by `src/hooks/useNetworkStore.ts`; rendering and interaction are in `src/components/MapCanvas.tsx`.

---

## Project structure

```
src/
├── App.tsx                          # App shell and layout routing
├── components/
│   ├── MapCanvas.tsx                # Canvas rendering, pointer events, ruler
│   ├── StatsBar.tsx                 # Live network statistics
│   ├── AboutDialog.tsx              # First-run onboarding
│   └── planner/                     # Header, upload screen, dock, workspace
├── hooks/
│   ├── useNetworkStore.ts           # Points, undo/redo, RSMT recomputation
│   ├── useImageUpload.ts            # File loading and validation
│   ├── useCanvasExport.ts           # PNG download and clipboard export
│   └── useUndoRedoKeyboard.ts       # Ctrl+Z / Ctrl+Y shortcuts
└── lib/
    ├── algorithmEngine.ts           # Pure RSMT implementation
    ├── ruler.ts                     # Ruler geometry and snap math
    ├── types.ts                     # Shared TypeScript types
    └── exportCanvas.ts              # Canvas-to-image helpers
```

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 + Vite 7 |
| Language | TypeScript |
| Canvas | HTML5 Canvas API |
| Styling | Tailwind CSS 4, shadcn/ui, Radix |
| Animation | Motion |
| Icons | Lucide, Tabler |

---

## Roadmap

### v1 — Core tool ✅

- [x] Image upload → canvas
- [x] Place nodes and waypoints
- [x] RSMT algorithm (full + fast modes)
- [x] Live stats
- [x] Export PNG and clipboard
- [x] Undo / redo
- [x] Interactive ruler with snap

### v2 — Persistence

- [ ] Auth (e.g. Supabase)
- [ ] Save / load plans by name
- [ ] Plan list per user

### v3 — Power user features

- [ ] Multiple color-coded networks on one map
- [ ] Distance scale calibration (pixels → in-game meters)
- [ ] Snap-to-grid mode
- [ ] Ruler tick labels when scale is calibrated

---

## Disclaimer

*Ficsit* and *Satisfactory* are trademarks of Coffee Stain Studios. This is an unofficial fan tool and is not affiliated with or endorsed by Coffee Stain Studios.

---

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/rivasdiego-dev/satisfactory-network-planner).
