
import { useEffect, useState, useCallback, useRef } from "react";
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";

export const useSimpleRealtimeSync = (note: Note) => {
  const [currentNote, setCurrentNote] = useState<Note>(note);
  const [refreshKey, setRefreshKey] = useState(0);
  const isSubscribed = useRef(false);
  
  // Force refresh function
  const forceRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Update note when prop changes
  useEffect(() => {
    setCurrentNote(note);
  }, [note]);

  // Simplified real-time subscription
  useEffect(() => {
    if (isSubscribed.current) return;
    
    console.log("📡 Setting up simple real-time sync for note:", note.id);
    
    const channel = supabase
      .channel(`simple_note_${note.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${note.id}`
        },
        (payload) => {
          console.log("📡 Note update received");
          
          const updatedNote: Note = {
            ...currentNote,
            ...payload.new,
            date: new Date(payload.new.date).toISOString().split('T')[0],
            category: payload.new.subject || currentNote.category || 'Uncategorized',
            tags: currentNote.tags || []
          };
          
          setCurrentNote(updatedNote);
          forceRefresh();
        }
      )
      .subscribe();

    isSubscribed.current = true;

    return () => {
      console.log("📡 Cleaning up simple real-time sync");
      supabase.removeChannel(channel);
      isSubscribed.current = false;
    };
  }, [note.id, currentNote, forceRefresh]);

  return {
    currentNote,
    refreshKey,
    forceRefresh
  };
};
