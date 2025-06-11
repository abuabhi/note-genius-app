
import { useEffect, useState, useCallback, useRef } from "react";
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";

// Global channel management to prevent multiple subscriptions
const globalChannels = new Map<string, any>();

export const useOptimizedRealtimeSync = (note: Note) => {
  const [realtimeNote, setRealtimeNote] = useState<Note>(note);
  const [refreshKey, setRefreshKey] = useState(0);
  const channelRef = useRef<any>(null);
  
  // Force refresh function
  const forceRefresh = useCallback(() => {
    console.log("🔄 Forcing component refresh");
    setRefreshKey(prev => prev + 1);
  }, []);

  // Debounced update function to prevent excessive re-renders
  const debouncedUpdate = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (updatedNote: Note) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setRealtimeNote(updatedNote);
          forceRefresh();
        }, 100); // 100ms debounce
      };
    })(),
    [forceRefresh]
  );

  // Set up real-time subscription with optimizations
  useEffect(() => {
    const channelId = `note_${note.id}_optimized`;
    
    // Check if channel already exists globally
    if (globalChannels.has(channelId)) {
      console.log("📡 Reusing existing real-time channel for note:", note.id);
      channelRef.current = globalChannels.get(channelId);
      return;
    }

    console.log("📡 Setting up optimized real-time subscription for note:", note.id);
    
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${note.id}`
        },
        (payload) => {
          console.log("📡 Real-time update received:", {
            noteId: note.id,
            hasEnhancements: !!(
              payload.new.improved_content || 
              payload.new.summary || 
              payload.new.key_points || 
              payload.new.markdown_content
            )
          });
          
          // Create updated note object
          const updatedNote: Note = {
            ...realtimeNote,
            ...payload.new,
            date: new Date(payload.new.date).toISOString().split('T')[0],
            subject: payload.new.subject || realtimeNote.subject || 'Uncategorized',
            tags: realtimeNote.tags || []
          };
          
          // Update cache
          const cacheKey = `note_${note.id}`;
          sessionStorage.setItem(cacheKey, JSON.stringify(updatedNote));
          
          // Debounced update to prevent excessive re-renders
          debouncedUpdate(updatedNote);
        }
      )
      .subscribe();

    channelRef.current = channel;
    globalChannels.set(channelId, channel);

    return () => {
      console.log("📡 Cleaning up real-time subscription for note:", note.id);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        globalChannels.delete(channelId);
        channelRef.current = null;
      }
    };
  }, [note.id, realtimeNote, debouncedUpdate]);

  return {
    currentNote: realtimeNote,
    refreshKey,
    forceRefresh,
    setRealtimeNote
  };
};
