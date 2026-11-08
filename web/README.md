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

- `types.ts`: `World`, `Rules` and the `RULE_TYPE` values (`CIRCLE`, `SQUARE`, `DIAMOND`, `USER_DEFINED`).
- `grid.ts`: `createWorld` and `updateWorld`.
- `rng.ts`: a small seeded random number generator (mulberry32), because JavaScript has no built-in seedable one.

**Data model**

- A world is two flat `Uint8Array`s (`main` and `buffer`, indexed `row * cols + col`) plus its size and a `wrap` flag. A cell is `0` (dead) or the id of the player who owns it (1 to 255), so colours come from the owner.
- `updateWorld` reads `main`, writes every cell of `buffer`, then swaps the two. No cells are copied.
- An optional age layer (`ageGrid`) is kept separately from ownership. Survivors age by one each generation up to `maxAge`; newborn and dead cells reset to 0. Colour is worked out when drawing, not stored.

**Rules**

- One ruleset per world. Rules are totalistic: only the count of live neighbours matters, not where they are. `Birth` and `Survival` are lists of counts (Conway's Life is `Birth: [3]`, `Survival: [2, 3]`).
- The neighbourhood shape is `SQUARE` (every cell within `range`), `CIRCLE` (`r² + c² <= range²`) or `DIAMOND` (`|r| + |c| <= range`). A shape is a small test function on the offset, so adding one is a single function. Circle and diamond are identical at ranges 1 and 2 and differ from range 3.
- A live cell survives if its count is in `Survival` and keeps its owner. A dead cell is born if its count is in `Birth` and takes the majority owner among its neighbours. Ties are broken with the world's seeded RNG, which is drawn from only when there is a tie, so a seed reproduces a game exactly.

**Tests**

Tests describe worlds as pictures (`.` dead, `#` player 1, digits for other players) using the helpers in `testing.ts`.

- `shapes.test.ts`: the shape of each neighbourhood.
- `neighbours.test.ts`: neighbour counts, wrapping and per-player tallies.
- `update.test.ts`: still lifes, a blinker, a glider on a wrapped grid, edges, ownership, tie-breaks, rule shapes and age.

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
