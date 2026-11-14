import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithMantine } from '@/test-utils';
import { NewGameModal } from './NewGameModal';

function renderModal(opened: boolean) {
  const onClose = vi.fn();
  const onStart = vi.fn();
  renderWithMantine(<NewGameModal opened={opened} onClose={onClose} onStart={onStart} />);
  return { onClose, onStart, user: userEvent.setup() };
}

describe('NewGameModal', () => {
  it('shows nothing while closed', () => {
    renderModal(false);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows a dialog titled New Game while open', () => {
    renderModal(true);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('New Game')).toBeInTheDocument();
  });

  it('starts a game with the default options', async () => {
    const { onStart, onClose, user } = renderModal(true);
    await user.click(screen.getByRole('button', { name: /submit|start/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ rows: 20, cols: 20, wrap: true, age: true, players: 1 }),
    );
    expect(onClose).not.toHaveBeenCalled(); // closing is up to whoever starts the game
  });

  it('gives the options an id, a lifespan and a density', async () => {
    const { onStart, user } = renderModal(true);
    await user.click(screen.getByRole('button', { name: /submit|start/i }));
    const options = onStart.mock.calls[0]?.[0];
    expect(options.id).toBeTruthy();
    expect(options.lifespan).toBeGreaterThan(0);
    expect(options.density).toBeGreaterThanOrEqual(0);
    expect(options.density).toBeLessThanOrEqual(1);
  });

  it('Cancel closes the dialog without starting a game', async () => {
    const { onStart, onClose, user } = renderModal(true);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();
  });

  it('has a Reset button that does not start or close anything', async () => {
    const { onStart, onClose, user } = renderModal(true);
    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(onStart).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
