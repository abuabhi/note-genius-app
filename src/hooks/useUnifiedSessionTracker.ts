import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [currentSubject, setCurrentSubject] = useState<string>('');
  const [activityType, setActivityType] = useState<string>('general');
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutWarningRef = useRef<NodeJS.Timeout | null>(null);
  const autoEndRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());

  // Detect if user is on a study-related page
  const isOnStudyPage = ['/flashcards', '/notes', '/quiz', '/study-planner'].some(path => 
    location.pathname.startsWith(path)
  );

  // Load active session on mount
  useEffect(() => {
    if (user) {
      loadActiveSession();
    }
  }, [user]);

  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        
        // Update last activity
        lastActivityRef.current = new Date();
        
        // Check for timeout warning (after 3.5 hours)
        if (elapsedSeconds > 3.5 * 60 * 60 && !showTimeoutWarning) {
          setShowTimeoutWarning(true);
          
          // Auto-end after 4 hours total
          autoEndRef.current = setTimeout(() => {
            endSession('Auto-ended due to inactivity');
          }, 30 * 60 * 1000); // 30 minutes after warning
        }
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
  }, [isActive, isPaused, elapsedSeconds, showTimeoutWarning]);

  const loadActiveSession = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading active session:', error);
        return;
      }

      if (data) {
        const startTime = new Date(data.start_time);
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        
        setIsActive(true);
        setCurrentSessionId(data.id);
        setCurrentTitle(data.title || '');
        setCurrentSubject(data.subject || '');
        setActivityType(data.activity_type || 'general');
        setElapsedSeconds(elapsed);
        
        console.log('🔄 Loaded active session:', {
          id: data.id,
          title: data.title,
          elapsed: elapsed + 's'
        });
      }
    } catch (error) {
      console.error('Error loading active session:', error);
    }
  };

  const startSession = useCallback(async (sessionData: SessionData) => {
    try {
      if (!user) throw new Error('Not authenticated');

      console.log('🎯 [UNIFIED SESSION] Starting session:', sessionData);

      // End any existing active session first
      if (isActive && currentSessionId) {
        await endSession('Starting new session');
      }

      // Create notes field with session context and metadata - store study plan info in notes instead of FK
      let notesContent = `Session for: ${sessionData.title}`;
      if (sessionData.studyPlanId) {
        notesContent += ` | Study Plan ID: ${sessionData.studyPlanId}`;
      }
      if (sessionData.flashcardSetId) {
        notesContent += ` | Flashcard Set ID: ${sessionData.flashcardSetId}`;
      }

      const newSessionData = {
        user_id: user.id,
        title: sessionData.title,
        subject: sessionData.subject,
        notes: notesContent,
        start_time: new Date().toISOString(),
        is_active: true,
        activity_type: sessionData.activityType,
        auto_created: false
        // Remove flashcard_set_id to avoid foreign key constraint
      };

      const { data, error } = await supabase
        .from('study_sessions')
        .insert(newSessionData)
        .select()
        .single();

      if (error) {
        console.error('❌ [UNIFIED SESSION] Database error:', error);
        throw error;
      }

      setIsActive(true);
      setIsPaused(false);
      setElapsedSeconds(0);
      setCurrentSessionId(data.id);
      setCurrentTitle(sessionData.title);
      setCurrentSubject(sessionData.subject || '');
      setActivityType(sessionData.activityType);
      setShowTimeoutWarning(false);
      lastActivityRef.current = new Date();

      console.log('✅ [UNIFIED SESSION] Started session successfully:', {
        id: data.id,
        title: sessionData.title,
        type: sessionData.activityType
      });

      return data.id;
    } catch (error) {
      console.error('❌ [UNIFIED SESSION] Error starting session:', error);
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
      if (timeoutWarningRef.current) clearTimeout(timeoutWarningRef.current);
      if (autoEndRef.current) clearTimeout(autoEndRef.current);

      // Reset state
      setIsActive(false);
      setIsPaused(false);
      setElapsedSeconds(0);
      setCurrentSessionId(null);
      setCurrentTitle('');
      setCurrentSubject('');
      setActivityType('general');
      setShowTimeoutWarning(false);

      console.log('⏹️ Ended session:', {
        duration: `${Math.floor(duration / 60)}min`,
        reason
      });

    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }, [currentSessionId, user, elapsedSeconds]);

  const togglePause = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  const dismissTimeoutWarning = useCallback(() => {
    setShowTimeoutWarning(false);
    if (autoEndRef.current) {
      clearTimeout(autoEndRef.current);
      autoEndRef.current = null;
    }
  }, []);

  // Activity recording methods for flashcard study compatibility
  const recordActivity = useCallback(() => {
    lastActivityRef.current = new Date();
    console.log('📊 Activity recorded for unified session');
  }, []);

  const updateSessionActivity = useCallback((activityData?: any) => {
    recordActivity();
    if (activityData) {
      console.log('📊 Session activity updated:', activityData);
    }
  }, [recordActivity]);

  return {
    isActive,
    isPaused,
    elapsedSeconds,
    currentSessionId,
    currentTitle,
    currentSubject,
    activityType,
    isOnStudyPage,
    showTimeoutWarning,
    startSession,
    endSession,
    togglePause,
    dismissTimeoutWarning,
    recordActivity,
    updateSessionActivity
  };
};
