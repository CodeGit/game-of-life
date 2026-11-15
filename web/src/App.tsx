import { useState } from 'react';
import { useGameMode } from '@/game/useGameMode';
import { AppShell, Container } from '@mantine/core';
import { ReloadPrompt } from '@/ReloadPrompt';
import { Grid } from '@/ui/grid/Grid';
import { Header } from '@/ui/header/header';
import { NewGameModal } from '@/ui/newgame/NewGameModal';
import './App.css';
import { Footer } from './ui/footer/footer';

// The header, board and footer share one column, as wide as the board (but never too narrow for the title).
const MIN_COLUMN_WIDTH = 360;

function App() {
  const [cellSize] = useState(20);
  const game = useGameMode();
  const columnWidth = Math.max(MIN_COLUMN_WIDTH, game.world ? game.world.cols * cellSize : 0);
  return (
    <AppShell header={{ height: 88 }} footer={{ height: 130 }} padding="md">
      <Header onAction={game.handleMenuAction} columnWidth={columnWidth} />
      <NewGameModal
        opened={game.isNewGameFormVisible}
        onClose={game.hideNewGameForm}
        onStart={game.startGame}
      />
      <AppShell.Main>
        <Container size={columnWidth} px={0}>
          <ReloadPrompt />
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
        columnWidth={columnWidth}
        mode={game.mode}
        generation={game.world?.generation ?? null}
        rules={game.rules}
        onStep={game.stepGame}
        onRulesChange={game.setRules}
      />
    </AppShell>
  );
}

export default App;
