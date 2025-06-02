
import { useEffect, useState, useCallback } from "react";
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { useNotes } from "@/contexts/NoteContext";

/**
 * Hook for managing real-time note synchronization
 */
export const useRealtimeNoteSync = (note: Note) => {
  const { notes, setNotes } = useNotes();
  const [refreshKey, setRefreshKey] = useState(0);
  const [realtimeNote, setRealtimeNote] = useState<Note>(note);
  
  // Get the most up-to-date note data from context or realtime updates
  const currentNote = notes.find(n => n.id === note.id) || realtimeNote;
  
  // Force refresh function
  const forceRefresh = useCallback(() => {
    console.log("🔄 Forcing component refresh");
    setRefreshKey(prev => prev + 1);
  }, []);

  // Set up real-time subscription for note updates
  useEffect(() => {
    console.log("📡 Setting up real-time subscription for note:", note.id);
    
    const channel = supabase
      .channel(`note_${note.id}_changes`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${note.id}`
        },
        (payload) => {
          console.log("📡 Real-time note update received:", {
            noteId: note.id,
            newData: payload.new,
            enhancementFields: {
              improved_content: !!payload.new.improved_content,
              summary: !!payload.new.summary,
              key_points: !!payload.new.key_points,
              markdown_content: !!payload.new.markdown_content
            }
          });
          
          // Create updated note object maintaining the type structure
          const updatedNote: Note = {
            ...currentNote,
            ...payload.new,
            // Ensure proper date formatting
            date: new Date(payload.new.date).toISOString().split('T')[0],
            // Map subject to category for backward compatibility
            category: payload.new.subject || currentNote.category || 'Uncategorized',
            // Ensure tags are preserved
            tags: currentNote.tags || []
          };
          
          setRealtimeNote(updatedNote);
          
          // Update the notes context as well
          setNotes(prevNotes => 
            prevNotes.map(n => n.id === note.id ? updatedNote : n)
          );
          
          // Force a UI refresh
          forceRefresh();
        }
      )
      .subscribe();

    return () => {
      console.log("📡 Cleaning up real-time subscription for note:", note.id);
      supabase.removeChannel(channel);
    };
  }, [note.id, currentNote, setNotes, forceRefresh]);

  return {
    currentNote,
    refreshKey,
    forceRefresh,
    setRealtimeNote
  };
};
