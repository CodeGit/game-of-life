import './App.css';
import { ReloadPrompt } from './ReloadPrompt';

function App() {
  return (
    <>
      <section id="center">
        <div>
          <h1>Conways Game of Life!</h1>
          <ReloadPrompt />
        </div>
      </section>
    </>
  );
}

export default App;
