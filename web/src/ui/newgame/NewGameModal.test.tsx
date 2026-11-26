import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_COLS, DEFAULT_ROWS } from '@/engine/defaults';
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
      expect.objectContaining({
        rows: DEFAULT_ROWS,
        cols: DEFAULT_COLS,
        wrap: true,
        age: true,
        colours: 1,
      }),
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

  it('has a labelled Close button that closes without starting a game', async () => {
    const { onStart, onClose, user } = renderModal(true);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();
  });

  it('offers one to eight colours, starting with one', () => {
    renderModal(true);
    const select = screen.getByRole('combobox', { name: /world colours/i });
    expect(select).toHaveValue('1');
    const choices = within(select)
      .getAllByRole('option')
      .map((option) => option.textContent);
    expect(choices).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
  });

  it('passes the chosen number of colours to onStart, as a number', async () => {
    const { onStart, user } = renderModal(true);
    await user.selectOptions(screen.getByRole('combobox', { name: /world colours/i }), '3');
    await user.click(screen.getByRole('button', { name: /submit|start/i }));
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ colours: 3 }));
  });

  it('has a Reset button that does not start or close anything', async () => {
    const { onStart, onClose, user } = renderModal(true);
    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(onStart).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('NewGameModal: fields', () => {
  it('shows the default values', () => {
    renderModal(true);
    expect(screen.getByLabelText(/world name/i)).toHaveValue('The World');
    expect(screen.getByLabelText('Rows')).toHaveValue(String(DEFAULT_ROWS));
    expect(screen.getByLabelText('Columns')).toHaveValue(String(DEFAULT_COLS));
    expect(screen.getByLabelText(/wraps around/i)).toBeChecked();
    expect(screen.getByLabelText(/cells age/i)).toBeChecked();
  });

  it('passes edited values to onStart', async () => {
    const { onStart, user } = renderModal(true);
    const name = screen.getByLabelText(/world name/i);
    await user.clear(name);
    await user.type(name, 'Mars');
    const rows = screen.getByLabelText('Rows');
    await user.clear(rows);
    await user.type(rows, '12');
    const cols = screen.getByLabelText('Columns');
    await user.clear(cols);
    await user.type(cols, '30');
    await user.click(screen.getByLabelText(/wraps around/i));
    await user.click(screen.getByLabelText(/cells age/i));
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'Mars', rows: 12, cols: 30, wrap: false, age: false }),
    );
  });

  it('disables the lifespan slider while cells do not age', async () => {
    const { user } = renderModal(true);
    const lifespan = () => screen.getAllByRole('slider')[0];
    expect(lifespan()).not.toHaveAttribute('data-disabled');
    await user.click(screen.getByLabelText(/cells age/i));
    expect(lifespan()).toHaveAttribute('data-disabled');
    await user.click(screen.getByLabelText(/cells age/i));
    expect(lifespan()).not.toHaveAttribute('data-disabled');
  });

  it('will not start a game without a name', async () => {
    const { onStart, user } = renderModal(true);
    await user.clear(screen.getByLabelText(/world name/i));
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(onStart).not.toHaveBeenCalled();
    expect(screen.getByText(/must have a name/i)).toBeInTheDocument();
  });

  it('treats a name of only spaces as missing', async () => {
    const { onStart, user } = renderModal(true);
    const name = screen.getByLabelText(/world name/i);
    await user.clear(name);
    await user.type(name, '   ');
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(onStart).not.toHaveBeenCalled();
  });

  it('Reset puts every field back to its default', async () => {
    const { user } = renderModal(true);
    const name = screen.getByLabelText(/world name/i);
    await user.clear(name);
    await user.type(name, 'Mars');
    const rows = screen.getByLabelText('Rows');
    await user.clear(rows);
    await user.type(rows, '12');
    await user.click(screen.getByLabelText(/wraps around/i));
    await user.click(screen.getByLabelText(/cells age/i));
    await user.selectOptions(screen.getByRole('combobox', { name: /world colours/i }), '4');
    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(name).toHaveValue('The World');
    expect(screen.getByRole('combobox', { name: /world colours/i })).toHaveValue('1');
    expect(rows).toHaveValue(String(DEFAULT_ROWS));
    expect(screen.getByLabelText(/wraps around/i)).toBeChecked();
    expect(screen.getByLabelText(/cells age/i)).toBeChecked();
    expect(screen.getAllByRole('slider')[0]).not.toHaveAttribute('data-disabled');
  });

  it('Reset clears the missing-name error', async () => {
    const { user } = renderModal(true);
    await user.clear(screen.getByLabelText(/world name/i));
    await user.click(screen.getByRole('button', { name: /submit/i }));
    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.queryByText(/must have a name/i)).toBeNull();
  });
});
