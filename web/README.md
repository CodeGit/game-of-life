# Game of Life

Implementation of Conway's game of life as a progressive web app

## Getting started

## Dev setup

### TypeScript version

TypeScript is pinned to an exact 6.x version (currently `6.0.3`) rather than the latest 7.x. Do not upgrade it with `pnpm update` or by changing the version range to `^` or `~`.

- TypeScript 7.0 has known bugs that affect this project.
- `typescript-eslint` only declares support for TypeScript below 6.1, so 6.0.x also avoids a peer dependency warning.

This limitation should be resolved when Microsoft releases TypeScript 7.1. At that point, remove the pin and check that `typescript-eslint` supports 7.x before upgrading.

To install or change the pinned version, use `pnpm add -D --save-exact typescript@<version>`.
