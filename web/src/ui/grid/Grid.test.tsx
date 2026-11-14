import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { worldFrom } from '@/engine/testing';
import { Grid } from './Grid';

const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext');

function fakeContext() {
  const fillRect = vi.fn();
  const clearRect = vi.fn();
  const context = { fillStyle: '', fillRect, clearRect } as unknown as CanvasRenderingContext2D;
  getContext.mockReturnValue(context);
  return { fillRect, clearRect };
}

afterEach(() => {
  getContext.mockReturnValue(null);
});

describe('Grid', () => {
  it('sizes the canvas to the world: columns across, rows down', () => {
    const world = worldFrom(['........', '........', '........']); // 3 rows x 8 columns
    const { container } = render(<Grid world={world} cellSize={10} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('width', '80');
    expect(canvas).toHaveAttribute('height', '30');
  });

  it('draws the world on the canvas', () => {
    const { fillRect, clearRect } = fakeContext();
    render(<Grid world={worldFrom(['#.', '.#'])} cellSize={10} />);
    expect(clearRect).toHaveBeenCalled();
    expect(fillRect).toHaveBeenCalledTimes(2);
  });

  it('redraws at the new size when the cell size changes', () => {
    const { fillRect } = fakeContext();
    const world = worldFrom(['#']);
    const { container, rerender } = render(<Grid world={world} cellSize={10} />);
    rerender(<Grid world={world} cellSize={20} />);
    expect(container.querySelector('canvas')).toHaveAttribute('width', '20');
    expect(fillRect).toHaveBeenLastCalledWith(0, 0, 19, 19);
  });

  it('does not fail when the browser gives no drawing context', () => {
    getContext.mockReturnValue(null);
    expect(() => render(<Grid world={worldFrom(['#'])} cellSize={10} />)).not.toThrow();
  });
});
