import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_COLS } from '@/engine/defaults';
import { renderWithMantine } from '@/test-utils';
import { MAX_COLUMN_WIDTH } from '@/ui/layout';
import { MODE_MESSAGES, MODE } from '@/game/mode';
import App from './App';

async function startGame(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText('Game'));
  await user.click(await screen.findByText('New Game'));
  await user.click(await screen.findByRole('button', { name: /submit|start/i }));
}

describe('App', () => {
  it('shows the title', () => {
    renderWithMantine(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/game of life/i);
  });

  it('starts with no game and the ready message', () => {
    const { container } = renderWithMantine(<App />);
    expect(container.querySelector('canvas')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText(MODE_MESSAGES[MODE.GAME_READY])).toBeInTheDocument();
  });

  it('Game > New Game opens the form', async () => {
    const user = userEvent.setup();
    renderWithMantine(<App />);
    await user.click(screen.getByText('Game'));
    await user.click(await screen.findByText('New Game'));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('Help > About opens the About box, and closing it leaves no dialog', async () => {
    const user = userEvent.setup();
    renderWithMantine(<App />);
    await user.click(screen.getByText('Help'));
    await user.click(await screen.findByText('About'));
    expect(await screen.findByRole('dialog', { name: 'About' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('Cancel closes the form without starting a game', async () => {
    const user = userEvent.setup();
    const { container } = renderWithMantine(<App />);
    await user.click(screen.getByText('Game'));
    await user.click(await screen.findByText('New Game'));
    await user.click(await screen.findByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('starting a game closes the form and shows the board', async () => {
    const user = userEvent.setup();
    const { container } = renderWithMantine(<App />);
    await startGame(user);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    // The default world is square, so the canvas is square and a whole number of cells wide.
    const width = Number(canvas?.getAttribute('width'));
    expect(width).toBeGreaterThan(0);
    expect(width % DEFAULT_COLS).toBe(0);
    expect(canvas).toHaveAttribute('height', String(width));
  });

  it('Game > End Game removes the board', async () => {
    const user = userEvent.setup();
    const { container } = renderWithMantine(<App />);
    await startGame(user);
    await waitFor(() => expect(container.querySelector('canvas')).not.toBeNull());
    await user.click(screen.getByText('Game'));
    await user.click(await screen.findByText('End Game'));
    await waitFor(() => expect(container.querySelector('canvas')).toBeNull());
  });

  it('Step moves the game on one generation', async () => {
    const user = userEvent.setup();
    renderWithMantine(<App />);
    expect(screen.getByText('Generation -')).toBeInTheDocument();
    await startGame(user);
    expect(await screen.findByText('Generation 0')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Step' }));
    expect(screen.getByText('Generation 1')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Step' }));
    expect(screen.getByText('Generation 2')).toBeInTheDocument();
  });

  it('the play bar is disabled until a game starts', async () => {
    const user = userEvent.setup();
    renderWithMantine(<App />);
    expect(screen.getByRole('button', { name: 'Step' })).toBeDisabled();
    await startGame(user);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Step' })).toBeEnabled());
  });

  it('Game > End Game disables the play bar again', async () => {
    const user = userEvent.setup();
    renderWithMantine(<App />);
    await startGame(user);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Step' })).toBeEnabled());
    await user.click(screen.getByText('Game'));
    await user.click(await screen.findByText('End Game'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Step' })).toBeDisabled());
  });

  describe('playing', () => {
    afterEach(() => vi.useRealTimers());

    it('Play runs the game and Pause stops it', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithMantine(<App />);
      await startGame(user);
      await waitFor(() => expect(screen.getByRole('button', { name: 'Play' })).toBeEnabled());

      await user.click(screen.getByRole('button', { name: 'Play' }));
      expect(screen.getByText(MODE_MESSAGES[MODE.GAME_RUNNING])).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Step' })).toBeDisabled();
      await act(async () => void vi.advanceTimersByTime(3000));
      expect(screen.queryByText('Generation 0')).toBeNull();

      await user.click(screen.getByRole('button', { name: 'Pause' }));
      expect(screen.getByText(MODE_MESSAGES[MODE.GAME_PAUSED])).toBeInTheDocument();
      const paused = screen.getByText(/^Generation \d+$/).textContent;
      await act(async () => void vi.advanceTimersByTime(3000));
      expect(screen.getByText(/^Generation \d+$/).textContent).toBe(paused);
    });

    it('Reset goes back to generation 0 and the ready message', async () => {
      const user = userEvent.setup();
      renderWithMantine(<App />);
      await startGame(user);
      await waitFor(() => expect(screen.getByRole('button', { name: 'Step' })).toBeEnabled());
      await user.click(screen.getByRole('button', { name: 'Step' }));
      await user.click(screen.getByRole('button', { name: 'Step' }));
      expect(screen.getByText('Generation 2')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Reset' }));
      expect(screen.getByText('Generation 0')).toBeInTheDocument();
      expect(screen.getByText(MODE_MESSAGES[MODE.GAME_READY])).toBeInTheDocument();
    });
  });

  describe('zoom', () => {
    const canvasWidth = (container: HTMLElement) =>
      Number(container.querySelector('canvas')?.getAttribute('width'));
    // The width of the column the header, board and footer share, which Mantine sets in rem.
    const columnWidth = () => {
      const footer = document.querySelector('footer [class*="Container"]');
      const rem = /calc\(([\d.]+)rem/.exec(footer?.getAttribute('style') ?? '')?.[1];
      return Number(rem) * 16;
    };
    const press = (user: ReturnType<typeof userEvent.setup>, name: string) =>
      user.click(screen.getByRole('button', { name }));
    const started = async () => {
      const user = userEvent.setup();
      const { container } = renderWithMantine(<App />);
      await startGame(user);
      await waitFor(() => expect(container.querySelector('canvas')).not.toBeNull());
      return { user, container };
    };
    const original = { width: window.innerWidth, height: window.innerHeight };
    afterEach(() => {
      window.innerWidth = original.width;
      window.innerHeight = original.height;
    });

    it('is off until a game starts', () => {
      renderWithMantine(<App />);
      expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
    });

    it('Zoom in makes the board bigger and Zoom out makes it smaller', async () => {
      const { user, container } = await started();
      const fitted = canvasWidth(container);
      await press(user, 'Zoom in');
      expect(canvasWidth(container)).toBeGreaterThan(fitted);
      await press(user, 'Zoom out');
      await press(user, 'Zoom out');
      expect(canvasWidth(container)).toBeLessThan(fitted);
    });

    it('keeps the board square', async () => {
      const { user, container } = await started();
      await press(user, 'Zoom in');
      const canvas = container.querySelector('canvas');
      expect(canvas?.getAttribute('height')).toBe(canvas?.getAttribute('width'));
    });

    it('Fit goes back to the fitted size', async () => {
      const { user, container } = await started();
      const fitted = canvasWidth(container);
      await press(user, 'Zoom in');
      await press(user, 'Fit to window');
      expect(canvasWidth(container)).toBe(fitted);
    });

    it('a new game is fitted again, whatever the last one was zoomed to', async () => {
      const { user, container } = await started();
      const fitted = canvasWidth(container);
      await press(user, 'Zoom in');
      await startGame(user);
      await waitFor(() => expect(canvasWidth(container)).toBe(fitted));
    });

    it('does not make the header and footer wider than the window when the board is', async () => {
      window.innerWidth = 600; // 568 pixels once the page padding is taken off
      window.innerHeight = 700;
      const { user, container } = await started();
      for (let i = 0; i < 3; i++) await press(user, 'Zoom in');
      expect(canvasWidth(container)).toBeGreaterThan(568); // the board is wider than the window
      expect(columnWidth()).toBe(568); // but the column is not
    });

    it('does not make the header and footer wider than the maximum on a big screen', async () => {
      window.innerWidth = 1600;
      window.innerHeight = 1000;
      const { user, container } = await started();
      for (let i = 0; i < 8; i++) await press(user, 'Zoom in');
      expect(canvasWidth(container)).toBeGreaterThan(MAX_COLUMN_WIDTH); // a very big board
      expect(columnWidth()).toBe(MAX_COLUMN_WIDTH); // in a column of limited width
    });

    it('keeps the header and footer the same width however much the board is zoomed', async () => {
      window.innerWidth = 1600;
      window.innerHeight = 1000;
      const { user } = await started();
      await press(user, 'Zoom in');
      await press(user, 'Zoom in');
      const before = columnWidth();
      for (let i = 0; i < 6; i++) await press(user, 'Zoom in'); // already past the maximum
      expect(columnWidth()).toBe(before);
    });
  });
});
