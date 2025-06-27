
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface PersistedSessionState {
  sessionId: string;
  startTime: string;
  title: string;
  subject?: string;
  activityType: string;
  studyPlanId?: string;
  elapsedSeconds: number;
}

export const useSessionPersistence = () => {
  const { user } = useAuth();
  const recoveryAttempted = useRef(false);

  const saveSessionState = (sessionState: PersistedSessionState) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeStudySession', JSON.stringify(sessionState));
    }
  };

  const getPersistedSession = (): PersistedSessionState | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const saved = localStorage.getItem('activeStudySession');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const clearPersistedSession = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('activeStudySession');
    }
  };

  const recoverActiveSession = async () => {
    if (!user || recoveryAttempted.current) return null;
    
    recoveryAttempted.current = true;
    
    try {
      // First check localStorage
      const persistedSession = getPersistedSession();
      
      // Then check database for active sessions
      const { data: activeSessions, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('start_time', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking for active sessions:', error);
        return null;
      }

      // If we have an active session in DB, return it
      if (activeSessions && activeSessions.length > 0) {
        const dbSession = activeSessions[0];
        
        // Calculate elapsed time since start
        const startTime = new Date(dbSession.start_time);
        const elapsedSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
        
        const recoveredSession = {
          sessionId: dbSession.id,
          startTime: dbSession.start_time,
          title: dbSession.title,
          subject: dbSession.subject,
          activityType: dbSession.activity_type || 'general',
          studyPlanId: dbSession.study_plan_id,
          elapsedSeconds
        };

        // Update localStorage with recovered session
        saveSessionState(recoveredSession);
        
        return recoveredSession;
      }

      // If no DB session but we have persisted data, clean it up
      if (persistedSession) {
        clearPersistedSession();
      }

      return null;
    } catch (error) {
      console.error('Error recovering session:', error);
      return null;
    }
  };

  return {
    saveSessionState,
    getPersistedSession,
    clearPersistedSession,
    recoverActiveSession
  };
};
