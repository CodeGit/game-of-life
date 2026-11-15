import { useEffect, useState } from 'react';

const readWindowSize = () => ({ width: window.innerWidth, height: window.innerHeight });

// The size of the browser window in pixels, kept up to date as it is resized.
//
// It reads the size straight away, in the state's initial value. (Mantine's useViewportSize
// starts at 0 x 0 and fills the size in after the first paint, so a board sized from it would be
// drawn at the smallest size for a moment.)
export function useWindowSize() {
  const [size, setSize] = useState(readWindowSize);

  useEffect(() => {
    const update = () => setSize(readWindowSize());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return size;
}
