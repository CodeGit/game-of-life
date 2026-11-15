import { useEffect, useEffectEvent } from 'react';

// Calls onTick every `delay` milliseconds while `running` is true. The timer stops when
// `running` goes false, restarts at the new pace when `delay` changes, and is cleared on unmount.
export function useRunLoop(running: boolean, delay: number, onTick: () => void) {
  // An effect event always calls the newest onTick (with the current world and rules) without
  // restarting the timer every time those change.
  const tick = useEffectEvent(onTick);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [running, delay]);
}
