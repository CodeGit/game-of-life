import { Button, Group, Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { WorldOptions } from '@/engine/types';

type NewGameModalProps = {
  opened: boolean;
  onClose: () => void;
  onStart: (options: WorldOptions) => void;
};

const DEFAULT_OPTIONS: WorldOptions = {
  id: 'The World',
  rows: 20,
  cols: 20,
  wrap: true,
  age: true,
  lifespan: 100,
  density: 0.3,
  players: 1,
};

export function NewGameModal({ opened, onClose, onStart }: NewGameModalProps) {
  const form = useForm<WorldOptions>({
    mode: 'controlled',
    initialValues: DEFAULT_OPTIONS,
  });

  return (
    <Modal opened={opened} onClose={onClose} title="New Game">
      <form onSubmit={form.onSubmit((values) => onStart(values))}>
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
