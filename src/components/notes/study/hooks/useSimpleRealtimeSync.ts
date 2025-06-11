
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

  // CRITICAL FIX: Reset stuck summary states on note load
  useEffect(() => {
    const fixStuckSummaryStatus = async () => {
      // Check if summary is stuck in generating/pending state without actual generation
      const isStuckState = (
        (currentNote.summary_status === 'pending' || currentNote.summary_status === 'generating') &&
        (!currentNote.summary || currentNote.summary.trim().length === 0)
      );

      if (isStuckState) {
        console.log("🔧 Detected stuck summary status, fixing...");
        
        try {
          const { error } = await supabase
            .from('notes')
            .update({ 
              summary_status: 'completed',
              summary: ''
            })
            .eq('id', currentNote.id);

          if (error) {
            console.error("❌ Failed to fix stuck summary status:", error);
          } else {
            console.log("✅ Fixed stuck summary status");
            // Update local state
            setCurrentNote(prev => ({
              ...prev,
              summary_status: 'completed',
              summary: ''
            }));
            forceRefresh();
          }
        } catch (error) {
          console.error("❌ Exception fixing summary status:", error);
        }
      }
    };

    // Run the fix after a short delay to ensure component is mounted
    const timeoutId = setTimeout(fixStuckSummaryStatus, 500);
    return () => clearTimeout(timeoutId);
  }, [currentNote.id, currentNote.summary_status, currentNote.summary, forceRefresh]);

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
            // Map subject to subject for consistency
            subject: payload.new.subject || currentNote.subject || 'Uncategorized',
            // Ensure tags are preserved
            tags: currentNote.tags || [],
            // CRITICAL: Ensure summary_status is properly set and validated
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
