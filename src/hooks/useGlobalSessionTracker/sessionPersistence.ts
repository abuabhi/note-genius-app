
import { GlobalSessionState } from './types';

const SESSION_STORAGE_KEY = 'activeStudySession';

export const persistSession = (sessionState: GlobalSessionState) => {
  if (sessionState.isActive && sessionState.sessionId) {
    const persistData = {
      sessionId: sessionState.sessionId,
      startTime: sessionState.startTime?.toISOString(),
      currentActivity: sessionState.currentActivity,
      elapsedSeconds: sessionState.elapsedSeconds,
      isPaused: sessionState.isPaused
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(persistData));
    console.log('📦 Session persisted to localStorage:', persistData);
  }
};

export const restoreSession = (): Partial<GlobalSessionState> | null => {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    console.log('📦 Restoring session from localStorage:', data);
    
    return {
      sessionId: data.sessionId,
      startTime: data.startTime ? new Date(data.startTime) : null,
      currentActivity: data.currentActivity,
      elapsedSeconds: data.elapsedSeconds || 0,
      isPaused: data.isPaused || false,
      isActive: true
    };
  } catch (error) {
    console.error('Error restoring session:', error);
    return null;
  }
};

export const clearPersistedSession = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  console.log('📦 Cleared persisted session');
};
