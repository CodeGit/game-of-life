import { useEffect, useRef, useState } from 'react';
import { createWorld } from '@/engine/world';
import { Palette } from '@/ui/palette';
import { drawWorld } from './draw';
import './Grid.css';

export function Grid({
  id,
  rows,
  cols,
  wrap,
  age,
  lifespan,
  cellSize,
}: {
  id: string;
  rows: number;
  cols: number;
  wrap: boolean;
  age: boolean;
  lifespan: number;
  cellSize: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [palette] = useState(() => new Palette());
  const [world] = useState(() => createWorld(id, rows, cols, age, wrap, lifespan)); // wrapped to ensure only runs once.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    drawWorld(context, world, cellSize, palette);
  }, [cellSize, world, palette]);

  return (
    <div>
      <canvas
        className="grid-canvas"
        ref={canvasRef}
        width={cols * cellSize}
        height={rows * cellSize}
      />
    </div>
  );
}
