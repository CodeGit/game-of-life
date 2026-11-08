# TODO

## v1
- [x] Project scaffold (React + TypeScript + Vite, PWA, lint, formatting, tests, pre-commit hooks)
- [x] Check the PWA in a browser (install, offline) and add the "new version available" prompt
- [x] Dev workflow: `dev` branch, CI workflow, Dependabot (targeting `dev`) and a ruleset protecting `main` (required checks: ESLint, Prettier, typecheck, tests, build)
- [x] Simulation engine core (`web/src/engine/`): flat `Uint8Array` grids with double buffering, per-world wrap, player ownership with seeded random tie-breaks, optional age layer, circle/square/diamond neighbourhoods, tests
- [ ] Engine follow-ups: reject `range` above `rangeLimit`, parse B/S strings (e.g. `B3/S23`) into `Rules`, `USER_DEFINED` neighbourhood, default `maxAge` when age is enabled
- [ ] Canvas grid: edit cells, run/pause/step
- [ ] Built-in patterns and presets; RLE import/export
- [ ] Optional player login
- [ ] Save and load worlds per player (guests use local storage)
- [ ] Share worlds via link
- [x] Containerise the static app (multi-stage Containerfile, Caddy)
- [ ] Containerise the API and database (Compose or Quadlet units)
- [x] CI: GitHub Actions on pull requests and pushes to `dev` and `main`
- [x] CD: publish the image to GHCR on merge to `main`
- [x] CD: deploy the image (Quadlet unit with a healthcheck, updated hourly by `podman auto-update`; live at https://life.boglabob.com)

## Later
- [ ] Cloud deployment
- [ ] Multiplayer: combine biomes
