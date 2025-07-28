
import { useEffect, useState, useCallback, useRef } from "react";
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";

interface OptimizedStudySyncResult {
  currentNote: Note;
  refreshKey: number;
  forceRefresh: () => void;
}

// Global cache for real-time updates to prevent duplicate subscriptions
const studyChannelCache = new Map<string, any>();

export const useOptimizedStudySync = (initialNote: Note): OptimizedStudySyncResult => {
  const [currentNote, setCurrentNote] = useState<Note>(initialNote);
  const [refreshKey, setRefreshKey] = useState(0);
  const channelRef = useRef<any>(null);
  
  // Optimized refresh function
  const forceRefresh = useCallback(() => {
    console.log("🔄 Force refresh triggered");
    setRefreshKey(prev => prev + 1);
  }, []);

  // Throttled update to prevent excessive re-renders
  const throttledUpdate = useCallback(
    (() => {
      let lastUpdate = 0;
      return (updatedNote: Note) => {
        const now = Date.now();
        if (now - lastUpdate > 100) { // Throttle to max 10 updates per second
          setCurrentNote(updatedNote);
          forceRefresh();
          lastUpdate = now;
        }
      };
    })(),
    [forceRefresh]
  );

  // Update local note when prop changes
  useEffect(() => {
    setCurrentNote(initialNote);
  }, [initialNote]);

  // Optimized real-time subscription
  useEffect(() => {
    const channelId = `optimized_study_${initialNote.id}`;
    
    // Reuse existing channel if available
    if (studyChannelCache.has(channelId)) {
      console.log("📡 Reusing existing study channel:", channelId);
      channelRef.current = studyChannelCache.get(channelId);
      return;
    }

    console.log("📡 Creating new optimized study channel:", channelId);
    
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${initialNote.id}`
        },
        (payload) => {
          console.log("📡 Optimized study update received:", {
            noteId: initialNote.id,
            fieldsUpdated: Object.keys(payload.new),
            hasEnhancements: !!(
              payload.new.improved_content || 
              payload.new.summary || 
              payload.new.key_points ||
              payload.new.markdown_content ||
              payload.new.enriched_content
            )
          });
          
          // Create updated note with proper field mapping
          const updatedNote: Note = {
            ...currentNote,
            ...payload.new,
            // Ensure proper date formatting
            date: payload.new.date ? new Date(payload.new.date).toISOString().split('T')[0] : currentNote.date,
            // Map subject properly
            subject: payload.new.subject || currentNote.subject || 'Uncategorized',
            // Preserve tags
            tags: currentNote.tags || [],
            // Ensure all status fields have proper defaults
            summary_status: (payload.new.summary_status as 'pending' | 'generating' | 'completed' | 'failed') || 'completed',
            key_points_status: (payload.new.key_points_status as 'pending' | 'generating' | 'completed' | 'failed') || 'completed',
            markdown_content_status: (payload.new.markdown_content_status as 'pending' | 'generating' | 'completed' | 'failed') || 'completed',
            questions_status: (payload.new.questions_status as 'pending' | 'generating' | 'completed' | 'failed') || 'completed',
            enriched_status: (payload.new.enriched_status as 'pending' | 'generating' | 'completed' | 'failed') || 'completed'
          };
          
          // Use throttled update to prevent excessive re-renders
          throttledUpdate(updatedNote);
        }
      )
      .subscribe();

    channelRef.current = channel;
    studyChannelCache.set(channelId, channel);

    return () => {
      console.log("📡 Cleaning up optimized study channel:", channelId);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        studyChannelCache.delete(channelId);
        channelRef.current = null;
      }
    };
  }, [initialNote.id, currentNote, throttledUpdate]);

  return {
    currentNote,
    refreshKey,
    forceRefresh
  };
};
