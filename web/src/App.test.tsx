import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithMantine } from '@/test-utils';
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
    // The default world is 20 x 20 cells, so the canvas is square and a whole number of cells wide.
    const width = Number(canvas?.getAttribute('width'));
    expect(width).toBeGreaterThan(0);
    expect(width % 20).toBe(0);
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
});
