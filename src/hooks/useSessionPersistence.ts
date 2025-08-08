
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
    if (!user) {
      console.log('🔄 [SESSION PERSISTENCE] No user available for recovery');
      return null;
    }
    
    console.log('🔄 [SESSION PERSISTENCE] Starting session recovery for user:', user.id, 'at', new Date().toISOString());
    
    try {
      // Clear any stale localStorage data first
      const persistedSession = getPersistedSession();
      if (persistedSession) {
        console.log('🔄 [SESSION PERSISTENCE] Clearing stale localStorage session:', persistedSession.sessionId);
        clearPersistedSession();
      }
      
      // Query database for active sessions with timeout handling
      console.log('🔄 [SESSION PERSISTENCE] Querying database for active sessions...');
      
      const queryPromise = supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('start_time', { ascending: false })
        .limit(1);

      // Add timeout to database query
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 10000)
      );

      const { data: activeSessions, error } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('❌ [SESSION PERSISTENCE] Database query error:', error);
        throw error;
      }

      console.log('🔄 [SESSION PERSISTENCE] Database query completed:', {
        sessionsFound: activeSessions?.length || 0,
        sessions: activeSessions
      });

      // If we have an active session in DB, return it
      if (activeSessions && activeSessions.length > 0) {
        const dbSession = activeSessions[0];
        console.log('✅ [SESSION PERSISTENCE] Found active session:', {
          id: dbSession.id,
          title: dbSession.title,
          startTime: dbSession.start_time,
          activityType: dbSession.activity_type
        });
        
        // Calculate elapsed time since start with validation
        const startTime = new Date(dbSession.start_time);
        const now = Date.now();
        const elapsedMs = now - startTime.getTime();
        
        // Validate elapsed time (max 24 hours to prevent invalid sessions)
        if (elapsedMs > 24 * 60 * 60 * 1000) {
          console.warn('⚠️ [SESSION PERSISTENCE] Session too old, marking as inactive');
          // Mark session as inactive in database
          await supabase
            .from('study_sessions')
            .update({ is_active: false, end_time: new Date().toISOString() })
            .eq('id', dbSession.id);
          return null;
        }
        
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        
        const recoveredSession = {
          sessionId: dbSession.id,
          startTime: dbSession.start_time,
          title: dbSession.title || 'Study Session',
          subject: dbSession.subject,
          activityType: dbSession.activity_type || 'general',
          studyPlanId: dbSession.study_plan_id,
          elapsedSeconds: Math.max(0, elapsedSeconds)
        };

        console.log('🔄 [SESSION PERSISTENCE] Recovered session data:', recoveredSession);
        
        // Update localStorage with recovered session
        saveSessionState(recoveredSession);
        
        return recoveredSession;
      }

      console.log('ℹ️ [SESSION PERSISTENCE] No active session found in database');
      return null;
    } catch (error) {
      console.error('❌ [SESSION PERSISTENCE] Recovery error:', {
        error: error instanceof Error ? error.message : error,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
      
      // Clear potentially corrupted localStorage
      clearPersistedSession();
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
