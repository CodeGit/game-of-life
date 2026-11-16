import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithMantine } from '@/test-utils';
import { AboutModal } from './AboutModal';

describe('AboutModal', () => {
  it('shows nothing while closed', () => {
    renderWithMantine(<AboutModal opened={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the author and the version', () => {
    renderWithMantine(<AboutModal opened onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByText('By Matloob Qureshi')).toBeInTheDocument();
    expect(screen.getByText(/^Version \d+\.\d+\.\d+/)).toBeInTheDocument();
  });

  it('links to the repository and to a page about the Game of Life', () => {
    renderWithMantine(<AboutModal opened onClose={vi.fn()} />);
    expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute(
      'href',
      'https://github.com/CodeGit/game-of-life',
    );
    expect(screen.getByRole('link', { name: /conway/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wikipedia.org'),
    );
  });

  it('opens its links in a new tab, without giving the page access to this one', () => {
    renderWithMantine(<AboutModal opened onClose={vi.fn()} />);
    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    }
  });

  it('asks to close when the close button is pressed', async () => {
    const onClose = vi.fn();
    renderWithMantine(<AboutModal opened onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
