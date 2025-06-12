
export const validateSessionDuration = (durationSeconds: number): number => {
  // Cap at 8 hours maximum (28800 seconds)
  const maxDuration = 8 * 60 * 60;
  // Minimum 1 second
  const minDuration = 1;
  
  return Math.max(minDuration, Math.min(durationSeconds, maxDuration));
};

export const validateSessionState = (sessionState: any): boolean => {
  if (!sessionState) return false;
  if (!sessionState.sessionId) return false;
  if (!sessionState.isActive) return false;
  if (!sessionState.startTime) return false;
  
  // Check if start time is reasonable (not more than 24 hours ago)
  const now = new Date();
  const startTime = new Date(sessionState.startTime);
  const timeDiff = now.getTime() - startTime.getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  if (timeDiff > maxAge || timeDiff < 0) {
    console.warn('Session state invalid: start time is unreasonable', {
      startTime: startTime.toISOString(),
      now: now.toISOString(),
      timeDiff: timeDiff
    });
    return false;
  }
  
  return true;
};

export const calculateContinuousElapsedTime = (startTime: Date): number => {
  const now = new Date();
  return Math.floor((now.getTime() - startTime.getTime()) / 1000);
};
