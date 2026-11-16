import { Anchor, Modal, Stack, Text } from '@mantine/core';

const AUTHOR = 'Matloob Qureshi';
const REPO_URL = 'https://github.com/CodeGit/game-of-life';
const ABOUT_LIFE_URL = 'https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life';

type AboutModalProps = { opened: boolean; onClose: () => void };

export function AboutModal({ opened, onClose }: AboutModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="About"
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
      <Stack gap="xs">
        <Text>A configurable version of Conway's Game of Life.</Text>
        <Text>Version {__APP_VERSION__}</Text>
        <Text>By {AUTHOR}</Text>
        <Anchor href={REPO_URL} target="_blank" rel="noopener noreferrer">
          Source code on GitHub
        </Anchor>
        <Anchor href={ABOUT_LIFE_URL} target="_blank" rel="noopener noreferrer">
          About Conway's Game of Life
        </Anchor>
      </Stack>
    </Modal>
  );
}
