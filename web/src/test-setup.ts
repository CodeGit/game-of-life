// Runs before every test file (see `test.setupFiles` in vite.config.ts).
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Vitest has no globals, so Testing Library cannot unmount components by itself.
afterEach(cleanup);

// jsdom has no matchMedia, ResizeObserver or scrollIntoView, which Mantine uses.
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }) as unknown as MediaQueryList;

Element.prototype.scrollIntoView ??= () => {};

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// jsdom cannot draw on a canvas, and logs an error when asked to. Tests that
// check drawing replace this with their own fake context.
vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
