import type { World } from '../../engine/types';
import type { Palette } from '../palette';

const MIN_BORDER_CELL = 6; // below this the gap eats too much of the cell

export function drawWorld(
  context: CanvasRenderingContext2D,
  world: World,
  cellSize: number,
  palette: Palette,
) {
  const { main, ageGrid, rows, cols, lifespan } = world;
  const height = rows * cellSize;
  const width = cols * cellSize;
  const showBorder = cellSize >= MIN_BORDER_CELL;
  const size = showBorder ? cellSize - 1 : cellSize;

  context.clearRect(0, 0, width, height);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      const owner = main[i] ?? 0;
      if (owner === 0) continue;
      const age = ageGrid?.[i] ?? 0;
      const shade = palette.shadeFor(age, lifespan);
      context.fillStyle = palette.shade(owner, shade);
      context.fillRect(col * cellSize, row * cellSize, size, size);
    }
  }
}
