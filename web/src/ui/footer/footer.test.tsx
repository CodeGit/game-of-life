import { AppShell } from '@mantine/core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CONWAY, RULE_PRESETS, findPreset } from '@/engine/rules';
import type { Rules } from '@/engine/types';
import { MODE, MODE_MESSAGES } from '@/game/mode';
import type { Mode } from '@/game/mode';
import { renderWithMantine } from '@/test-utils';
import { Footer } from './footer';

type Overrides = { mode?: Mode; generation?: number | null; rules?: Rules; speed?: number };

function renderFooter({
  mode = MODE.GAME_READY,
  generation = 0,
  rules = CONWAY,
  speed = 50,
}: Overrides = {}) {
  const onStep = vi.fn();
  const onPlay = vi.fn();
  const onPause = vi.fn();
  const onReset = vi.fn();
  const onSpeedChange = vi.fn();
  const onRulesChange = vi.fn();
  renderWithMantine(
    <AppShell footer={{ height: 130 }}>
      <Footer
        columnWidth={500}
        mode={mode}
        generation={generation}
        rules={rules}
        speed={speed}
        onSpeedChange={onSpeedChange}
        onStep={onStep}
        onPlay={onPlay}
        onPause={onPause}
        onReset={onReset}
        onRulesChange={onRulesChange}
      />
    </AppShell>,
  );
  return {
    onStep,
    onPlay,
    onPause,
    onReset,
    onSpeedChange,
    onRulesChange,
    user: userEvent.setup(),
  };
}

const button = (name: string) => screen.getByRole('button', { name });
const rulesInput = () => screen.getByRole('combobox', { name: 'World rules' });

describe('Footer: status', () => {
  it('shows the generation', () => {
    renderFooter({ generation: 42 });
    expect(screen.getByText('Generation 42')).toBeInTheDocument();
  });

  it('shows a dash instead of a generation when there is no game', () => {
    renderFooter({ generation: null });
    expect(screen.getByText('Generation -')).toBeInTheDocument();
  });

  it('shows the message for the mode', () => {
    renderFooter({ mode: MODE.GAME_PAUSED });
    expect(screen.getByText(MODE_MESSAGES[MODE.GAME_PAUSED])).toBeInTheDocument();
  });
});

// Which buttons are enabled in each mode is decided by allowedActions, and tested there.
// These check that the footer follows it, and that each button reports the right thing.
describe('Footer: play bar', () => {
  it('enables only what the mode allows', () => {
    renderFooter({ mode: MODE.GAME_READY });
    expect(button('Step')).toBeEnabled();
    expect(button('Play')).toBeEnabled();
    expect(button('Pause')).toBeDisabled();
    expect(button('Reset')).toBeDisabled();
  });

  it('enables the other buttons while running', () => {
    renderFooter({ mode: MODE.GAME_RUNNING });
    expect(button('Step')).toBeDisabled();
    expect(button('Play')).toBeDisabled();
    expect(button('Pause')).toBeEnabled();
    expect(button('Reset')).toBeEnabled();
  });

  it('disables every button when there is no game', () => {
    renderFooter({ generation: null });
    for (const name of ['Reset', 'Pause', 'Step', 'Play']) {
      expect(button(name)).toBeDisabled();
    }
  });

  it('Step reports a step', async () => {
    const { onStep, user } = renderFooter({ mode: MODE.GAME_READY });
    await user.click(button('Step'));
    expect(onStep).toHaveBeenCalledTimes(1);
  });

  it('Play reports play', async () => {
    const { onPlay, user } = renderFooter({ mode: MODE.GAME_READY });
    await user.click(button('Play'));
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it('Pause reports pause', async () => {
    const { onPause, user } = renderFooter({ mode: MODE.GAME_RUNNING });
    await user.click(button('Pause'));
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it('Reset reports reset', async () => {
    const { onReset, user } = renderFooter({ mode: MODE.GAME_PAUSED });
    await user.click(button('Reset'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('reports nothing from a disabled button', async () => {
    const { onStep, user } = renderFooter({ mode: MODE.GAME_RUNNING });
    await user.click(button('Step'));
    expect(onStep).not.toHaveBeenCalled();
  });
});

describe('Footer: speed', () => {
  const slider = () => screen.getByRole('slider', { name: 'World speed' });

  it('shows the speed it is given', () => {
    renderFooter({ speed: 70 });
    expect(slider()).toHaveAttribute('aria-valuenow', '70');
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('reports a new speed', async () => {
    const { onSpeedChange, user } = renderFooter({ speed: 50 });
    slider().focus();
    await user.keyboard('{ArrowRight}');
    expect(onSpeedChange).toHaveBeenCalledWith(51);
  });
});

describe('Footer: rules', () => {
  it('shows the name of the current rules', () => {
    renderFooter({ rules: findPreset('highlife')!.rules });
    expect(rulesInput()).toHaveValue('HighLife');
  });

  it('shows nothing selected for rules that are not a preset', () => {
    renderFooter({ rules: { ...CONWAY, Birth: [3, 4, 5], Survival: [1] } });
    expect(rulesInput()).toHaveValue('');
  });

  it('lists every preset', async () => {
    const { user } = renderFooter();
    await user.click(rulesInput());
    expect(await screen.findAllByRole('option')).toHaveLength(RULE_PRESETS.length);
  });

  it('reports the rules of the preset that was chosen', async () => {
    const { onRulesChange, user } = renderFooter();
    await user.click(rulesInput());
    await user.click(await screen.findByRole('option', { name: 'HighLife' }));
    expect(onRulesChange).toHaveBeenCalledTimes(1);
    expect(onRulesChange).toHaveBeenCalledWith(findPreset('highlife')!.rules);
  });

  it('can be changed while running', () => {
    renderFooter({ mode: MODE.GAME_RUNNING });
    expect(rulesInput()).toBeEnabled();
  });

  it('is disabled once the game is complete', () => {
    renderFooter({ mode: MODE.GAME_COMPLETE });
    expect(rulesInput()).toBeDisabled();
  });
});
