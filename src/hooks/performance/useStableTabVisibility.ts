import { useState, useEffect, useRef } from 'react';

/**
 * Optimized tab visibility hook that prevents excessive re-renders
 * Uses debouncing to reduce state changes during rapid focus changes
 */
export const useStableTabVisibility = (debounceMs = 500) => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce visibility changes to prevent excessive updates
      timeoutRef.current = setTimeout(() => {
        setIsVisible(!document.hidden);
      }, debounceMs);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debounceMs]);

  return isVisible;
};