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

  it.each(Object.values(MODE))('shows the message for %s', (mode) => {
    renderFooter({ mode });
    expect(screen.getByText(MODE_MESSAGES[mode])).toBeInTheDocument();
  });
});

describe('Footer: play bar', () => {
  it('has the Reset, Pause, Step and Play buttons', () => {
    renderFooter();
    for (const name of ['Reset', 'Pause', 'Step', 'Play']) {
      expect(button(name)).toBeInTheDocument();
    }
  });

  it.each([
    [MODE.GAME_READY, { Reset: false, Pause: false, Step: true, Play: true }],
    [MODE.GAME_RUNNING, { Reset: true, Pause: true, Step: false, Play: false }],
    [MODE.GAME_PAUSED, { Reset: true, Pause: false, Step: true, Play: true }],
    [MODE.GAME_COMPLETE, { Reset: false, Pause: false, Step: false, Play: false }],
  ] as const)('enables the right buttons when %s', (mode, enabled) => {
    renderFooter({ mode });
    for (const [name, isEnabled] of Object.entries(enabled)) {
      if (isEnabled) expect(button(name)).toBeEnabled();
      else expect(button(name)).toBeDisabled();
    }
  });

  it('disables every button when there is no game', () => {
    renderFooter({ generation: null });
    for (const name of ['Reset', 'Pause', 'Step', 'Play']) {
      expect(button(name)).toBeDisabled();
    }
  });

  it('Step reports a step', async () => {
    const { onStep, user } = renderFooter();
    await user.click(button('Step'));
    expect(onStep).toHaveBeenCalledTimes(1);
  });

  it('does not report a step from a disabled Step button', async () => {
    const { onStep, user } = renderFooter({ mode: MODE.GAME_RUNNING });
    await user.click(button('Step'));
    expect(onStep).not.toHaveBeenCalled();
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

  it('does not report Play, Pause or Reset from buttons that are disabled', async () => {
    const { onPlay, onPause, onReset, user } = renderFooter({ mode: MODE.GAME_COMPLETE });
    await user.click(button('Play'));
    await user.click(button('Pause'));
    await user.click(button('Reset'));
    expect(onPlay).not.toHaveBeenCalled();
    expect(onPause).not.toHaveBeenCalled();
    expect(onReset).not.toHaveBeenCalled();
  });
});

describe('Footer: speed', () => {
  const slider = () => screen.getByRole('slider', { name: 'World speed' });

  it('has a speed slider showing the speed it is given', () => {
    renderFooter({ speed: 70 });
    expect(slider()).toHaveAttribute('aria-valuenow', '70');
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('reports a new speed from the keyboard', async () => {
    const { onSpeedChange, user } = renderFooter({ speed: 50 });
    slider().focus();
    await user.keyboard('{ArrowRight}');
    expect(onSpeedChange).toHaveBeenCalledWith(51);
  });

  it('can be used in every state, even with no game', () => {
    renderFooter({ generation: null, mode: MODE.GAME_COMPLETE });
    expect(slider()).toBeInTheDocument();
  });
});

describe('Footer: rules', () => {
  it('shows the name of the current rules', () => {
    renderFooter({ rules: CONWAY });
    expect(rulesInput()).toHaveValue("Conway's Life");
  });

  it('follows the rules it is given', () => {
    renderFooter({ rules: findPreset('highlife')!.rules });
    expect(rulesInput()).toHaveValue('HighLife');
  });

  it('lists every preset', async () => {
    const { user } = renderFooter();
    await user.click(rulesInput());
    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(RULE_PRESETS.length);
    for (const preset of RULE_PRESETS) {
      expect(screen.getByRole('option', { name: preset.name })).toBeInTheDocument();
    }
  });

  it('reports the rules of the preset that was chosen', async () => {
    const { onRulesChange, user } = renderFooter();
    await user.click(rulesInput());
    await user.click(await screen.findByRole('option', { name: 'HighLife' }));
    expect(onRulesChange).toHaveBeenCalledTimes(1);
    expect(onRulesChange).toHaveBeenCalledWith(findPreset('highlife')!.rules);
  });

  it('does not report a change before anything is chosen', () => {
    const { onRulesChange } = renderFooter();
    expect(onRulesChange).not.toHaveBeenCalled();
  });

  it.each([MODE.GAME_READY, MODE.GAME_RUNNING, MODE.GAME_PAUSED])(
    'can be changed when %s',
    (mode) => {
      renderFooter({ mode });
      expect(rulesInput()).toBeEnabled();
    },
  );

  it('can be changed before a game starts', () => {
    renderFooter({ generation: null });
    expect(rulesInput()).toBeEnabled();
  });

  it('cannot be changed once the game is complete', () => {
    renderFooter({ mode: MODE.GAME_COMPLETE });
    expect(rulesInput()).toBeDisabled();
  });

  it('shows nothing selected for rules that are not a preset', () => {
    renderFooter({ rules: { ...CONWAY, Birth: [3, 4, 5], Survival: [1] } });
    expect(rulesInput()).toHaveValue('');
  });
});
