
import { GlobalSessionState } from './types';

const SESSION_STORAGE_KEY = 'study_session_state';

export const persistSession = (sessionState: GlobalSessionState) => {
  try {
    // Store with ISO string for startTime to ensure proper serialization
    const stateToStore = {
      ...sessionState,
      startTime: sessionState.startTime ? sessionState.startTime.toISOString() : null
    };
    
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToStore));
  } catch (error) {
    console.error('Failed to persist session state:', error);
  }
};

export const restoreSession = (): GlobalSessionState | null => {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Ensure startTime is converted back to Date object if it exists
    if (parsed.startTime) {
      parsed.startTime = new Date(parsed.startTime);
    }
    
    return parsed as GlobalSessionState;
  } catch (error) {
    console.error('Failed to restore session state:', error);
    return null;
  }
};

export const clearPersistedSession = () => {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear persisted session:', error);
  }
};
