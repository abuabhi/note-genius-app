
import { useState, useEffect, useRef } from 'react';

export const useBasicSessionTracker = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  const startSession = () => {
    setIsActive(true);
    setIsPaused(false);
    setElapsedSeconds(0);
  };

  const pauseSession = () => {
    setIsPaused(true);
  };

  const resumeSession = () => {
    setIsPaused(false);
  };

  const stopSession = () => {
    setIsActive(false);
    setIsPaused(false);
    setElapsedSeconds(0);
  };

  return {
    isActive,
    isPaused,
    elapsedSeconds,
    startSession,
    pauseSession,
    resumeSession,
    stopSession
  };
};
