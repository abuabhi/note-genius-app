
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

// Hook to sync sessions across tabs and prevent conflicts
export const useRealtimeSessionSync = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Listen for session changes from other tabs
  const handleStorageChange = useCallback((e: StorageEvent) => {
    if (e.key === 'active_session_tab' && e.newValue !== window.name) {
      // Another tab has taken over session tracking
      console.log('Another tab is now tracking sessions, stopping local tracking');
      // This would integrate with your session tracker to pause/end local tracking
    }
  }, []);

  // Claim session tracking for this tab
  const claimSessionTracking = useCallback(() => {
    if (!window.name) {
      window.name = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    localStorage.setItem('active_session_tab', window.name);
    localStorage.setItem('session_tab_timestamp', Date.now().toString());
  }, []);

  // Check if this tab should be tracking sessions
  const shouldTrackSessions = useCallback(() => {
    const activeTab = localStorage.getItem('active_session_tab');
    const timestamp = localStorage.getItem('session_tab_timestamp');
    
    // If no active tab or timestamp is old (tab likely closed), claim tracking
    if (!activeTab || !timestamp || Date.now() - parseInt(timestamp) > 60000) {
      claimSessionTracking();
      return true;
    }
    
    return activeTab === window.name;
  }, [claimSessionTracking]);

  // Listen for database changes to sync across devices
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('session_sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_sessions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Session change detected:', payload);
          // Invalidate analytics queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['consolidated-analytics'] });
          queryClient.invalidateQueries({ queryKey: ['unified-study-stats'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, queryClient]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [handleStorageChange]);

  // Update timestamp periodically to show this tab is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (shouldTrackSessions()) {
        localStorage.setItem('session_tab_timestamp', Date.now().toString());
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [shouldTrackSessions]);

  return {
    shouldTrackSessions,
    claimSessionTracking
  };
};
