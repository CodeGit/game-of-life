import {
  Button,
  Checkbox,
  Fieldset,
  Group,
  Input,
  Modal,
  NativeSelect,
  NumberInput,
  Slider,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DEFAULT_COLS, DEFAULT_ROWS } from '@/engine/defaults';
import { MAX_LIFESPAN, MAX_WORLD_SIZE, MIN_LIFESPAN, MIN_WORLD_SIZE } from '@/engine/limits';
import type { WorldOptions } from '@/engine/types';
import { Palette } from '@/ui/palette';

type NewGameModalProps = {
  opened: boolean;
  onClose: () => void;
  onStart: (options: WorldOptions) => void;
};

const DEFAULT_OPTIONS: WorldOptions = {
  id: 'The World',
  rows: DEFAULT_ROWS,
  cols: DEFAULT_COLS,
  wrap: true,
  age: true,
  lifespan: 100,
  density: 0.3,
  colours: 1,
};

// 1 to 8, one choice for each colour in the palette. A select (not a typed number) so the value
// can only be one the palette can show.
const COLOUR_CHOICES = Array.from({ length: Palette.colourCount }, (_, i) => String(i + 1));

export function NewGameModal({ opened, onClose, onStart }: NewGameModalProps) {
  const form = useForm<WorldOptions>({
    mode: 'controlled',
    initialValues: DEFAULT_OPTIONS,
    validate: {
      id: (value) => (value.trim() === '' ? 'The world must have a name' : null),
    },
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="New Game"
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
      <form onSubmit={form.onSubmit((values) => onStart(values))}>
        <TextInput
          label="World Name"
          placeholder="Enter the world name"
          withAsterisk
          {...form.getInputProps('id')}
        />
        <Fieldset legend="World size">
          <Stack gap="sm">
            <NumberInput
              label="Rows"
              min={MIN_WORLD_SIZE}
              max={MAX_WORLD_SIZE}
              allowDecimal={false}
              description="Number of rows in the world"
              placeholder="Input number of rows"
              {...form.getInputProps('rows')}
            />
            <NumberInput
              label="Columns"
              min={MIN_WORLD_SIZE}
              max={MAX_WORLD_SIZE}
              allowDecimal={false}
              description="Number of columns in the world"
              placeholder="Input number of columns"
              {...form.getInputProps('cols')}
            />
            <Checkbox
              label="The world wraps around"
              {...form.getInputProps('wrap', { type: 'checkbox' })}
            />
          </Stack>
        </Fieldset>
        <Fieldset legend="Cell life">
          <Stack gap="md">
            <Checkbox label="Cells age" {...form.getInputProps('age', { type: 'checkbox' })} />
            <Input.Wrapper label="Lifespan" description="How many generations a cell lives">
              <Slider
                label={(v) => `${v} generations`}
                disabled={!form.values.age}
                min={MIN_LIFESPAN}
                max={MAX_LIFESPAN}
                marks={[
                  { value: 1, label: '1 generation' },
                  { value: 128, label: '128 generations' },
                  { value: 255, label: '255 generations' },
                ]}
                {...form.getInputProps('lifespan')}
              />
            </Input.Wrapper>
          </Stack>
        </Fieldset>
        <Fieldset legend="Population">
          <Stack gap="md">
            <Input.Wrapper label="Population Density" description="Randomly populate the world">
              <Slider
                label={(v) => `${Math.round(v * 100)}%`}
                step={0.01}
                min={0}
                max={1}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 0.5, label: '50%' },
                  { value: 1, label: '100%' },
                ]}
                {...form.getInputProps('density')}
              />
            </Input.Wrapper>
            <NativeSelect
              label="World colours"
              description="How many colours share the random cells"
              data={COLOUR_CHOICES}
              value={String(form.values.colours)}
              onChange={(event) => form.setFieldValue('colours', Number(event.currentTarget.value))}
            />
          </Stack>
        </Fieldset>
        <Group justify="space-between">
          <Button type="button" variant="subtle" onClick={() => form.reset()}>
            Reset
          </Button>
          <Group justify="flex-end" mt="md">
            <Button type="button" variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </Group>
        </Group>
      </form>
    </Modal>
  );
}
