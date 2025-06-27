
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SessionData {
  title: string;
  subject?: string;
  activityType: 'flashcard_study' | 'note_review' | 'quiz_taking' | 'study_plan' | 'general';
  studyPlanId?: string;
  flashcardSetId?: string;
  noteId?: string;
  quizId?: string;
}

export const useUnifiedSessionTracker = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [currentSubject, setCurrentSubject] = useState<string>('');
  const [activityType, setActivityType] = useState<string>('general');
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());

  // Clean up orphaned sessions and load active session on mount
  useEffect(() => {
    if (user) {
      cleanupAndLoadActiveSession();
    }
  }, [user]);

  // Timer logic
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

  // Simple inactivity detection
  useEffect(() => {
    if (!isActive || isPaused) return;

    const resetInactivityTimer = () => {
      lastActivityRef.current = new Date();
      
      // Clear existing timeouts
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      
      // Hide warning if showing
      setShowInactivityWarning(false);
      
      // Set warning for 13 minutes (2 minutes before auto-stop)
      warningTimeoutRef.current = setTimeout(() => {
        setShowInactivityWarning(true);
      }, 13 * 60 * 1000);
      
      // Set auto-stop for 15 minutes
      inactivityTimeoutRef.current = setTimeout(() => {
        endSession('Auto-stopped due to 15 minutes of inactivity');
        toast.info('Study session stopped due to inactivity');
      }, 15 * 60 * 1000);
    };

    // Activity event listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    // Initial timer setup
    resetInactivityTimer();

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [isActive, isPaused]);

  const cleanupAndLoadActiveSession = async () => {
    try {
      if (!user) return;

      console.log('🧹 [SESSION TRACKER] Starting cleanup and load for user:', user.id);

      // First, cleanup any orphaned active sessions (older than 4 hours)
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
      
      const { error: cleanupError } = await supabase
        .from('study_sessions')
        .update({
          is_active: false,
          end_time: new Date().toISOString(),
          notes: 'Auto-ended during cleanup - session was orphaned'
        })
        .eq('user_id', user.id)
        .eq('is_active', true)
        .lt('start_time', fourHoursAgo);

      if (cleanupError) {
        console.error('❌ [SESSION TRACKER] Error during cleanup:', cleanupError);
      } else {
        console.log('🧹 [SESSION TRACKER] Cleaned up orphaned sessions');
      }

      // Now try to load the most recent active session
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ [SESSION TRACKER] Error loading active session:', error);
        return;
      }

      if (data) {
        const startTime = new Date(data.start_time);
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        
        // Check if session is too old (more than 4 hours)
        if (elapsed > 4 * 60 * 60) {
          console.log('⚠️ [SESSION TRACKER] Session too old, ending it');
          await endSessionById(data.id);
          return;
        }
        
        setIsActive(true);
        setCurrentSessionId(data.id);
        setCurrentTitle(data.title || '');
        setCurrentSubject(data.subject || '');
        setActivityType(data.activity_type || 'general');
        setElapsedSeconds(elapsed);
        
        console.log('✅ [SESSION TRACKER] Loaded active session:', {
          id: data.id.slice(0, 8),
          title: data.title,
          elapsed: elapsed + 's'
        });
      } else {
        console.log('📊 [SESSION TRACKER] No active session found');
      }
    } catch (error) {
      console.error('❌ [SESSION TRACKER] Error in cleanup and load:', error);
    }
  };

  const endSessionById = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('study_sessions')
        .update({
          end_time: new Date().toISOString(),
          is_active: false,
          notes: 'Auto-ended during cleanup'
        })
        .eq('id', sessionId);

      if (error) throw error;
      console.log('🔚 [SESSION TRACKER] Ended session:', sessionId.slice(0, 8));
    } catch (error) {
      console.error('❌ [SESSION TRACKER] Error ending session:', error);
    }
  };

  const startSession = useCallback(async (sessionData: SessionData) => {
    try {
      if (!user) throw new Error('Not authenticated');

      console.log('🎯 [SESSION TRACKER] Starting session:', sessionData);

      // End any existing active session first
      if (isActive && currentSessionId) {
        await endSession('Starting new session');
      }

      // Also cleanup any other active sessions for this user
      await supabase
        .from('study_sessions')
        .update({
          is_active: false,
          end_time: new Date().toISOString(),
          notes: 'Auto-ended when starting new session'
        })
        .eq('user_id', user.id)
        .eq('is_active', true);

      const newSessionData = {
        user_id: user.id,
        title: sessionData.title,
        subject: sessionData.subject,
        notes: `Session for: ${sessionData.title}`,
        start_time: new Date().toISOString(),
        is_active: true,
        activity_type: sessionData.activityType,
        auto_created: false
      };

      const { data, error } = await supabase
        .from('study_sessions')
        .insert(newSessionData)
        .select()
        .single();

      if (error) {
        console.error('❌ [SESSION TRACKER] Database error:', error);
        throw error;
      }

      setIsActive(true);
      setIsPaused(false);
      setElapsedSeconds(0);
      setCurrentSessionId(data.id);
      setCurrentTitle(sessionData.title);
      setCurrentSubject(sessionData.subject || '');
      setActivityType(sessionData.activityType);
      setShowInactivityWarning(false);
      lastActivityRef.current = new Date();

      console.log('✅ [SESSION TRACKER] Started session successfully:', {
        id: data.id.slice(0, 8),
        title: sessionData.title,
        type: sessionData.activityType
      });

      toast.success('Study session started!');
      return data.id;
    } catch (error) {
      console.error('❌ [SESSION TRACKER] Error starting session:', error);
      toast.error('Failed to start session');
      throw error;
    }
  }, [user, isActive, currentSessionId]);

  const endSession = useCallback(async (reason = 'Manual end') => {
    try {
      if (!currentSessionId || !user) return;

      const endTime = new Date();
      const duration = elapsedSeconds;

      const { error } = await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration: Math.round(duration / 60), // Convert to minutes
          is_active: false,
          notes: `Session ended: ${reason}`
        })
        .eq('id', currentSessionId);

      if (error) throw error;

      // Clear all timers
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

      // Reset state
      setIsActive(false);
      setIsPaused(false);
      setElapsedSeconds(0);
      setCurrentSessionId(null);
      setCurrentTitle('');
      setCurrentSubject('');
      setActivityType('general');
      setShowInactivityWarning(false);

      console.log('⏹️ [SESSION TRACKER] Ended session:', {
        duration: `${Math.floor(duration / 60)}min`,
        reason
      });

      if (reason.includes('Manual')) {
        toast.success('Study session ended');
      }

    } catch (error) {
      console.error('❌ [SESSION TRACKER] Error ending session:', error);
      toast.error('Failed to end session');
      throw error;
    }
  }, [currentSessionId, user, elapsedSeconds]);

  const togglePause = useCallback(() => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      toast.info('Session paused');
    } else {
      toast.info('Session resumed');
    }
  }, [isPaused]);

  const dismissInactivityWarning = useCallback(() => {
    setShowInactivityWarning(false);
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  return {
    isActive,
    isPaused,
    elapsedSeconds,
    currentSessionId,
    currentTitle,
    currentSubject,
    activityType,
    showInactivityWarning,
    startSession,
    endSession,
    togglePause,
    dismissInactivityWarning
  };
};
