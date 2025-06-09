
import { useEffect, useState, useCallback } from "react";
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";

/**
 * Simplified real-time sync hook that prevents automatic summary generation
 */
export const useSimpleRealtimeSync = (initialNote: Note) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentNote, setCurrentNote] = useState<Note>(initialNote);
  
  // Force refresh function
  const forceRefresh = useCallback(() => {
    console.log("🔄 Forcing component refresh");
    setRefreshKey(prev => prev + 1);
  }, []);

  // Update local note when prop changes
  useEffect(() => {
    setCurrentNote(initialNote);
  }, [initialNote]);

  // Set up real-time subscription for note updates
  useEffect(() => {
    console.log("📡 Setting up simplified real-time subscription for note:", initialNote.id);
    
    const channel = supabase
      .channel(`note_${initialNote.id}_simple_sync`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${initialNote.id}`
        },
        (payload) => {
          console.log("📡 Real-time note update received:", {
            noteId: initialNote.id,
            enhancementFields: {
              improved_content: !!payload.new.improved_content,
              summary: !!payload.new.summary,
              summary_status: payload.new.summary_status,
              key_points: !!payload.new.key_points,
              markdown_content: !!payload.new.markdown_content
            }
          });
          
          // CRITICAL FIX: Properly handle summary status to prevent infinite loops
          const updatedNote: Note = {
            ...currentNote,
            ...payload.new,
            // Ensure proper date formatting
            date: payload.new.created_at ? new Date(payload.new.created_at).toISOString().split('T')[0] : currentNote.date,
            // Map subject to category for backward compatibility
            category: payload.new.subject || currentNote.category || 'Uncategorized',
            // Ensure tags are preserved
            tags: currentNote.tags || [],
            // CRITICAL: Ensure summary_status is properly set
            summary_status: (payload.new.summary_status as 'pending' | 'generating' | 'completed' | 'failed') || 'completed'
          };
          
          setCurrentNote(updatedNote);
          
          // Force a UI refresh
          forceRefresh();
        }
      )
      .subscribe();

    return () => {
      console.log("📡 Cleaning up simplified real-time subscription for note:", initialNote.id);
      supabase.removeChannel(channel);
    };
  }, [initialNote.id, currentNote, forceRefresh]);

  return {
    currentNote,
    refreshKey,
    forceRefresh
  };
};
