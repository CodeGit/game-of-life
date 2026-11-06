# TODO

## v1
- [x] Project scaffold (React + TypeScript + Vite, PWA, lint, formatting, tests, pre-commit hooks)
- [ ] Check the PWA in a browser (install, offline) and add the "new version available" prompt
- [x] Dev workflow: `dev` branch, CI workflow, Dependabot (targeting `dev`) and a ruleset protecting `main` (required checks: ESLint, Prettier, typecheck, tests, build)
- [ ] Simulation engine with configurable rules (B/S) and a per-world wrap option
- [ ] Canvas grid: edit cells, run/pause/step
- [ ] Built-in patterns and presets; RLE import/export
- [ ] Optional player login
- [ ] Save and load worlds per player (guests use local storage)
- [ ] Share worlds via link
- [ ] Containerise the app with its database
- [x] CI: GitHub Actions on pull requests and pushes to `dev` and `main`
- [ ] CD: publish image and deploy

## Later
- [ ] Cloud deployment
- [ ] Multiplayer: combine biomes
