import { useState } from 'react';
import type { World } from '@/engine/types';
import { useWindowSize } from '@/ui/useWindowSize';
import { boardSpace } from '../layout';
import { MAX_CELL_SIZE, MIN_CELL_SIZE, fitSizeCell, zoomedCellSize } from './zoom';
import { DEFAULT_ROWS, DEFAULT_COLS } from '@/engine/defaults';

export function useZoom(world: World | null) {
  const [chosen, setChosen] = useState<number | null>(null);
  const { width, height } = useWindowSize();
  const space = boardSpace(width, height);
  const rows = world?.rows ?? DEFAULT_ROWS;
  const cols = world?.cols ?? DEFAULT_COLS;
  const fitted = fitSizeCell({ rows, cols, width: space.width, height: space.height });
  const cellSize = chosen ?? fitted;

  function zoomIn() {
    return setChosen(zoomedCellSize(cellSize, true));
  }

  function zoomOut() {
    return setChosen(zoomedCellSize(cellSize, false));
  }

  function fit() {
    return setChosen(null);
  }

  return {
    cellSize,
    isFit: chosen === null,
    canZoomIn: cellSize < MAX_CELL_SIZE,
    canZoomOut: cellSize > MIN_CELL_SIZE,
    zoomIn,
    zoomOut,
    fit,
    availableWidth: space.width, // to prevent header and footer expanding along with the grid
  };
}
