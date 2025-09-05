import { useEffect, useRef } from 'react';

// Simple implementation of managed interval hook
export const useManagedInterval = (
  name: string,
  callback: () => void,
  delay: number | null
) => {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

// Simple implementation of managed timeout hook
export const useManagedTimeout = (
  name: string,
  callback: () => void,
  delay: number | null
) => {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout
  useEffect(() => {
    if (delay !== null) {
      const id = setTimeout(() => {
        if (savedCallback.current) {
          savedCallback.current();
        }
      }, delay);
      return () => clearTimeout(id);
    }
  }, [delay]);
};