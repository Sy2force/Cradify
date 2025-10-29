import { useState, useCallback, useMemo } from 'react';

// Hook pour gérer les états de loading
export function useLoading(initialState: boolean = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  const withLoading = useCallback(async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
    try {
      startLoading();
      return await asyncFn();
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return useMemo(() => ({
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  }), [isLoading, startLoading, stopLoading, withLoading]);
}
