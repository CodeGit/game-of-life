import './App.css';
import { ReloadPrompt } from '@/ReloadPrompt';
import { Grid } from '@/ui/grid/Grid';

function App() {
  return (
    <>
      <section id="center">
        <div>
          <h1>Conways Game of Life!</h1>
          <ReloadPrompt />
          <Grid
            id="main-grid"
            rows={20}
            cols={20}
            wrap={true}
            age={true}
            lifespan={5}
            cellSize={20}
          />
        </div>
      </section>
    </>
  );
}

export default App;
