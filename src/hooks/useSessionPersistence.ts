
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
    if (!user || recoveryAttempted.current) {
      console.log('🔄 [SESSION PERSISTENCE] Skipping recovery - user:', !!user, 'already attempted:', recoveryAttempted.current);
      return null;
    }
    
    recoveryAttempted.current = true;
    console.log('🔄 [SESSION PERSISTENCE] Starting session recovery for user:', user.id);
    
    try {
      // First check localStorage
      const persistedSession = getPersistedSession();
      console.log('🔄 [SESSION PERSISTENCE] LocalStorage session:', persistedSession);
      
      // Then check database for active sessions
      console.log('🔄 [SESSION PERSISTENCE] Querying database for active sessions...');
      const { data: activeSessions, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('start_time', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ [SESSION PERSISTENCE] Error checking for active sessions:', error);
        return null;
      }

      console.log('🔄 [SESSION PERSISTENCE] Database query result:', activeSessions);

      // If we have an active session in DB, return it
      if (activeSessions && activeSessions.length > 0) {
        const dbSession = activeSessions[0];
        console.log('✅ [SESSION PERSISTENCE] Found active session in DB:', dbSession.id);
        
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

        console.log('🔄 [SESSION PERSISTENCE] Recovered session data:', recoveredSession);
        
        // Update localStorage with recovered session
        saveSessionState(recoveredSession);
        
        return recoveredSession;
      }

      // If no DB session but we have persisted data, clean it up
      if (persistedSession) {
        console.log('🔄 [SESSION PERSISTENCE] Cleaning up stale localStorage data');
        clearPersistedSession();
      }

      console.log('ℹ️ [SESSION PERSISTENCE] No active session found');
      return null;
    } catch (error) {
      console.error('❌ [SESSION PERSISTENCE] Error recovering session:', error);
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
