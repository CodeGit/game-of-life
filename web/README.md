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

## Dev setup

### TypeScript version

TypeScript is pinned to exactly `6.0.3` (no `~` or `^` in `package.json`) rather than the latest 7.x. Do not upgrade it with `pnpm update`, and do not loosen the version range. Dependency bots should ignore `typescript` until 7.1.

- TypeScript 7.0 has known bugs that affect this project.
- `typescript-eslint` only declares support for TypeScript below 6.1, so staying on 6.0.3 also avoids a peer dependency warning.

This limitation should be resolved when Microsoft releases TypeScript 7.1. The pin is temporary: once 7.1 is out and `typescript-eslint` supports 7.x (check with `pnpm peers check`), upgrade, switch back to a normal version range, and let dependency bots update TypeScript again.

To install or change the pinned version, use `pnpm add -D --save-exact typescript@<version>`. `package.json` should show the bare version, `"typescript": "6.0.3"`.
