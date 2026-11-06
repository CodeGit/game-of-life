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

Still to do when image publishing is added: after the first push to GHCR, set the package to public (the package's settings, then Danger Zone, then Change visibility) so the server can pull without logging in.
