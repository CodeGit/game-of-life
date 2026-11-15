import {
  ActionIcon,
  ActionIconGroup,
  AppShell,
  Container,
  Group,
  NativeSelect,
  Slider,
  Stack,
  Text,
} from '@mantine/core';
import {
  PlayIcon,
  PauseIcon,
  ArrowCounterClockwiseIcon,
  SkipForwardIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@phosphor-icons/react';
import { MODE_MESSAGES, type Mode } from '@/game/mode';
import type { Rules } from '@/engine/types';
import { allowedActions } from '@/game/controls';
import { MAX_SPEED, MIN_SPEED } from '@/game/speed';
import { findPreset, RULE_PRESETS, ruleString } from '@/engine/rules';

type ZoomControls = {
  isFit: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  fit: () => void;
};

type FooterProps = {
  columnWidth: number;
  mode: Mode;
  generation: number | null;
  rules: Rules;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onStep: () => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onRulesChange: (rules: Rules) => void;
  zoom: ZoomControls;
};

export function Footer({
  columnWidth,
  mode,
  generation,
  rules,
  speed,
  onSpeedChange,
  onStep,
  onPlay,
  onPause,
  onReset,
  onRulesChange,
  zoom,
}: FooterProps) {
  const hasGame = generation !== null;
  const allowed = allowedActions(mode, hasGame);
  const rulesData = RULE_PRESETS.map((p) => ({ value: p.id, label: p.name }));
  const currentId = RULE_PRESETS.find((p) => ruleString(p.rules) === ruleString(rules))?.id ?? null;
  return (
    <AppShell.Footer>
      <Container size={columnWidth} px={0} h="100%">
        <Stack h="100%" justify="center" gap="xs">
          <Group wrap="nowrap">
            <ActionIconGroup>
              <ActionIcon aria-label="Reset" onClick={onReset} disabled={!allowed.reset}>
                <ArrowCounterClockwiseIcon />
              </ActionIcon>
              <ActionIcon aria-label="Pause" onClick={onPause} disabled={!allowed.pause}>
                <PauseIcon />
              </ActionIcon>
              <ActionIcon aria-label="Step" onClick={onStep} disabled={!allowed.step}>
                <SkipForwardIcon />
              </ActionIcon>
              <ActionIcon aria-label="Play" onClick={onPlay} disabled={!allowed.play}>
                <PlayIcon />
              </ActionIcon>
            </ActionIconGroup>
            <Group wrap="nowrap" flex={1}>
              <Text size="sm">Speed</Text>
              <Slider
                flex={1}
                thumbLabel="World speed"
                label={(v) => `${v}%`}
                step={1}
                min={MIN_SPEED}
                max={MAX_SPEED}
                value={speed}
                onChange={onSpeedChange}
              />
              <Text size="sm" w={35} ta="right">
                {speed}%
              </Text>
            </Group>
          </Group>
          <Group wrap="nowrap">
            <NativeSelect
              flex={1}
              aria-label="World rules"
              data={
                currentId
                  ? rulesData
                  : [{ value: '', label: 'Custom rules', disabled: true }, ...rulesData]
              }
              value={currentId ?? ''}
              onChange={(event) => {
                const id = event.currentTarget.value;
                const preset = id ? findPreset(id) : undefined;
                if (preset) onRulesChange(preset.rules);
              }}
              disabled={!allowed.changeRules}
            />
            <ActionIconGroup>
              <ActionIcon
                aria-label="Zoom out"
                onClick={zoom.zoomOut}
                disabled={!hasGame || !zoom.canZoomOut}
              >
                <MagnifyingGlassMinusIcon />
              </ActionIcon>
              <ActionIcon
                aria-label="Fit to window"
                aria-pressed={zoom.isFit}
                variant={zoom.isFit ? 'filled' : 'light'}
                onClick={zoom.fit}
                disabled={!hasGame}
              >
                <MagnifyingGlassIcon />
              </ActionIcon>
              <ActionIcon
                aria-label="Zoom in"
                onClick={zoom.zoomIn}
                disabled={!hasGame || !zoom.canZoomIn}
              >
                <MagnifyingGlassPlusIcon />
              </ActionIcon>
            </ActionIconGroup>
          </Group>
          <Group justify="space-between">
            <Text size="sm">Generation {generation ?? '-'}</Text>
            <Text size="sm">{MODE_MESSAGES[mode]}</Text>
          </Group>
        </Stack>
      </Container>
    </AppShell.Footer>
  );
}
