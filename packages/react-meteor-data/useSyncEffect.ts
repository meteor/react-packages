import { useMemo, useEffect, DependencyList } from 'react';

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
  }, [cleanup]);
};

export default useSyncEffect;
