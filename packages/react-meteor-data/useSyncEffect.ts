import { useMemo, useEffect, DependencyList } from 'react';

/**
 * Runs effect synchronously during render (like useMemo), but defers cleanup
 * by 1s to avoid issues with React StrictMode double-rendering.
 * This is used for Tracker computations that should not be stopped/restarted
 * on each render.
 */
const useSyncEffect = (effect: () => any, deps: DependencyList) => {
  const [cleanup, timeoutId] = useMemo(
    () => {
      const cleanup = effect();
      const timeoutId = setTimeout(cleanup, 1000);
      return [cleanup, timeoutId];
    },
    deps
  );

  useEffect(() => {
    clearTimeout(timeoutId);
    return cleanup;
  }, [cleanup, timeoutId]);
};

export default useSyncEffect;
