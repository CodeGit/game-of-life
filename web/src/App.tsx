import { useGameMode } from '@/game/useGameMode';
import { AppShell, Container } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Grid } from '@/ui/grid/Grid';
import { useZoom } from '@/ui/grid/useZoom';
import { AboutModal } from '@/ui/about/AboutModal';
import { Header } from '@/ui/header/header';
import { FOOTER_HEIGHT, HEADER_HEIGHT, PAGE_PADDING, columnWidth } from '@/ui/layout';
import { NewGameModal } from '@/ui/newgame/NewGameModal';
import './App.css';
import { Footer } from './ui/footer/footer';

function App() {
  const game = useGameMode();
  const [aboutOpened, about] = useDisclosure(false);
  const zoom = useZoom(game.world);
  const { cellSize } = zoom;
  // The header, board and footer share one column, which follows the board's width within limits.
  const boardWidth = game.world ? game.world.cols * cellSize : 0;
  const column = columnWidth(boardWidth, zoom.availableWidth);
  return (
    <AppShell
      header={{ height: HEADER_HEIGHT }}
      footer={{ height: FOOTER_HEIGHT }}
      padding={PAGE_PADDING}
    >
      <Header onAction={game.handleMenuAction} onAbout={about.open} columnWidth={column} />
      <AboutModal opened={aboutOpened} onClose={about.close} />
      <NewGameModal
        opened={game.isNewGameFormVisible}
        onClose={game.hideNewGameForm}
        onStart={(options) => {
          game.startGame(options);
          zoom.fit(); // a new board is fitted to the window, whatever the last one was zoomed to
        }}
      />
      <AppShell.Main>
        <Container size={column} px={0}>
          <div style={{ overflow: 'auto' }}>
            {game.world ? (
              <div style={{ margin: '0 auto', width: 'fit-content' }}>
                <Grid world={game.world} cellSize={cellSize} />
              </div>
            ) : null}
          </div>
        </Container>
      </AppShell.Main>
      <Footer
        columnWidth={column}
        mode={game.mode}
        generation={game.world?.generation ?? null}
        rules={game.rules}
        speed={game.speed}
        onSpeedChange={game.setSpeed}
        onStep={game.stepGame}
        onPlay={game.runGame}
        onPause={game.pauseGame}
        onReset={game.resetGame}
        onRulesChange={game.setRules}
        zoom={zoom}
      />
    </AppShell>
  );
}

export default App;
