import { useCallback, useRef } from 'react';

/**
 * Hook to debounce API requests and prevent rapid-fire calls
 * Essential for production environments with concurrent users
 */
export const useRequestDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallRef = useRef<number>(0);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      // Prevent calls if too frequent (minimum delay between calls)
      if (now - lastCallRef.current < delay) {
        return Promise.resolve();
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      return new Promise((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            lastCallRef.current = Date.now();
            const result = callback(...args);
            // Handle both sync and async callbacks
            const finalResult = result instanceof Promise ? await result : result;
            resolve(finalResult);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    },
    [callback, delay]
  );

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { debouncedCallback, cleanup };
};