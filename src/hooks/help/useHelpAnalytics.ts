
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { HelpContent } from '@/types/help';

// Generate a unique session ID for grouping related analytics events
const generateSessionId = () => `help_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useHelpAnalytics = () => {
  const { user } = useAuth();
  const [sessionId] = useState(() => generateSessionId());
  const sessionStartTime = useRef<Date>(new Date());
  const currentSessionRef = useRef<string | null>(null);

  // Track help content view
  const trackContentView = useCallback(async (content: HelpContent, context?: string) => {
    if (!user) return;

    try {
      await supabase.from('help_content_analytics').insert({
        user_id: user.id,
        content_id: content.id,
        event_type: 'view',
        context: context || null,
        session_id: sessionId,
        metadata: {
          title: content.title,
          category: content.category,
          has_video: !!content.videoContent,
          priority: content.priority
        }
      });
    } catch (error) {
      console.error('Error tracking content view:', error);
    }
  }, [user, sessionId]);

  // Track video play/complete
  const trackVideoEvent = useCallback(async (
    content: HelpContent, 
    eventType: 'video_play' | 'video_complete',
    progress?: number,
    context?: string
  ) => {
    if (!user) return;

    try {
      await supabase.from('help_content_analytics').insert({
        user_id: user.id,
        content_id: content.id,
        event_type: eventType,
        context: context || null,
        session_id: sessionId,
        metadata: {
          title: content.title,
          video_duration: content.videoContent?.duration,
          progress: progress || 0
        }
      });
    } catch (error) {
      console.error('Error tracking video event:', error);
    }
  }, [user, sessionId]);

  // Track search behavior
  const trackSearch = useCallback(async (
    searchTerm: string,
    resultsCount: number,
    context?: string
  ) => {
    if (!user) return;

    try {
      await supabase.from('help_search_analytics').insert({
        user_id: user.id,
        search_term: searchTerm,
        results_count: resultsCount,
        context: context || null,
        session_id: sessionId
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }, [user, sessionId]);

  // Track search result selection
  const trackSearchResultClick = useCallback(async (
    searchTerm: string,
    selectedContentId: string,
    context?: string
  ) => {
    if (!user) return;

    try {
      await supabase.from('help_search_analytics').insert({
        user_id: user.id,
        search_term: searchTerm,
        results_count: 0, // We don't track count here, just selection
        selected_result_id: selectedContentId,
        context: context || null,
        session_id: sessionId
      });
    } catch (error) {
      console.error('Error tracking search result click:', error);
    }
  }, [user, sessionId]);

  // Start help session
  const startHelpSession = useCallback(async (context?: string) => {
    if (!user || currentSessionRef.current) return;

    try {
      const { data } = await supabase.from('help_session_analytics').insert({
        user_id: user.id,
        session_id: sessionId,
        context: context || null
      }).select().single();

      if (data) {
        currentSessionRef.current = data.id;
        sessionStartTime.current = new Date();
      }
    } catch (error) {
      console.error('Error starting help session:', error);
    }
  }, [user, sessionId]);

  // End help session
  const endHelpSession = useCallback(async () => {
    if (!user || !currentSessionRef.current) return;

    try {
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - sessionStartTime.current.getTime()) / 1000);

      await supabase.from('help_session_analytics')
        .update({
          end_time: endTime.toISOString(),
          total_duration_seconds: duration
        })
        .eq('id', currentSessionRef.current);

      currentSessionRef.current = null;
    } catch (error) {
      console.error('Error ending help session:', error);
    }
  }, [user]);

  // Update session stats
  const updateSessionStats = useCallback(async (updates: {
    videos_watched?: number;
    searches_performed?: number;
    pages_visited?: number;
  }) => {
    if (!user || !currentSessionRef.current) return;

    try {
      await supabase.from('help_session_analytics')
        .update(updates)
        .eq('id', currentSessionRef.current);
    } catch (error) {
      console.error('Error updating session stats:', error);
    }
  }, [user]);

  // Auto-end session on component unmount
  useEffect(() => {
    return () => {
      endHelpSession();
    };
  }, [endHelpSession]);

  return {
    trackContentView,
    trackVideoEvent,
    trackSearch,
    trackSearchResultClick,
    startHelpSession,
    endHelpSession,
    updateSessionStats,
    sessionId
  };
};
