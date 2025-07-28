import { useState, useEffect, useCallback, useRef } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { supabase } from '@/integrations/supabase/client';
import { useTabVisibility } from './useTabVisibility';

// Optimized sync intervals
const SYNC_INTERVALS = {
  development: 120000, // 2 minutes in dev (increased from 30s)
  production: 300000   // 5 minutes in production (increased from 30s)
};

const isDevelopment = process.env.NODE_ENV === 'development';

export const useOptimizedRealtimeSync = (initialNote: Note) => {
  const { updateNote } = useOptimizedNotes();
  const isTabVisible = useTabVisibility();
  const [currentNote, setCurrentNote] = useState<Note>(initialNote);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(Date.now());

  // Debounced sync function to prevent rapid calls
  const syncFromDatabase = useCallback(async () => {
    // Prevent rapid sync calls (minimum 30s between syncs)
    const now = Date.now();
    if (now - lastSyncRef.current < 30000) {
      return;
    }
    lastSyncRef.current = now;

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', initialNote.id)
        .single();

      if (error) {
        console.error('Error syncing note:', error);
        return;
      }

      if (data) {
        const syncedNote: Note = {
          ...initialNote,
          title: data.title || initialNote.title,
          content: data.content || initialNote.content,
          subject: data.subject || initialNote.subject,
          description: data.description || initialNote.description,
          summary: data.summary,
          summary_status: data.summary_status as any,
          key_points: data.key_points,
          markdown_content: data.markdown_content,
          questions_content: data.questions_content
        };

        setCurrentNote(syncedNote);
        setLastSyncTime(Date.now());
      }
    } catch (error) {
      console.error('Unexpected error syncing note:', error);
    }
  }, [initialNote]);

  // Force refresh from database (immediate)
  const forceRefresh = useCallback(() => {
    lastSyncRef.current = 0; // Reset debounce
    syncFromDatabase();
  }, [syncFromDatabase]);

  // Optimized periodic sync with tab visibility
  useEffect(() => {
    if (!isTabVisible) {
      // Clear interval when tab is not visible
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Set up interval based on environment and tab visibility
    const interval = isDevelopment 
      ? SYNC_INTERVALS.development 
      : SYNC_INTERVALS.production;
    
    intervalRef.current = setInterval(() => {
      if (isTabVisible) {
        syncFromDatabase();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [syncFromDatabase, isTabVisible]);

  return {
    currentNote,
    lastSyncTime,
    forceRefresh,
    refreshKey: lastSyncTime,
    isTabVisible
  };
};