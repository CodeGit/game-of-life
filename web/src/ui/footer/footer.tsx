import {
  ActionIcon,
  ActionIconGroup,
  AppShell,
  Container,
  Group,
  Select,
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
import { useState } from 'react';
import { allowedActions } from '@/game/controls';
import { findPreset, RULE_PRESETS, ruleString } from '@/engine/rules';

type FooterProps = {
  columnWidth: number;
  mode: Mode;
  generation: number | null;
  rules: Rules;
  onStep: () => void;
  onRulesChange: (rules: Rules) => void;
};

export function Footer({
  columnWidth,
  mode,
  generation,
  rules,
  onStep,
  onRulesChange,
}: FooterProps) {
  const [speed, setSpeed] = useState(100);
  const allowed = allowedActions(mode, generation !== null);
  const rulesData = RULE_PRESETS.map((p) => ({ value: p.id, label: p.name }));
  const currentId = RULE_PRESETS.find((p) => ruleString(p.rules) === ruleString(rules))?.id ?? null;
  return (
    <AppShell.Footer>
      <Container size={columnWidth} px={0} h="100%">
        <Stack h="100%" justify="center" gap="xs">
          <Group wrap="nowrap">
            <ActionIconGroup>
              <ActionIcon aria-label="Reset" disabled={!allowed.reset}>
                <ArrowCounterClockwiseIcon />
              </ActionIcon>
              <ActionIcon aria-label="Pause" disabled={!allowed.pause}>
                <PauseIcon />
              </ActionIcon>
              <ActionIcon aria-label="Step" onClick={onStep} disabled={!allowed.step}>
                <SkipForwardIcon />
              </ActionIcon>
              <ActionIcon aria-label="Play" disabled={!allowed.play}>
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
                min={1}
                max={100}
                value={speed}
                onChange={setSpeed}
              />
              <Text size="sm" w={35} ta="right">
                {speed}%
              </Text>
            </Group>
          </Group>
          <Group wrap="nowrap">
            <Select
              flex={1}
              aria-label="World rules"
              placeholder="Select rules"
              data={rulesData}
              value={currentId}
              onChange={(id) => {
                const preset = id ? findPreset(id) : undefined;
                if (preset) onRulesChange(preset.rules);
              }}
              allowDeselect={false}
              disabled={!allowed.changeRules}
            />
            <ActionIconGroup>
              <ActionIcon aria-label="Zoom out">
                <MagnifyingGlassMinusIcon />
              </ActionIcon>
              <ActionIcon aria-label="Fit to width">
                <MagnifyingGlassIcon />
              </ActionIcon>
              <ActionIcon aria-label="Zoom in">
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
