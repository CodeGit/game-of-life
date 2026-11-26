# Game of Life

Implementation of Conway's game of life as a progressive web app

## Getting started

Requires Node 22 and pnpm (`corepack enable` picks up the version in `package.json`).

```bash
cd web
pnpm install
pnpm dev
```

The app runs at the URL Vite prints. The service worker only runs in a production build, so check PWA behaviour with `pnpm build && pnpm preview`.

### Scripts

| Command             | What it does                      |
| ------------------- | --------------------------------- |
| `pnpm dev`          | Start the dev server              |
| `pnpm build`        | Type-check and build for release  |
| `pnpm preview`      | Serve the production build        |
| `pnpm lint`         | Run ESLint                        |
| `pnpm format`       | Format files with Prettier        |
| `pnpm format:check` | Check formatting without changing |
| `pnpm typecheck`    | Type-check without emitting       |
| `pnpm test`         | Run the tests once                |
| `pnpm test:watch`   | Run the tests in watch mode       |

## Workflow

- `main` is always releasable and protected. `dev` is the working branch, where changes are committed and pushed.
- For larger work, branch from `dev` (`feature/<topic>`) and merge back when ready.
- To release, open a pull request from `dev` into `main`. It can only merge when ESLint, Prettier, typecheck, tests and build all pass.
- Merge `dev` into `main` with a merge commit (not squash), so the branches don't diverge.

A [lefthook](https://lefthook.dev) pre-commit hook runs the same checks locally (it installs with `pnpm install`). CI runs on every push to `dev` and `main`, and is the authoritative gate, since `git commit --no-verify` skips the hook.

## Game engine

The simulation lives in `src/engine/` as plain TypeScript with no React, so it can be tested on its own and later moved into a Web Worker.

- `types.ts`: `WorldOptions` (what a new game is created from), `World` (the running state), `Rules` and the `RULE_TYPE` values (`CIRCLE`, `SQUARE`, `DIAMOND`, `USER_DEFINED`).
- `world.ts`: `createWorld`, `randomiseWorld`, `updateWorld`, and the neighbourhood shapes.
- `rules.ts`: the preset rules (`RULE_PRESETS`, `CONWAY`) and `parseRuleString` / `ruleString` for `B3/S23` notation.
- `limits.ts`: the smallest and largest world size and lifespan, shared by the engine and the forms.
- `rng.ts`: a small seeded random number generator (mulberry32), because JavaScript has no built-in seedable one.
- `testing.ts`: helpers for tests (not part of the app).

**Data model**

- A world is two flat `Uint8Array`s (`main` and `buffer`, indexed `row * cols + col`) plus its size, a `wrap` flag and a `generation` count. A cell is `0` (dead) or the id of the player who owns it (1 to 255), so colours come from the owner.
- `updateWorld` reads `main`, writes every cell of `buffer`, swaps the two and adds one to `generation`. No cells are copied.
- An optional age layer (`ageGrid`) is kept separately from ownership. Survivors age by one each generation, and a cell dies when its age reaches `lifespan` (at most 255). Newborn and dead cells reset to 0. Colour is worked out when drawing, not stored.
- `createWorld(options)` can fill the world at random (`density`, `colours`). The random fill uses the seeded RNG and only touches dead cells, so a seed reproduces a game exactly.

**Rules**

- Rules are not part of a `World`: `updateWorld(world, rules)` takes them as an argument, so they can change between any two generations.
- Rules are totalistic: only the count of live neighbours matters, not where they are. `Birth` and `Survival` are lists of counts (Conway's Life is `Birth: [3]`, `Survival: [2, 3]`, written `B3/S23`).
- `rules.ts` has ten well-known presets (Conway, HighLife, Day & Night, Seeds, Life without Death, 2x2, Maze, Replicator, Diamoeba and Anneal), all using the 8 surrounding cells.
- The neighbourhood shape is `SQUARE` (every cell within `range`), `CIRCLE` (`r² + c² <= range²`) or `DIAMOND` (`|r| + |c| <= range`). A shape is a small test function on the offset, so adding one is a single function. Circle and diamond are identical at ranges 1 and 2 and differ from range 3. Trying large circle and diamond neighbourhoods on random boards mostly gave noise or extinction, so there are no presets for them.
- A live cell survives if its count is in `Survival` and keeps its owner. A dead cell is born if its count is in `Birth` and takes the majority owner among its neighbours. Ties are broken with the world's seeded RNG, which is drawn from only when there is a tie.

**Tests**

Tests describe worlds as pictures (`.` dead, `#` colour 1, digits for other colours) using the helpers in `testing.ts`.

- `create.test.ts`: `createWorld`, density, seeds and `randomiseWorld`.
- `update.test.ts`: still lifes, a blinker, a glider on a wrapped grid, edges, ownership, tie-breaks, rule shapes, age and the generation count.
- `neighbours.test.ts` and `shapes.test.ts`: neighbour counts, wrapping, per-player tallies and the shape of each neighbourhood.
- `rules.test.ts`: the `B3/S23` parser, the presets, and changing rules mid-game.

## User interface

The UI uses [Mantine](https://mantine.dev) (`AppShell` for the layout) and [Phosphor](https://phosphoricons.com) icons. Player colours are separate from the Mantine theme: they come from `Palette` in `src/ui/palette.ts` (OKLCH, 8 colours with 8 age shades each).

- `src/game/`: game state with no markup. `useGameMode` is a custom hook holding the world, the mode, the rules and the New game form's visibility; `mode.ts` defines the modes.
- `src/ui/`: `header/` (title and menu bar), `newgame/` (the New game form), `grid/` (the canvas), `footer/` (the play bar). Components take props down and report events up (for example the header's single `onAction` callback), so they hold no game logic.

**State.** A game's options (size, wrap, age, lifespan, density, seed) cannot change while it is running, so the world is created once, when a game starts, from the New game form. The rules can change at any time and apply from the next step. The world is mutated in place, so after each step the hook stores a shallow copy (`setWorld({ ...world })`): the copy shares the cell arrays and gives React a new reference to redraw from. The generation count lives in the world, not in React state. Anything that can be calculated from state, such as the message for a mode, is worked out while rendering, not stored.

**Modes.** A mode describes a game that exists; "no game" is simply `world === null`.

| Mode       | Meaning                                              |
| ---------- | ---------------------------------------------------- |
| `ready`    | A world exists and nothing has run yet               |
| `running`  | The timer is stepping the game                       |
| `paused`   | Stopped between generations                          |
| `complete` | The game has finished and the final board is showing |

A new game starts in `ready`, not running, so the player can look at the board, choose rules and speed and place cells first. Which play bar buttons are enabled follows from the mode:

| State    | Step | Play | Pause | Stop |
| -------- | ---- | ---- | ----- | ---- |
| no game  | off  | off  | off   | off  |
| ready    | on   | on   | off   | off  |
| running  | off  | off  | on    | on   |
| paused   | on   | on   | off   | on   |
| complete | off  | off  | off   | off  |

**Layout.** One centred column holds the header, the board and the footer, and it is as wide as the board (never narrower than the title needs).

```
┌─────────────────────────────────────────────┐
│               Game of Life                  │  header: title,
│ Game  File                                  │  then the menu bar
├─────────────────────────────────────────────┤
│                                             │
│                   canvas                    │
│                                             │
├─────────────────────────────────────────────┤
│ ⏹ ⏸ ⏭ ▶   speed ───●───                     │  footer: play bar,
│ [rules ▾]                       − ◯ +       │  rules and zoom,
│ Generation 42              Game is paused   │  then status
└─────────────────────────────────────────────┘
```

- **Header:** the title and a menu bar. Game has New Game and End Game; File has Save and Load. These are infrequent actions.
- **Footer (play bar):** stop, pause, step and play, the speed slider, the rule picker, zoom, the generation count and the mode message. These are used constantly and act on the board, so they sit next to it.
- **New game form:** a modal opened from Game > New Game, not a panel. It is used once per game and blocks the rest of the UI while open. It has the world name, size, wrap, ageing and lifespan, and the density of random starting cells.
- **Sidebar** (planned): context panels that change with the game, such as live cells per player, the player's colour and remaining budget, and later the player list and invite.

**Built so far:** the header and menu, the New game form, drawing the board, and stepping one generation. The play bar's layout is in place, but only Step is connected; Run, Pause, Stop, speed, zoom and the rule picker are not.

**Planned**

- Run and pause on a timer with a speed setting. Stop resets the game: it recreates the world from the options and seed the game started with (the same starting board) and keeps the current rules, so a user can compare rules on the same start. Cells placed during play are cleared and placement budgets are restored. The hook keeps the `WorldOptions` for this.
- Choosing a preset rule from the footer, and later typing a custom rule (`B3/S23`), with checks on the counts.
- Zoom and fit-to-width (the cell size is fixed at 20 pixels for now).
- A library of named patterns (block, glider, glider gun and so on) that can be placed on the board.
- A `GameResult` for a completed game: the reason it ended, the scores and the winner.
- Randomising is a setup option in New game (density and seed), not a mid-game action. Non-destructive: it only fills dead cells.
- Each player gets a fixed budget of new cells to place, by hand, at random or as patterns, which acts as a catch-up mechanism. The budget lives in a game layer above the engine, not in `World`.
- Placing happens while paused. The game can pause by hand or automatically at a checkpoint (every N generations, or on a condition) for a timed placement phase.
- Save and Load.

**UI tests.** Component tests use Testing Library with `renderWithMantine` from `src/test-utils.tsx`. `src/test-setup.ts` supplies what jsdom lacks (`matchMedia`, `ResizeObserver`, a canvas context) and unmounts components after each test.

## Container image

The app is built into a small image with a multi-stage `web/Container/Containerfile`: a Node stage runs `pnpm build`, then a `caddy:2-alpine` stage serves the files from `/srv` using `web/Container/Caddyfile`. Image names are fully qualified (`docker.io/library/...`) because Podman does not resolve short names unless a search registry is configured.

- `Caddyfile`: plain HTTP on port 80 (TLS is left to whatever proxies in front). Everything is sent with `Cache-Control: no-cache`, except the hashed `/assets/*` files, which are `immutable` for a year. Unknown paths fall back to `index.html`. This is what lets the service worker update prompt work.
- `.dockerignore` keeps the host `node_modules` and `dist` out of the build.
- The install uses `--ignore-scripts` because the `prepare` script runs `lefthook install`, which fails without a git repo.

Build and run from `web/` (the build context is `web/`, not `web/Container/`):

```bash
podman build -f Container/Containerfile -t life-web .
podman run --rm -p 8080:80 life-web
```

`python3 Container/build-from-main.py` switches to `main`, pulls, and runs the same build. It refuses to run with uncommitted changes.

### Release

`.github/workflows/release.yml` runs on every push to `main` (and by hand from the Actions tab). It builds the image for `linux/amd64` and pushes it to GHCR as `ghcr.io/codegit/game-of-life`, tagged `latest` and with the full commit SHA (use the SHA tag to roll back). It uses the built-in `GITHUB_TOKEN`, so there are no secrets to set up. The package is public, so it can be pulled without logging in:

```bash
podman pull ghcr.io/codegit/game-of-life:latest
```

Old image versions are not cleaned up automatically.

## Dev setup

### TypeScript version

TypeScript is pinned to exactly `6.0.3` (no `~` or `^` in `package.json`) rather than the latest 7.x. Do not upgrade it with `pnpm update`, and do not loosen the version range. Dependency bots should ignore `typescript` until 7.1.

- TypeScript 7.0 has known bugs that affect this project.
- `typescript-eslint` only declares support for TypeScript below 6.1, so staying on 6.0.3 also avoids a peer dependency warning.

This limitation should be resolved when Microsoft releases TypeScript 7.1. The pin is temporary: once 7.1 is out and `typescript-eslint` supports 7.x (check with `pnpm peers check`), upgrade, switch back to a normal version range, and let dependency bots update TypeScript again.

To install or change the pinned version, use `pnpm add -D --save-exact typescript@<version>`. `package.json` should show the bare version, `"typescript": "6.0.3"`.

### Imports

`@/` is an alias for `src/`, so a file is imported the same way from anywhere, and moving it never breaks its importers:

```ts
import { Palette } from '@/ui/palette';
```

Use `@/...` to import across folders, and a relative path (`./draw`) for files next to each other.

The alias has to be set in two places, which must agree: `paths` in `tsconfig.app.json` (for the type checker and editor) and `resolve.alias` in `vite.config.ts` (for the build and Vitest). If only one is set, either `pnpm typecheck` or `pnpm build` and `pnpm test` will fail.

### GitHub repository setup

These settings live in the GitHub UI, not in the repository, so a fresh fork or a new repo needs them redone by hand.

1. **Repository visibility:** public. Branch protection and required status checks need a public repository or a paid plan.
2. **Branches:** create `dev` from `main` and push it. Leave `main` as the default branch.
3. **CI must run once first:** open a pull request (or push to `dev`) so the five checks exist. A required check can only be chosen in the ruleset after it has run at least once.
4. **Ruleset for `main` only** (Settings, then Rules, then Rulesets, then New branch ruleset). Target the `main` branch and enable:
   - Require a pull request before merging, with 0 required approvals (solo project).
   - Require status checks to pass, and add `lint`, `format:check`, `typecheck`, `test` and `build`.
   - Block force pushes.
   - Restrict deletions.
   - Leave "Require branches to be up to date before merging" **off**, or every release shows as out of date after the merge commit.
5. **Do not protect `dev`.** Commits and pushes go straight to it.
6. **Pull request settings** (Settings, then General, then Pull Requests):
   - Allow merge commits (used for `dev` into `main`).
   - Leave "Automatically delete head branches" **off**, or `dev` is deleted after each release.
7. **Dependabot:** `.github/dependabot.yml` is already in the repo and targets `dev`. Check that Dependabot version updates are enabled under Settings, then Advanced Security (the name varies by GitHub version).
8. **Verify:** a direct `git push` to `main` should be rejected, and a pull request with a failing check should have its merge button blocked.

9. **Optional, auto-merge:** tick "Allow auto-merge" under Settings, then General, then Pull Requests. A release PR can then be set to merge itself (merge commit) as soon as the required checks pass.
10. **Image visibility:** the first push to GHCR (see Container image) creates the package. It inherited the public visibility of this repository, so no change was needed. If it ever shows as private, set it under the package's settings (Danger Zone, then Change visibility), so a server can pull it without logging in.
