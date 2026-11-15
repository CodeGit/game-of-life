// The smallest and biggest a cell can be, in pixels. The zoom steps run from one to the other.
export const MIN_CELL_SIZE = 2;
export const MAX_CELL_SIZE = 40;

const ZOOMED_PIXEL_STEPS: number[] = [2, 3, 4, 6, 7, 10, 12, 16, 20, 24, 30, 40];

type FitSizeCell = {
  rows: number;
  cols: number;
  width: number;
  height: number;
  minSize?: number;
  maxSize?: number;
};
export function fitSizeCell({
  rows,
  cols,
  width,
  height,
  minSize = MIN_CELL_SIZE,
  maxSize = MAX_CELL_SIZE,
}: FitSizeCell): number {
  const maximumPixelsInRect = Math.floor(Math.min(width / cols, height / rows));
  if (maximumPixelsInRect > maxSize) {
    return maxSize;
  } else if (maximumPixelsInRect < minSize) {
    return minSize;
  }
  return maximumPixelsInRect;
}

export function zoomedCellSize(current: number, bigger: boolean): number {
  const step = bigger
    ? ZOOMED_PIXEL_STEPS.find((val) => val > current)
    : ZOOMED_PIXEL_STEPS.findLast((val) => val < current);
  return step ?? current;
}
