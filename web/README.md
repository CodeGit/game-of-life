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

- `main` is always releasable; `dev` is where finished work is integrated.
- Create a `feature/<topic>` branch from `dev`, and open a pull request back into `dev`.
- A pull request can only merge when ESLint, Prettier, typecheck, tests and build all pass.
- When `dev` is ready, open a pull request from `dev` into `main`.

A [lefthook](https://lefthook.dev) pre-commit hook runs the same checks locally (it installs with `pnpm install`). CI is the authoritative gate, since `git commit --no-verify` skips the hook.

_The branch protection and CI workflow are being set up; until they are in place, treat the above as the intended process._

## Dev setup

### TypeScript version

TypeScript is pinned to exactly `6.0.3` (no `~` or `^` in `package.json`) rather than the latest 7.x. Do not upgrade it with `pnpm update`, and do not loosen the version range. Dependency bots should ignore `typescript` until 7.1.

- TypeScript 7.0 has known bugs that affect this project.
- `typescript-eslint` only declares support for TypeScript below 6.1, so staying on 6.0.3 also avoids a peer dependency warning.

This limitation should be resolved when Microsoft releases TypeScript 7.1. At that point, remove the pin and check that `typescript-eslint` supports 7.x before upgrading.

To install or change the pinned version, use `pnpm add -D --save-exact typescript@<version>`. `package.json` should show the bare version, `"typescript": "6.0.3"`.
