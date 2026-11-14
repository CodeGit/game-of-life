import { AppShell } from '@mantine/core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithMantine } from '@/test-utils';
import { Header } from './header';
import { MENU_ACTIONS } from './menuActions';

function renderHeader() {
  const onAction = vi.fn();
  renderWithMantine(
    <AppShell header={{ height: 88 }}>
      <Header onAction={onAction} columnWidth={500} />
    </AppShell>,
  );
  return { onAction, user: userEvent.setup() };
}

describe('Header', () => {
  it('shows the title as the page heading', () => {
    renderHeader();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/game of life/i);
  });

  it('shows the Game and File menus', () => {
    renderHeader();
    expect(screen.getByText('Game')).toBeInTheDocument();
    expect(screen.getByText('File')).toBeInTheDocument();
  });

  it('does not report an action until something is chosen', () => {
    const { onAction } = renderHeader();
    expect(onAction).not.toHaveBeenCalled();
  });

  it.each([
    ['Game', 'New Game', MENU_ACTIONS.NEW_GAME],
    ['Game', 'End Game', MENU_ACTIONS.END_GAME],
    ['File', 'Save', MENU_ACTIONS.SAVE_GAME],
    ['File', 'Load', MENU_ACTIONS.LOAD_GAME],
  ])('%s > %s reports %s', async (menu, item, action) => {
    const { onAction, user } = renderHeader();
    await user.click(screen.getByText(menu));
    await user.click(await screen.findByText(item));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith(action);
  });
});
