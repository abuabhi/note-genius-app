
import { useBasicSessionTracker } from './useBasicSessionTracker';

// Mock unified session tracker interface for compatibility
export interface SessionEventData {
  type: string;
  sessionId: string | null;
  timestamp: Date;
  data?: any;
}

export const useUnifiedSessionTracker = () => {
  const basicTracker = useBasicSessionTracker();
  
  // Mock event system for compatibility
  const addEventListener = (eventType: string, handler: (event: SessionEventData) => void) => {
    // Return a mock unsubscribe function
    return () => {};
  };

  return {
    ...basicTracker,
    lastActivityTime: null as Date | null,
    debug: {
      pendingUpdates: 0,
      eventListeners: 0
    },
    addEventListener
  };
};
