
import React, { createContext, useContext, ReactNode } from 'react';
import { useAutoSessionTracker } from '@/hooks/useAutoSessionTracker';

interface SessionContextType {
  isTracking: boolean;
  currentSessionId: string | null;
  activityType: 'flashcard_study' | 'note_review' | 'quiz_taking' | 'general' | null;
  startTime: Date | null;
  elapsedSeconds: number;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  updateSessionActivity: (activityData: {
    cards_reviewed?: number;
    cards_correct?: number;
    quiz_score?: number;
    quiz_total_questions?: number;
    notes_created?: number;
    notes_reviewed?: number;
  }) => Promise<void>;
  isOnStudyPage: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const sessionTracker = useAutoSessionTracker();

  return (
    <SessionContext.Provider value={{
      ...sessionTracker,
      isOnStudyPage: sessionTracker.isOnStudyPage || false
    }}>
      {children}
    </SessionContext.Provider>
  );
};
