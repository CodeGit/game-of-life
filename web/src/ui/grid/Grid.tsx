import { useEffect, useRef, useState } from 'react';
import type { World } from '@/engine/types';
import { Palette } from '@/ui/palette';
import { drawWorld } from './draw';
import './Grid.css';

export function Grid({ world, cellSize }: { world: World; cellSize: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [palette] = useState(() => new Palette());
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
        width={world.cols * cellSize}
        height={world.rows * cellSize}
      />
    </div>
  );
}
