import { AppShell, Container, Menubar, Stack, Text, Menu, Title } from '@mantine/core';
import { MENU_ACTIONS, type MenuAction } from './menuActions';

type HeaderProps = { onAction: (action: MenuAction) => void; columnWidth: number };

export function Header({ onAction, columnWidth }: HeaderProps) {
  return (
    <AppShell.Header>
      <Container size={columnWidth} px={0} h="100%">
        <Stack gap={0} justify="center" h="100%">
          <Title order={1} size="h3" ta="center">
            Conway's Game of Life
          </Title>
          <Menubar>
            <Menubar.Menu>
              <Menubar.Target>
                <Text>Game</Text>
              </Menubar.Target>
              <Menubar.Dropdown>
                <Menu.Item onClick={() => onAction(MENU_ACTIONS.NEW_GAME)}>New Game</Menu.Item>
                <Menu.Item onClick={() => onAction(MENU_ACTIONS.END_GAME)}>End Game</Menu.Item>
              </Menubar.Dropdown>
            </Menubar.Menu>
            <Menubar.Menu>
              <Menubar.Target>
                <Text>File</Text>
              </Menubar.Target>
              <Menubar.Dropdown>
                <Menu.Item onClick={() => onAction(MENU_ACTIONS.SAVE_GAME)}>Save</Menu.Item>
                <Menu.Item onClick={() => onAction(MENU_ACTIONS.LOAD_GAME)}>Load</Menu.Item>
              </Menubar.Dropdown>
            </Menubar.Menu>
          </Menubar>
        </Stack>
      </Container>
    </AppShell.Header>
  );
}
